(() => {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  const STORAGE_KEY = 'ibd_selectedImages_v1';
  const ATTR_SELECTED = 'data-ibd-selected';
  const ENABLED_KEY = 'ibd_enabled_v1';
  const QUALITY_KEY = 'ibd_jpegQuality_v1';

  const BADGE_ATTR = 'data-ibd-badge';
  const TOOLBAR_ID = 'ibd-toolbar-v1';

  function normalizeUrl(url) {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (!trimmed) return null;
    return trimmed;
  }

  function resolveUrl(maybeUrl) {
    const norm = normalizeUrl(maybeUrl);
    if (!norm) return null;
    try {
      return new URL(norm, document.baseURI).toString();
    } catch (_) {
      return norm;
    }
  }

  function parseSrcset(srcset) {
    const input = normalizeUrl(srcset);
    if (!input) return [];

    const parts = input
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const out = [];
    for (const part of parts) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (!tokens.length) continue;
      const url = resolveUrl(tokens[0]);
      if (!url) continue;

      let score = 0;
      const descriptor = tokens[1];
      if (descriptor) {
        const mW = /^([0-9]+)w$/i.exec(descriptor);
        const mX = /^([0-9]*\.?[0-9]+)x$/i.exec(descriptor);
        if (mW) score = Number(mW[1]) || 0;
        if (mX) score = (Number(mX[1]) || 0) * 10000;
      }

      out.push({ url, score });
    }

    return out;
  }

  function pickBestSrcsetUrl(srcset) {
    const parsed = parseSrcset(srcset);
    if (!parsed.length) return null;
    parsed.sort((a, b) => b.score - a.score);
    return parsed[0].url;
  }

  function extractUrlsFromBackgroundImage(bgValue) {
    const v = normalizeUrl(bgValue);
    if (!v || v === 'none') return [];

    const urls = [];
    const re = /url\((['"]?)(.*?)\1\)/gi;
    let m;
    while ((m = re.exec(v))) {
      const candidate = resolveUrl(m[2]);
      if (candidate) urls.push(candidate);
    }
    return urls;
  }

  function extractUrlFromBackgroundImage(bgValue) {
    const urls = extractUrlsFromBackgroundImage(bgValue);
    return urls.length ? urls[0] : null;
  }

  function getBestPictureSourceUrl(imgEl) {
    const picture = imgEl && imgEl.closest ? imgEl.closest('picture') : null;
    if (!picture) return null;

    const sources = Array.from(picture.querySelectorAll('source'));
    for (const source of sources) {
      const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
      const best = pickBestSrcsetUrl(srcset);
      if (best) return best;
    }

    return null;
  }

  function getCandidateImgUrl(imgEl) {
    if (!imgEl) return null;

    const pictureBest = getBestPictureSourceUrl(imgEl);
    if (pictureBest) return pictureBest;

    const srcsetBest = pickBestSrcsetUrl(imgEl.getAttribute('srcset') || imgEl.getAttribute('data-srcset'));
    if (srcsetBest) return srcsetBest;

    const candidates = [
      resolveUrl(imgEl.currentSrc),
      resolveUrl(imgEl.src),
      imgEl.getAttribute('src'),
      imgEl.getAttribute('data-src'),
      imgEl.getAttribute('data-original'),
      imgEl.getAttribute('data-lazy-src'),
      imgEl.getAttribute('data-zoom-image'),
      imgEl.getAttribute('data-hires'),
      imgEl.getAttribute('data-full'),
    ];

    for (const c of candidates) {
      const normalized = resolveUrl(c);
      if (normalized) return normalized;
    }

    return null;
  }

  function getClickableImageUrlFromEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return null;

    const img = target.closest('img');
    if (img) {
      return getCandidateImgUrl(img);
    }

    const el = target.closest('*');
    if (!el) return null;

    const style = window.getComputedStyle(el);
    const bgUrl = extractUrlFromBackgroundImage(style.backgroundImage);
    if (bgUrl) return bgUrl;

    return null;
  }

  function getClickableElementFromEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return null;

    const img = target.closest('img');
    if (img) return img;

    const el = target.closest('*');
    if (!el) return null;

    const style = window.getComputedStyle(el);
    const bgUrl = extractUrlFromBackgroundImage(style.backgroundImage);
    if (bgUrl) return el;

    return null;
  }

  async function getSelection() {
    const result = await api.storage.local.get(STORAGE_KEY);
    const arr = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
    return arr.filter(Boolean);
  }

  async function setSelection(urls) {
    const unique = Array.from(new Set(urls.filter(Boolean)));
    await api.storage.local.set({ [STORAGE_KEY]: unique });
    return unique;
  }

  async function getQuality() {
    const stored = await api.storage.local.get(QUALITY_KEY);
    const q = Number(stored[QUALITY_KEY]);
    if (!Number.isFinite(q)) return 90;
    return Math.min(100, Math.max(10, Math.round(q)));
  }

  function ensureBadge(el) {
    if (!(el instanceof Element)) return;
    if (el.querySelector(`span[${BADGE_ATTR}]`)) return;

    const badge = document.createElement('span');
    badge.setAttribute(BADGE_ATTR, '1');
    badge.textContent = '✓';
    el.appendChild(badge);
  }

  function removeBadge(el) {
    if (!(el instanceof Element)) return;
    const b = el.querySelector(`span[${BADGE_ATTR}]`);
    if (b) b.remove();
  }

  function getBadgeHostForElement(el) {
    if (!(el instanceof Element)) return null;

    if (el.tagName && el.tagName.toLowerCase() === 'img') {
      const parent = el.parentElement;
      if (!parent) return null;
      if (parent === document.body || parent === document.documentElement) return null;
      return parent;
    }

    return el;
  }

  function updateToolbarCount(count) {
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) return;
    const countEl = toolbar.querySelector('[data-ibd-count]');
    if (countEl) countEl.textContent = String(count);
    const downloadBtn = toolbar.querySelector('[data-ibd-download]');
    if (downloadBtn) downloadBtn.disabled = count === 0;
  }

  async function refreshToolbarCountFromStorage() {
    const selection = await getSelection();
    updateToolbarCount(selection.length);
  }

  function ensureToolbar() {
    if (document.getElementById(TOOLBAR_ID)) return;

    const root = document.createElement('div');
    root.id = TOOLBAR_ID;
    root.setAttribute('data-ibd-ui', '1');

    root.innerHTML = `
      <div data-ibd-ui="1" class="ibd-toolbar">
        <div data-ibd-ui="1" class="ibd-toolbar__left">
          <div data-ibd-ui="1" class="ibd-toolbar__title">Image Grabber Pro</div>
          <div data-ibd-ui="1" class="ibd-toolbar__meta">Selected: <span data-ibd-ui="1" data-ibd-count>0</span></div>
        </div>
        <div data-ibd-ui="1" class="ibd-toolbar__actions">
          <button data-ibd-ui="1" data-ibd-clear type="button" class="ibd-toolbar__btn">Clear</button>
          <button data-ibd-ui="1" data-ibd-download type="button" class="ibd-toolbar__btn ibd-toolbar__btn--primary" disabled>Download</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(root);

    const clearBtn = root.querySelector('[data-ibd-clear]');
    const downloadBtn = root.querySelector('[data-ibd-download]');

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        await setSelection([]);
        await syncHighlightsFromStorage();
        await refreshToolbarCountFromStorage();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        const selection = await getSelection();
        if (!selection.length) return;
        const quality = await getQuality();
        await api.runtime.sendMessage({
          type: 'IBD_DOWNLOAD_SELECTED',
          payload: {
            urls: selection,
            quality,
          },
        });
      });
    }
  }

  function removeToolbar() {
    const el = document.getElementById(TOOLBAR_ID);
    if (el) el.remove();
  }

  function clearAllHighlights() {
    const currentlyMarked = Array.from(document.querySelectorAll(`[${ATTR_SELECTED}]`));
    for (const el of currentlyMarked) {
      el.removeAttribute(ATTR_SELECTED);
    }
  }

  function applySelectionHighlightForUrl(url, isSelected) {
    const norm = normalizeUrl(url);
    if (!norm) return;

    // Only check images that could potentially match
    const imgs = Array.from(document.querySelectorAll('img[src], img[data-src], img[data-srcset]'));
    for (const img of imgs) {
      const imgUrl = getCandidateImgUrl(img);
      if (normalizeUrl(imgUrl) === norm) {
        const host = getBadgeHostForElement(img);
        if (isSelected) {
          img.setAttribute(ATTR_SELECTED, '1');
          if (host) {
            host.setAttribute(ATTR_SELECTED, '1');
            ensureBadge(host);
          }
        } else {
          img.removeAttribute(ATTR_SELECTED);
          if (host) {
            host.removeAttribute(ATTR_SELECTED);
            removeBadge(host);
          }
        }
      }
    }

    // Only check elements with background images
    const bgElements = Array.from(document.querySelectorAll('[style*="background-image"], [class*="bg"]'));
    for (const el of bgElements) {
      const style = window.getComputedStyle(el);
      const bgUrl = extractUrlFromBackgroundImage(style.backgroundImage);
      if (normalizeUrl(bgUrl) === norm) {
        if (isSelected) {
          el.setAttribute(ATTR_SELECTED, '1');
          ensureBadge(el);
        } else {
          el.removeAttribute(ATTR_SELECTED);
          removeBadge(el);
        }
      }
    }
  }

  async function syncHighlightsFromStorage() {
    if (!isEnabled()) {
      clearAllHighlights();
      return;
    }
    const selection = await getSelection();

    const selectedSet = new Set(selection.map(normalizeUrl).filter(Boolean));

    // Clear all highlights first and re-apply to ensure consistency
    clearAllHighlights();

    // Apply highlights to all selected URLs
    for (const url of selectedSet) {
      applySelectionHighlightForUrl(url, true);
    }

    updateToolbarCount(selection.length);
  }

  async function toggleUrl(url) {
    if (!isEnabled()) return { selection: await getSelection(), changed: false };
    const norm = normalizeUrl(url);
    if (!norm) return { selection: await getSelection(), changed: false };

    const selection = await getSelection();
    const set = new Set(selection.map(normalizeUrl).filter(Boolean));

    let changed = false;
    if (set.has(norm)) {
      set.delete(norm);
      changed = true;
      applySelectionHighlightForUrl(norm, false);
    } else {
      set.add(norm);
      changed = true;
      applySelectionHighlightForUrl(norm, true);
    }

    const updated = await setSelection(Array.from(set));
    return { selection: updated, changed };
  }

  document.addEventListener(
    'click',
    async (event) => {
      if (!isEnabled()) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (target instanceof Element && target.closest('[data-ibd-ui="1"]')) return;

      const url = getClickableImageUrlFromEvent(event);
      if (!url) return;

      const el = getClickableElementFromEvent(event);
      if (el) {
        event.preventDefault();
        event.stopPropagation();
      }

      await toggleUrl(url);
    },
    true
  );

  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'IBD_GET_SELECTION') {
        const selection = await getSelection();
        sendResponse({ selection });
        return;
      }

      if (msg.type === 'IBD_CLEAR_SELECTION') {
        await setSelection([]);
        await syncHighlightsFromStorage();
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'IBD_SYNC_HIGHLIGHTS') {
        await syncHighlightsFromStorage();
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === 'IBD_SET_ENABLED') {
        const enabled = Boolean(msg.payload && msg.payload.enabled);
        await api.storage.local.set({ [ENABLED_KEY]: enabled });
        if (!enabled) {
          await setSelection([]);
          clearAllHighlights();
          removeToolbar();
        } else {
          ensureToolbar();
          await syncHighlightsFromStorage();
          await refreshToolbarCountFromStorage();
        }
        sendResponse({ ok: true });
        return;
      }
    })();

    return true;
  });

  let enabledCache = false;
  function isEnabled() {
    return Boolean(enabledCache);
  }

  async function initEnabled() {
    const stored = await api.storage.local.get(ENABLED_KEY);
    enabledCache = Boolean(stored[ENABLED_KEY] ?? false);
    if (!enabledCache) {
      clearAllHighlights();
      removeToolbar();
    } else {
      ensureToolbar();
    }
  }

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[ENABLED_KEY]) {
      enabledCache = Boolean(changes[ENABLED_KEY].newValue);
      if (!enabledCache) {
        clearAllHighlights();
        removeToolbar();
      } else {
        ensureToolbar();
        scheduleHighlightSync();
      }
    }
  });

  let mutationScheduled = false;
  let mutationTimeout = null;
  
  function scheduleHighlightSync() {
    if (mutationScheduled) return;
    mutationScheduled = true;
    
    // Clear existing timeout
    if (mutationTimeout) {
      clearTimeout(mutationTimeout);
    }
    
    // Debounce with 100ms delay
    mutationTimeout = setTimeout(async () => {
      mutationScheduled = false;
      mutationTimeout = null;
      await syncHighlightsFromStorage();
    }, 100);
  }

  const observer = new MutationObserver((mutations) => {
    if (!isEnabled()) return;
    
    // Only trigger sync for relevant mutations
    const hasRelevantChanges = mutations.some(mutation => {
      // Check if mutation affects images or their attributes
      if (mutation.type === 'childList') {
        return Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.tagName === 'IMG' || node.tagName === 'PICTURE' || 
                   node.querySelector('img, picture');
          }
          return false;
        });
      }
      
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        return target.tagName === 'IMG' || target.tagName === 'PICTURE' ||
               target.tagName === 'SOURCE' || target.tagName === 'A';
      }
      
      return false;
    });
    
    if (hasRelevantChanges) {
      scheduleHighlightSync();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'style', 'data-src', 'data-srcset', 'data-original', 'data-lazy-src'],
  });

  initEnabled().then(() => {
    syncHighlightsFromStorage();
  });
})();
