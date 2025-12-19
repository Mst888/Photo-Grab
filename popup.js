(() => {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  const STORAGE_KEY = 'ibd_selectedImages_v1';
  const QUALITY_KEY = 'ibd_jpegQuality_v1';
  const ENABLED_KEY = 'ibd_enabled_v1';
  const LOCATION_KEY = 'ibd_downloadLocation_v1';

  const selectedCountEl = document.getElementById('selectedCount');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusEl = document.getElementById('status');
  const qualityEl = document.getElementById('quality');
  const qualityValueEl = document.getElementById('qualityValue');
  const downloadLocationEl = document.getElementById('downloadLocation');
  const enabledToggleEl = document.getElementById('enabledToggle');

  function setStatus(text, isError) {
    statusEl.textContent = text || '';
    statusEl.classList.toggle('ibd-status-error', Boolean(isError));
  }

  function clampQuality(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 90;
    return Math.min(100, Math.max(10, Math.round(n)));
  }

  async function getActiveTabId() {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs.length || !tabs[0].id) return null;
    return tabs[0].id;
  }

  async function updateSelectedCount() {
    const stored = await api.storage.local.get(STORAGE_KEY);
    const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    selectedCountEl.textContent = String(selection.length);
    downloadBtn.disabled = selection.length === 0;
  }

  async function loadEnabled() {
    const stored = await api.storage.local.get(ENABLED_KEY);
    const enabled = Boolean(stored[ENABLED_KEY] ?? false);
    enabledToggleEl.checked = enabled;
    return enabled;
  }

  async function setEnabled(enabled) {
    await api.storage.local.set({ [ENABLED_KEY]: Boolean(enabled) });
  }

  async function loadQuality() {
    const stored = await api.storage.local.get(QUALITY_KEY);
    const q = clampQuality(stored[QUALITY_KEY] ?? 90);
    qualityEl.value = String(q);
    qualityValueEl.textContent = String(q);
  }

  async function saveQuality() {
    const q = clampQuality(qualityEl.value);
    await api.storage.local.set({ [QUALITY_KEY]: q });
    qualityValueEl.textContent = String(q);
    return q;
  }

  async function saveDownloadLocation() {
    const location = downloadLocationEl.value;
    await api.storage.local.set({ [LOCATION_KEY]: location });
    return location;
  }

  async function loadDownloadLocation() {
    const stored = await api.storage.local.get(LOCATION_KEY);
    const location = stored[LOCATION_KEY] || 'default';
    downloadLocationEl.value = location;
    return location;
  }

  async function clearSelectionOnPage() {
    const tabId = await getActiveTabId();
    if (!tabId) throw new Error('No active tab found.');
    await api.tabs.sendMessage(tabId, { type: 'IBD_CLEAR_SELECTION' });
  }

  async function requestDownload() {
    const stored = await api.storage.local.get(STORAGE_KEY);
    const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    if (!selection.length) {
      setStatus('No images selected.', true);
      return;
    }

    const quality = await saveQuality();
    const downloadLocation = await saveDownloadLocation();
    setStatus('Preparing downloads...');

    const response = await api.runtime.sendMessage({
      type: 'IBD_DOWNLOAD_SELECTED',
      payload: {
        urls: selection,
        quality,
        downloadLocation,
      },
    });

    if (response && response.ok) {
      setStatus(`Started downloading ${selection.length} image(s).`);
      return;
    }

    const failures = response && Array.isArray(response.failures) ? response.failures : null;
    if (failures && failures.length) {
      const okCount = Math.max(0, selection.length - failures.length);
      setStatus(`Downloaded ${okCount}/${selection.length}. Failed: ${failures.length}.`, true);
      return;
    }

    const msg = response && response.error ? response.error : 'Download failed.';
    setStatus(msg, true);
  }

  qualityEl.addEventListener('input', () => {
    qualityValueEl.textContent = String(clampQuality(qualityEl.value));
  });

  qualityEl.addEventListener('change', () => {
    saveQuality();
  });

  downloadLocationEl.addEventListener('change', () => {
    saveDownloadLocation();
  });

  clearBtn.addEventListener('click', async () => {
    try {
      setStatus('Clearing selection...');
      await clearSelectionOnPage();
      await updateSelectedCount();
      setStatus('Selection cleared.');
    } catch (err) {
      setStatus(err && err.message ? err.message : 'Failed to clear selection.', true);
    }
  });

  enabledToggleEl.addEventListener('change', async () => {
    try {
      const enabled = Boolean(enabledToggleEl.checked);
      await setEnabled(enabled);

      const tabId = await getActiveTabId();
      if (tabId) {
        try {
          await api.tabs.sendMessage(tabId, { type: 'IBD_SET_ENABLED', payload: { enabled } });
        } catch (_) {
        }
      }

      if (!enabled) {
        setStatus('Selection mode off.');
        try {
          await clearSelectionOnPage();
          await updateSelectedCount();
        } catch (_) {
        }
      } else {
        setStatus('Selection mode on.');
      }
    } catch (err) {
      setStatus(err && err.message ? err.message : 'Failed to change mode.', true);
    }
  });

  downloadBtn.addEventListener('click', async () => {
    try {
      await requestDownload();
    } catch (err) {
      setStatus(err && err.message ? err.message : 'Download failed.', true);
    }
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[STORAGE_KEY]) updateSelectedCount();
    if (changes[ENABLED_KEY]) {
      enabledToggleEl.checked = Boolean(changes[ENABLED_KEY].newValue);
    }
  });

  (async () => {
    setStatus('');
    await loadEnabled();
    await loadQuality();
    await loadDownloadLocation();
    await updateSelectedCount();

    const tabId = await getActiveTabId();
    if (tabId) {
      try {
        await api.tabs.sendMessage(tabId, { type: 'IBD_SYNC_HIGHLIGHTS' });
      } catch (_) {
      }
    }
  })();
})();
