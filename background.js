(() => {
  const api = browser;

  // Load JSZip for Firefox
  try {
    if (typeof JSZip === 'undefined' && typeof importScripts !== 'undefined') {
      importScripts('jszip.js');
    }
  } catch (e) {
    console.warn('JSZip could not be pre-loaded:', e);
  }

  const STORAGE_KEY = 'ibd_selectedImages_v1';
  const QUALITY_KEY = 'ibd_jpegQuality_v1';
  const FORMAT_KEY = 'ibd_outputFormat_v1';
  const FOLDER_KEY = 'ibd_folderName_v1';
  const USE_SUBFOLDER_KEY = 'ibd_useSubfolder_v1';
  const ASK_LOCATION_KEY = 'ibd_askLocation_v1';
  const BATCH_SIZE_KEY = 'ibd_batchSize_v1';
  const DELAY_KEY = 'ibd_downloadDelay_v1';
  const LAZY_KEY = 'ibd_lazyProcess_v1';
  const LOW_PERF_KEY = 'ibd_lowPerf_v1';
  const NAMING_KEY = 'ibd_namingMode_v1';
  const TEMPLATE_KEY = 'ibd_customTemplate_v1';
  const ZIP_KEY = 'ibd_zipEnabled_v1';
  const ASPECT_RATIO_KEY = 'ibd_aspectRatio_v1';
  const CUSTOM_RATIO_W_KEY = 'ibd_customRatioW_v1';
  const CUSTOM_RATIO_H_KEY = 'ibd_customRatioH_v1';
  const CROP_MODE_KEY = 'ibd_cropMode_v1';
  const inFlight = new Set();
  const DEFAULT_FETCH_TIMEOUT_MS = 25000;

  function isValidHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'data:' || u.protocol === 'blob:';
    } catch (_) { return false; }
  }

  function generateFilename(settings, index, pageTitle, site, originalExt) {
    const { namingMode, customTemplate, format } = settings;
    const ext = format === 'original' ? originalExt : (format === 'jpeg' ? 'jpg' : format);
    const id = String(index + 1).padStart(3, '0');

    let base = 'image';
    if (namingMode === 'auto') {
      base = `${pageTitle}_${id}`;
    } else if (namingMode === 'sequential') {
      base = `image_${id}`;
    } else if (namingMode === 'custom' && customTemplate) {
      base = customTemplate
        .replace(/{site}/g, site)
        .replace(/{title}/g, pageTitle)
        .replace(/{index}/g, id);
    } else {
      base = `image_${id}`;
    }

    // Clean filename
    return base.replace(/[\\/:*?"<>|]/g, '_') + '.' + ext;
  }

  async function fetchAsBlob(url, timeoutMs) {
    // 1. Handle Data URLs manually (avoids fetch overhead and protocol blocks)
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        if (parts.length < 2) throw new Error('Invalid Data URL');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
      } catch (e) {
        console.error('IBD DEBUG: Data URL parse error:', e);
        throw new Error('Failed to parse image data');
      }
    }

    // 2. Try Fetch API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
      if (res.ok) return await res.blob();
      throw new Error(`Fetch failed (${res.status})`);
    } catch (err) {
      console.warn('IBD DEBUG: Fetch failed, trying XHR fallback for:', url, err.message);

      // 3. XHR Fallback (Sometimes more privileged in Firefox extensions)
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.timeout = timeoutMs || DEFAULT_FETCH_TIMEOUT_MS;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
          else reject(new Error(`XHR failed (${xhr.status})`));
        };

        xhr.onerror = () => {
          let msg = 'NetworkError (Check CORS/CSP or Origin)';
          if (url.startsWith('blob:')) msg = 'Blob access denied (Origin mismatch)';
          reject(new Error(msg));
        };

        xhr.ontimeout = () => reject(new Error('Timeout / Aborted'));
        xhr.send();
      });
    } finally { clearTimeout(timeout); }
  }

  async function convertToFormat(blob, format, qualityPercent, aspectRatio, cropMode, customW, customH) {
    if (format === 'original' && aspectRatio === 'original') return blob;
    const quality = (qualityPercent || 90) / 100;
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    let bitmap;
    try {
      bitmap = await createImageBitmap(blob);
      let targetW = bitmap.width;
      let targetH = bitmap.height;

      if (aspectRatio && aspectRatio !== 'original') {
        let ratioW, ratioH;
        if (aspectRatio === '1:1') { ratioW = 1; ratioH = 1; }
        else if (aspectRatio === '4:3') { ratioW = 4; ratioH = 3; }
        else if (aspectRatio === '16:9') { ratioW = 16; ratioH = 9; }
        else if (aspectRatio === 'custom') { ratioW = customW || 1; ratioH = customH || 1; }

        if (ratioW && ratioH) {
          const currentRatio = bitmap.width / bitmap.height;
          const targetRatio = ratioW / ratioH;

          if (cropMode === 'fit') {
            if (currentRatio > targetRatio) {
              targetH = bitmap.width / targetRatio;
            } else {
              targetW = bitmap.height * targetRatio;
            }
          } else { // 'fill' (Center Crop)
            if (currentRatio > targetRatio) {
              targetW = bitmap.height * targetRatio;
            } else {
              targetH = bitmap.width / targetRatio;
            }
          }
        }
      }

      // Try OffscreenCanvas first, fallback to regular canvas
      let canvas, ctx;
      try {
        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(targetW, targetH);
          ctx = canvas.getContext('2d', { alpha: format !== 'jpeg' });
        } else {
          throw new Error('OffscreenCanvas not available');
        }
      } catch (offscreenError) {
        // Fallback to regular canvas (this shouldn't normally happen in service worker, but just in case)
        console.warn('OffscreenCanvas not available, this may cause issues:', offscreenError);
        throw new Error('Canvas operations not available in this context. Please try normal download instead of format conversion.');
      }

      if (aspectRatio && aspectRatio !== 'original' && cropMode === 'fill') {
        const sourceW = targetW;
        const sourceH = targetH;
        const offsetX = (bitmap.width - sourceW) / 2;
        const offsetY = (bitmap.height - sourceH) / 2;
        ctx.drawImage(bitmap, offsetX, offsetY, sourceW, sourceH, 0, 0, targetW, targetH);
      } else if (aspectRatio && aspectRatio !== 'original' && cropMode === 'fit') {
        ctx.fillStyle = (format === 'jpeg') ? '#ffffff' : 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, targetW, targetH);
        const scale = Math.min(targetW / bitmap.width, targetH / bitmap.height);
        const drawW = bitmap.width * scale;
        const drawH = bitmap.height * scale;
        const drawX = (targetW - drawW) / 2;
        const drawY = (targetH - drawH) / 2;
        ctx.drawImage(bitmap, drawX, drawY, drawW, drawH);
      } else {
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      }

      const outBlob = await canvas.convertToBlob({
        type: mimeType,
        quality: (format === 'jpeg' || format === 'webp') ? quality : undefined
      });
      if (!outBlob) throw new Error(`${format.toUpperCase()} conversion failed.`);
      return outBlob;
    } finally { if (bitmap) bitmap.close(); }
  }

  function isVideoUrl(url) {
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    return /\.(mp4|webm|mov|avi|m4v|mkv|ogv|ogg)$/.test(clean);
  }

  function getUrlExtension(url) {
    const clean = url.split('?')[0].split('#')[0];
    return clean.split('.').pop().toLowerCase() || 'jpg';
  }

  async function handleDownloadSelected(payload) {
    const {
      urls = [],
      quality = 90,
      downloadLocation = 'default',
      format = 'original',
      folderName = '',
      batchSize = 5,
      downloadDelay = 100,
      namingMode = 'auto',
      customTemplate = '',
      zipBundle = false,
      aspectRatio = 'original',
      cropMode = 'fill',
      customRatioW = 1,
      customRatioH = 1,
      pageTitle = 'Images',
      site = 'any'
    } = payload;

    const uniqueUrls = Array.from(new Set(urls.filter(isValidHttpUrl)));
    console.log('IBD DEBUG: uniqueUrls count:', uniqueUrls.length);
    if (!uniqueUrls.length) {
      console.warn('IBD DEBUG: No valid URLs found from:', urls.length, 'total urls');
      return { ok: false, error: 'No valid URLs selected (only http, https, data and blob are supported).' };
    }

    const batchKey = uniqueUrls.join('|');
    if (inFlight.has(batchKey)) {
      console.warn('IBD DEBUG: Download already in flight.');
      return { ok: false, error: 'Download is already in progress.' };
    }
    inFlight.add(batchKey);

    const failures = [];
    const isLowPerf = !!payload.lowPerf;
    let finalQuality = quality;
    if (isLowPerf && uniqueUrls.length > 20) finalQuality = Math.max(50, quality - 20);

    console.log('IBD DEBUG: Starting download. zipBundle:', zipBundle, 'JSZip exists:', typeof JSZip !== 'undefined');
    try {
      if (zipBundle && typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        for (let i = 0; i < uniqueUrls.length; i++) {
          const url = uniqueUrls[i];
          try {
            const videoFile = isVideoUrl(url);
            const blob = await fetchAsBlob(url);
            const processed = videoFile ? blob : await convertToFormat(blob, format, finalQuality, aspectRatio, cropMode, customRatioW, customRatioH);
            const ext = videoFile ? getUrlExtension(url) : (format === 'original' ? (getUrlExtension(url) || 'jpg') : (format === 'jpeg' ? 'jpg' : format));
            const filename = generateFilename({ namingMode, customTemplate, format: videoFile ? ext : format }, i, pageTitle, site, ext);
            zip.file(filename, processed);
          } catch (err) {
            console.error('IBD DEBUG: Zip item failure:', url, err);
            failures.push({ url, error: err.message });
          }
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const zipName = (folderName || pageTitle || 'images') + '.zip';
        console.log('IBD DEBUG: Zip generated, size:', content.size);

        const blobUrl = URL.createObjectURL(content);
        try {
          await api.downloads.download({
            url: blobUrl,
            filename: zipName.replace(/[\\/:*?"<>|]/g, '_'),
            saveAs: downloadLocation === 'ask'
          });
        } finally {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        }
      } else {
        // Normal sequential download
        for (let i = 0; i < uniqueUrls.length; i += batchSize) {
          const chunk = uniqueUrls.slice(i, i + batchSize);
          await Promise.all(chunk.map(async (url, idx) => {
            const globalIdx = i + idx;
            const isVideo = isVideoUrl(url);
            const ext = isVideo
              ? getUrlExtension(url)
              : (format === 'original' ? (getUrlExtension(url) || 'jpg') : (format === 'jpeg' ? 'jpg' : format));
            const filenameSettings = isVideo
              ? { namingMode, customTemplate, format: ext }
              : { namingMode, customTemplate, format };
            const filename = generateFilename(filenameSettings, globalIdx, pageTitle, site, ext);
            const finalPath = folderName ? `${folderName.replace(/[\\/:*?"<>|]/g, '_')}/${filename}` : filename;
            let processed = null;
            try {
              // Video: always download directly, no format conversion
              if (isVideo) {
                console.log('IBD DEBUG: Video URL detected, direct download:', url);
                await api.downloads.download({
                  url: url,
                  filename: finalPath,
                  saveAs: downloadLocation === 'ask',
                  conflictAction: 'uniquify'
                });
                return;
              }

              // If no conversion is needed, we prefer a more direct approach if fetch fails
              const needsConversion = format !== 'original' || aspectRatio !== 'original';

              try {
                const blob = await fetchAsBlob(url);
                processed = await convertToFormat(blob, format, finalQuality, aspectRatio, cropMode, customRatioW, customRatioH);
              } catch (fetchErr) {
                console.warn('IBD DEBUG: Fetch failed, checking fallback for:', url, fetchErr);
                // Fallback: If no processing is needed, use direct URL download
                if (!needsConversion && (url.startsWith('http') || url.startsWith('https'))) {
                  console.log('IBD DEBUG: Fallback to direct URL download for:', url);
                  await api.downloads.download({
                    url: url,
                    filename: finalPath,
                    saveAs: downloadLocation === 'ask',
                    conflictAction: 'uniquify'
                  });
                  return; // Item handled by direct download
                } else {
                  throw fetchErr; // Re-throw if fallback not possible
                }
              }

              if (processed) {
                const blobUrl = URL.createObjectURL(processed);
                try {
                  await api.downloads.download({
                    url: blobUrl,
                    filename: finalPath,
                    saveAs: downloadLocation === 'ask',
                    conflictAction: 'uniquify'
                  });
                } finally {
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 20000 * (idx + 1));
                }
              }
            } catch (err) {
              console.error('IBD DEBUG: Item download failure:', url, err);
              // Ultimate Fallback: Try downloading the original URL directly via browser API
              // This bypasses CORS/CSP but means no format conversion or custom naming (might fallback to url filename)
              if (!url.startsWith('data:') && !url.startsWith('blob:')) {
                try {
                  console.log('IBD DEBUG: Attempting direct download fallback for:', url);
                  await api.downloads.download({
                    url: url,
                    saveAs: false // Don't annoy user with save as for fallback
                  });
                  // Consider it a pseudo-success or at least handled
                  return;
                } catch (fallbackErr) {
                  console.error('IBD DEBUG: Direct download fallback also failed:', fallbackErr);
                  failures.push({ url, error: err.message + ' (Fallback failed: ' + fallbackErr.message + ')' });
                }
              } else {
                failures.push({ url, error: err.message });
              }
            }
          }));
          if (i + batchSize < uniqueUrls.length && downloadDelay > 0) {
            await new Promise(r => setTimeout(r, downloadDelay));
          }
        }
      }

      await api.storage.local.set({ [STORAGE_KEY]: [] });
      return failures.length ? { ok: false, failures } : { ok: true };
    } catch (err) {
      console.error('IBD DEBUG: Global download error:', err);
      return { ok: false, error: err.message };
    } finally {
      inFlight.delete(batchKey);
    }
  }

  // ===== CONTEXT MENU =====
  api.contextMenus.create({
    id: 'ibd-download-image',
    title: 'Download this image (Photo-Grab)',
    contexts: ['image'],
  });

  api.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'ibd-download-image') return;
    const url = info.srcUrl;
    if (!url || !tab?.id) return;
    try {
      await api.tabs.sendMessage(tab.id, {
        type: 'IBD_CONTEXT_DOWNLOAD',
        payload: { url }
      });
    } catch (e) {
      // Content script might not be loaded — fallback: direct download
      const filename = url.split('/').pop().split('?')[0] || 'image';
      await api.downloads.download({ url, filename, saveAs: false });
    }
  });

  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'IBD_DOWNLOAD_SELECTED') {
      handleDownloadSelected(msg.payload).then(sendResponse);
      return true;
    }
    if (msg.type === 'IBD_DOWNLOAD_REQUEST_FROM_PAGE') {
      (async () => {
        const stored = await api.storage.local.get([
          STORAGE_KEY, QUALITY_KEY, FORMAT_KEY, FOLDER_KEY, USE_SUBFOLDER_KEY, ASK_LOCATION_KEY,
          BATCH_SIZE_KEY, DELAY_KEY, LAZY_KEY, LOW_PERF_KEY, NAMING_KEY, TEMPLATE_KEY, ZIP_KEY,
          ASPECT_RATIO_KEY, CUSTOM_RATIO_W_KEY, CUSTOM_RATIO_H_KEY, CROP_MODE_KEY
        ]);

        const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
        if (!selection.length) return sendResponse({ ok: false, error: 'No images selected.' });

        const pageTitle = (sender.tab && sender.tab.title) ? sender.tab.title.substring(0, 50).replace(/[\\/:*?"<>|]/g, '_') : 'Images';
        const site = (sender.tab && sender.tab.url) ? new URL(sender.tab.url).hostname : 'any';

        const payload = {
          urls: selection,
          quality: Number(stored[QUALITY_KEY] ?? 90),
          downloadLocation: stored[ASK_LOCATION_KEY] ? 'ask' : 'default',
          format: stored[FORMAT_KEY] || 'original',
          folderName: stored[USE_SUBFOLDER_KEY] ? (stored[FOLDER_KEY] || '') : '',
          batchSize: Number(stored[BATCH_SIZE_KEY] || 5),
          downloadDelay: Number(stored[DELAY_KEY] || 100),
          lazy: !!stored[LAZY_KEY],
          lowPerf: !!stored[LOW_PERF_KEY],
          namingMode: stored[NAMING_KEY] || 'auto',
          customTemplate: stored[TEMPLATE_KEY] || '',
          zipBundle: !!stored[ZIP_KEY],
          aspectRatio: stored[ASPECT_RATIO_KEY] || 'original',
          cropMode: stored[CROP_MODE_KEY] || 'fill',
          customRatioW: Number(stored[CUSTOM_RATIO_W_KEY] || 1),
          customRatioH: Number(stored[CUSTOM_RATIO_H_KEY] || 1),
          pageTitle,
          site
        };

        const result = await handleDownloadSelected(payload);
        sendResponse(result);
      })();
      return true;
    }

    if (msg.type === 'IBD_CLOUD_UPLOAD') {
      (async () => {
        try {
          const { provider, token, urls, folder } = msg.payload || {};
          if (!provider || !token || !Array.isArray(urls) || !urls.length) {
            return sendResponse({ ok: false, error: 'Invalid payload' });
          }
          const result = await uploadToCloud(provider, token, urls, folder || 'Photo-Grab');
          sendResponse(result);
        } catch (e) {
          sendResponse({ ok: false, error: e.message });
        }
      })();
      return true;
    }

    if (msg.type === 'IBD_CONVERT_IMAGE') {
      (async () => {
        try {
          const { dataUrl, format, quality, filename, autoDownload } = msg.payload;
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const convertedBlob = await convertImageFormatBg(blob, format, (quality || 90) / 100);
          const originalName = filename.replace(/\.[^/.]+$/, '');
          const newExt = format === 'jpeg' ? 'jpg' : format;
          const newFilename = `${originalName}_converted.${newExt}`;
          if (autoDownload) {
            const blobUrl = URL.createObjectURL(convertedBlob);
            await api.downloads.download({ url: blobUrl, filename: newFilename, saveAs: false });
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
          }
          sendResponse({ ok: true, filename: newFilename });
        } catch (error) {
          console.error('IBD: Conversion error:', error);
          sendResponse({ ok: false, error: error.message });
        }
      })();
      return true;
    }

    if (msg.type === 'IBD_EXPORT_WORD') {
      (async () => {
        try {
          const { urls, pageTitle } = msg.payload;
          const imageDataList = [];
          for (const url of urls) {
            try {
              const blob = await fetchAsBlob(url, 15000);
              const b64 = await blobToBase64(blob);
              const mime = blob.type || 'image/jpeg';
              imageDataList.push({ dataUrl: b64, mime });
            } catch (e) {
              console.warn('IBD: Word export skipping URL:', url, e.message);
            }
          }
          if (!imageDataList.length) {
            sendResponse({ ok: false, error: 'Could not fetch any images.' });
            return;
          }
          const docBlob = buildWordDocument(imageDataList, pageTitle || 'Images');
          const blobUrl = URL.createObjectURL(docBlob);
          const safeTitle = (pageTitle || 'Images').replace(/[\\/:*?"<>|]/g, '_');
          await api.downloads.download({ url: blobUrl, filename: `${safeTitle}.docx`, saveAs: false });
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
          sendResponse({ ok: true });
        } catch (err) {
          console.error('IBD: Word export error:', err);
          sendResponse({ ok: false, error: err.message });
        }
      })();
      return true;
    }

    if (msg.type === 'IBD_EXPORT_PPT') {
      (async () => {
        try {
          const { urls, pageTitle } = msg.payload;
          const imageDataList = [];
          for (const url of urls) {
            try {
              const blob = await fetchAsBlob(url, 15000);
              const b64 = await blobToBase64(blob);
              const mime = blob.type || 'image/jpeg';
              imageDataList.push({ dataUrl: b64, mime });
            } catch (e) {
              console.warn('IBD: PPT export skipping URL:', url, e.message);
            }
          }
          if (!imageDataList.length) {
            sendResponse({ ok: false, error: 'Could not fetch any images.' });
            return;
          }
          const pptBlob = buildPptDocument(imageDataList, pageTitle || 'Images');
          const blobUrl = URL.createObjectURL(pptBlob);
          const safeTitle = (pageTitle || 'Images').replace(/[\\/:*?"<>|]/g, '_');
          await api.downloads.download({ url: blobUrl, filename: `${safeTitle}.pptx`, saveAs: false });
          setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
          sendResponse({ ok: true });
        } catch (err) {
          console.error('IBD: PPT export error:', err);
          sendResponse({ ok: false, error: err.message });
        }
      })();
      return true;
    }

    if (msg.type === 'IBD_APPLY_FILTER') {
      (async () => {
        try {
          const { urls, filter } = msg.payload;
          const filteredUrls = [];
          for (const url of urls) {
            try {
              const blob = await fetchAsBlob(url, 15000);
              const filteredBlob = await applyImageFilter(blob, filter);
              const filteredBlobUrl = URL.createObjectURL(filteredBlob);
              filteredUrls.push(filteredBlobUrl);
              setTimeout(() => URL.revokeObjectURL(filteredBlobUrl), 120000);
            } catch (e) {
              console.warn('IBD: Filter skipping URL:', url, e.message);
              filteredUrls.push(url);
            }
          }
          sendResponse({ ok: true, filteredUrls });
        } catch (err) {
          console.error('IBD: Filter error:', err);
          sendResponse({ ok: false, error: err.message });
        }
      })();
      return true;
    }
  });

  // ===== BACKGROUND-SAFE IMAGE UTILITIES =====

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function convertImageFormatBg(blob, format, quality) {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : (format === 'png' ? 'image/png' : 'image/webp');
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas.convertToBlob({ type: mimeType, quality: (format === 'png' ? undefined : quality) });
  }

  async function applyImageFilter(blob, filter) {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;

    if (filter === 'grayscale') {
      for (let i = 0; i < d.length; i += 4) {
        const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = avg;
      }
    } else if (filter === 'sepia') {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        d[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
    } else if (filter === 'invert') {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2];
      }
    } else if (filter === 'warm') {
      for (let i = 0; i < d.length; i += 4) {
        d[i]     = Math.min(255, d[i] + 30);
        d[i + 2] = Math.max(0,   d[i + 2] - 20);
      }
    } else if (filter === 'cool') {
      for (let i = 0; i < d.length; i += 4) {
        d[i]     = Math.max(0,   d[i] - 20);
        d[i + 2] = Math.min(255, d[i + 2] + 30);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.convertToBlob({ type: 'image/png' });
  }

  // ===== WORD / PPTX BUILDERS (pure binary, no DOM) =====

  function buildWordDocument(imageDataList, title) {
    if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded');
    const zip = new JSZip();

    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  ${imageDataList.map((_, i) => `<Override PartName="/word/media/image${i + 1}.${_mime2ext(_.mime)}" ContentType="${_.mime}"/>`).join('\n  ')}
</Types>`);

    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    const imgRels = imageDataList.map((img, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.${_mime2ext(img.mime)}"/>`
    ).join('\n  ');

    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${imgRels}
</Relationships>`);

    const bodyContent = imageDataList.map((_, i) => `
  <w:p>
    <w:r>
      <w:drawing>
        <wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
          <wp:extent cx="5486400" cy="3657600"/>
          <wp:docPr id="${i + 1}" name="Image${i + 1}"/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr><pic:cNvPr id="${i + 1}" name="Image${i + 1}"/><pic:cNvPicPr/></pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="rId${i + 1}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="5486400" cy="3657600"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`).join('');

    zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${_escXml(title)}</w:t></w:r></w:p>
    ${bodyContent}
    <w:sectPr/>
  </w:body>
</w:document>`);

    imageDataList.forEach((img, i) => {
      const b64 = img.dataUrl.split(',')[1];
      zip.file(`word/media/image${i + 1}.${_mime2ext(img.mime)}`, b64, { base64: true });
    });

    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  function buildPptDocument(imageDataList, title) {
    if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded');
    const zip = new JSZip();
    const cx = 9144000, cy = 6858000;

    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${imageDataList.map((img, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n  ')}
  ${imageDataList.map((img, i) => `<Override PartName="/ppt/media/image${i + 1}.${_mime2ext(img.mime)}" ContentType="${img.mime}"/>`).join('\n  ')}
</Types>`);

    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

    const slideRefs = imageDataList.map((_, i) =>
      `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
    ).join('\n    ');

    const presRels = imageDataList.map((_, i) =>
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
    ).join('\n  ');

    zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldSz cx="${cx}" cy="${cy}"/>
  <p:notesSz cx="${cy}" cy="${cx}"/>
  <p:sldIdLst>${slideRefs}</p:sldIdLst>
</p:presentation>`);

    zip.file('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`);

    imageDataList.forEach((img, i) => {
      const slideNum = i + 1;
      const ext = _mime2ext(img.mime);

      zip.file(`ppt/slides/slide${slideNum}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/><a:chOff x="0" y="0"/><a:chExt cx="${cx}" cy="${cy}"/></a:xfrm></p:grpSpPr>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="2" name="Image${slideNum}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`);

      zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${slideNum}.${ext}"/>
</Relationships>`);

      const b64 = img.dataUrl.split(',')[1];
      zip.file(`ppt/media/image${slideNum}.${ext}`, b64, { base64: true });
    });

    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }

  // ===== CLOUD UPLOAD (Drive / Dropbox / OneDrive) =====
  async function uploadToCloud(provider, token, urls, folder) {
    let uploaded = 0;
    const failures = [];

    // Resolve a Drive folder once (creates if missing) — only for Google Drive
    let driveFolderId = null;
    if (provider === 'gdrive' && folder) {
      try { driveFolderId = await ensureDriveFolder(token, folder); } catch (_) { driveFolderId = null; }
    }

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const blob = await fetchAsBlob(url, DEFAULT_FETCH_TIMEOUT_MS);
        const ext = _mime2ext(blob.type) || getUrlExtension(url) || 'jpg';
        const filename = `photograb_${Date.now()}_${i + 1}.${ext}`;
        if (provider === 'gdrive') {
          await uploadToDrive(token, blob, filename, driveFolderId);
        } else if (provider === 'dropbox') {
          await uploadToDropbox(token, blob, `/${folder || 'Photo-Grab'}/${filename}`);
        } else if (provider === 'onedrive') {
          await uploadToOneDrive(token, blob, `${folder || 'Photo-Grab'}/${filename}`);
        } else {
          throw new Error('Unknown provider: ' + provider);
        }
        uploaded++;
      } catch (err) {
        failures.push({ url, error: err.message });
      }
    }
    return { ok: uploaded > 0, uploaded, total: urls.length, failures };
  }

  async function ensureDriveFolder(token, name) {
    const q = encodeURIComponent(
      `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );
    const findRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (findRes.ok) {
      const j = await findRes.json();
      if (j.files && j.files[0]) return j.files[0].id;
    }
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
    });
    if (!createRes.ok) throw new Error('Drive folder create failed: ' + createRes.status);
    return (await createRes.json()).id;
  }

  async function uploadToDrive(token, blob, filename, parentId) {
    const metadata = { name: filename };
    if (parentId) metadata.parents = [parentId];
    const boundary = '-------photograb' + Math.random().toString(36).slice(2);
    const delim = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;
    const metaPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const blobBuf = await blob.arrayBuffer();
    const enc = new TextEncoder();
    const head = enc.encode(delim + metaPart + delim + `Content-Type: ${blob.type || 'application/octet-stream'}\r\n\r\n`);
    const tail = enc.encode(closeDelim);
    const body = new Uint8Array(head.length + blobBuf.byteLength + tail.length);
    body.set(head, 0);
    body.set(new Uint8Array(blobBuf), head.length);
    body.set(tail, head.length + blobBuf.byteLength);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    });
    if (!res.ok) throw new Error('Drive upload failed: ' + res.status + ' ' + (await res.text()).slice(0, 120));
  }

  async function uploadToDropbox(token, blob, path) {
    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'add', autorename: true, mute: true }),
        'Content-Type': 'application/octet-stream'
      },
      body: blob
    });
    if (!res.ok) throw new Error('Dropbox upload failed: ' + res.status + ' ' + (await res.text()).slice(0, 120));
  }

  async function uploadToOneDrive(token, blob, relPath) {
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURI(relPath)}:/content`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': blob.type || 'application/octet-stream'
      },
      body: blob
    });
    if (!res.ok) throw new Error('OneDrive upload failed: ' + res.status + ' ' + (await res.text()).slice(0, 120));
  }

  function _mime2ext(mime) {
    if (!mime) return 'jpg';
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('gif')) return 'gif';
    return 'jpg';
  }

  function _escXml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
