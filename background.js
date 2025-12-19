(() => {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  const STORAGE_KEY = 'ibd_selectedImages_v1';
  const QUALITY_KEY = 'ibd_jpegQuality_v1';

  const inFlight = new Set();

  const DEFAULT_FETCH_TIMEOUT_MS = 25000;

  function isValidHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function clampQuality(q) {
    const n = Number(q);
    if (!Number.isFinite(n)) return 90;
    return Math.min(100, Math.max(10, Math.round(n)));
  }

  async function fetchAsBlob(url, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status})`);
    }

    return await res.blob();
  }

  async function blobToJpegBlob(blob, qualityPercent) {
    const quality = clampQuality(qualityPercent) / 100;

    let bitmap;
    try {
      bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.drawImage(bitmap, 0, 0);

      if (typeof canvas.convertToBlob === 'function') {
        return await canvas.convertToBlob({ type: 'image/jpeg', quality });
      }

      const b = await new Promise((resolve) => {
        canvas.toBlob((out) => resolve(out), 'image/jpeg', quality);
      });

      if (!b) throw new Error('JPEG conversion failed.');
      return b;
    } finally {
      try {
        if (bitmap && typeof bitmap.close === 'function') bitmap.close();
      } catch (_) {
      }
    }
  }

  async function downloadJpegBlob(jpegBlob, filename, downloadLocation) {
    const objectUrl = URL.createObjectURL(jpegBlob);

    try {
      const downloadId = await api.downloads.download({
        url: objectUrl,
        filename,
        saveAs: downloadLocation === 'ask',
        conflictAction: 'uniquify',
      });
      return downloadId;
    } finally {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (_) {
        }
      }, 5000); // Reduced from 60 seconds to 5 seconds
    }
  }

  async function clearSelection() {
    await api.storage.local.set({ [STORAGE_KEY]: [] });
  }

  async function getQualityFromStorage(fallback) {
    const stored = await api.storage.local.get(QUALITY_KEY);
    const q = stored[QUALITY_KEY];
    return clampQuality(q ?? fallback ?? 90);
  }

  async function handleDownloadSelected(payload) {
    const urls = payload && Array.isArray(payload.urls) ? payload.urls : [];
    const inputQuality = payload && payload.quality != null ? payload.quality : undefined;
    const downloadLocation = payload && payload.downloadLocation ? payload.downloadLocation : 'default';
    const timeoutMs = payload && payload.timeoutMs != null ? Number(payload.timeoutMs) : undefined;

    const quality = clampQuality(inputQuality ?? (await getQualityFromStorage(90)));

    const uniqueUrls = Array.from(
      new Set(
        urls
          .map((u) => (typeof u === 'string' ? u.trim() : ''))
          .filter((u) => isValidHttpUrl(u))
      )
    );

    if (!uniqueUrls.length) {
      return { ok: false, error: 'No valid image URLs to download.' };
    }

    const batchKey = uniqueUrls.join('|');
    if (inFlight.has(batchKey)) {
      return { ok: false, error: 'Download already in progress.' };
    }

    inFlight.add(batchKey);

    try {
      const failures = [];

      for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        const filename = `image_${i + 1}.jpg`;

        const perUrlKey = `url:${url}`;
        if (inFlight.has(perUrlKey)) {
          continue;
        }
        inFlight.add(perUrlKey);

        try {
          try {
            const blob = await fetchAsBlob(url, timeoutMs);
            const jpeg = await blobToJpegBlob(blob, quality);
            await downloadJpegBlob(jpeg, filename, downloadLocation);
            
            // Immediately clean up blob references to free memory
            if (blob && typeof blob.close === 'function') {
              blob.close();
            }
            if (jpeg && typeof jpeg.close === 'function') {
              jpeg.close();
            }
          } catch (err) {
            const msg = err && err.name === 'AbortError' ? 'Fetch timed out.' : err && err.message ? err.message : 'Download failed.';
            failures.push({ url, error: msg });
          }
        } finally {
          inFlight.delete(perUrlKey);
        }
      }

      await clearSelection();

      if (failures.length) {
        return {
          ok: false,
          error: `Some images could not be processed. (CORS, blocked image, or timeout may be the cause.)`,
          failures,
        };
      }

      return { ok: true };
    } catch (err) {
      const msg = err && err.name === 'AbortError' ? 'Fetch timed out.' : err && err.message ? err.message : 'Download failed.';
      return { ok: false, error: msg + ' (CORS, blocked image, or timeout may be the cause.)' };
    } finally {
      inFlight.delete(batchKey);
    }
  }

  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'IBD_DOWNLOAD_SELECTED') {
        const result = await handleDownloadSelected(msg.payload);
        sendResponse(result);
        return;
      }
    })();

    return true;
  });
})();
