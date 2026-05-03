(() => {
  const api = browser;

  const STORAGE_KEY = 'ibd_selectedImages_v1';
  const QUALITY_KEY = 'ibd_jpegQuality_v1';
  const ENABLED_KEY = 'ibd_enabled_v1';
  const LOCATION_KEY = 'ibd_downloadLocation_v1';
  const FORMAT_KEY = 'ibd_outputFormat_v1';
  const FOLDER_KEY = 'ibd_folderName_v1';
  const USE_SUBFOLDER_KEY = 'ibd_useSubfolder_v1';
  const ASK_LOCATION_KEY = 'ibd_askLocation_v1';
  const LOW_PERF_KEY = 'ibd_lowPerf_v1';
  const PREVIEW_KEY = 'ibd_previews_v1';
  const OVERLAY_KEY = 'ibd_overlays_v1';
  const BATCH_SIZE_KEY = 'ibd_batchSize_v1';
  const DELAY_KEY = 'ibd_downloadDelay_v1';
  const MAX_SELECT_KEY = 'ibd_maxSelection_v1';
  const LAZY_KEY = 'ibd_lazyProcess_v1';
  const THEME_KEY = 'ibd_theme_v1';

  // New Upgrade Keys
  const MODE_KEY = 'ibd_selectionMode_v1';
  const NAMING_KEY = 'ibd_namingMode_v1';
  const ZIP_KEY = 'ibd_zipEnabled_v1';
  const TEMPLATE_KEY = 'ibd_customTemplate_v1';
  const ASPECT_RATIO_KEY = 'ibd_aspectRatio_v1';
  const CUSTOM_RATIO_W_KEY = 'ibd_customRatioW_v1';
  const CUSTOM_RATIO_H_KEY = 'ibd_customRatioH_v1';
  const CROP_MODE_KEY = 'ibd_cropMode_v1';
  const STAY_OPEN_KEY = 'ibd_stayOpen_v1';
  const POPUP_SIZE_PRESET_KEY = 'ibd_popupSizePreset_v1';
  const POPUP_WIDTH_KEY = 'ibd_popupWidth_v1';
  const POPUP_HEIGHT_KEY = 'ibd_popupHeight_v1';
  const CLEAR_ON_DISABLE_KEY = 'ibd_clearOnDisable_v1';
  const SHORTCUTS_ENABLED_KEY = 'ibd_shortcutsEnabled_v1';
  const SHORTCUTS_DATA_KEY = 'ibd_shortcutsData_v1';
  const CONVERTER_ENABLED_KEY = 'ibd_converterEnabled_v1';
  const CONVERTER_TOOLBAR_KEY = 'ibd_converterToolbarVisible_v1';
  const CONVERTER_FORMAT_KEY = 'ibd_converterDefaultFormat_v1';
  const CONVERTER_QUALITY_KEY = 'ibd_converterQuality_v1';
  const CONVERTER_AUTO_DOWNLOAD_KEY = 'ibd_converterAutoDownload_v1';
  const LANGUAGE_KEY = 'ibd_language_v1';
  const HISTORY_KEY = 'ibd_downloadHistory_v1';
  const COLLECTIONS_KEY = 'ibd_collections_v1';
  const MIN_WIDTH_KEY = 'ibd_minWidth_v1';
  const MIN_HEIGHT_KEY = 'ibd_minHeight_v1';
  const DEDUP_KEY = 'ibd_dedup_v1';

  const DEFAULT_SHORTCUTS = {
    toggleSelection: { key: 'e', alt: true, ctrl: false, shift: false },
    selectAll: { key: 'a', alt: true, ctrl: false, shift: false },
    clearSelection: { key: 'x', alt: true, ctrl: false, shift: false },
    download: { key: 'd', alt: true, ctrl: false, shift: false },
    downloadZip: { key: 'z', alt: true, ctrl: false, shift: false },
    togglePreview: { key: 'p', alt: true, ctrl: false, shift: false },
    toggleLowPerf: { key: 'l', alt: true, ctrl: false, shift: false },
    toggleConverter: { key: 'c', alt: true, ctrl: false, shift: false }
  };

  // Element references
  const els = {
    selectedCount: document.getElementById('selectedCount'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearBtn: document.getElementById('clearBtn'),
    status: document.getElementById('status'),
    quality: document.getElementById('quality'),
    qualityValue: document.getElementById('qualityValue'),
    qualityField: document.getElementById('qualityField'),
    enabledToggle: document.getElementById('enabledToggle'),
    outputFormat: document.getElementById('outputFormat'),
    askLocationToggle: document.getElementById('askLocationToggle'),
    useSubfolderToggle: document.getElementById('useSubfolderToggle'),
    subfolderField: document.getElementById('subfolderField'),
    folderName: document.getElementById('folderName'),
    lowPerfToggle: document.getElementById('lowPerfToggle'),
    previewToggle: document.getElementById('previewToggle'),
    overlayToggle: document.getElementById('overlayToggle'),
    batchSize: document.getElementById('batchSize'),
    downloadDelay: document.getElementById('downloadDelay'),
    maxSelection: document.getElementById('maxSelection'),
    lazyProcessToggle: document.getElementById('lazyProcessToggle'),
    selectionMode: document.getElementById('selectionMode'),
    previewGallery: document.getElementById('previewGallery'),
    previewDisabledMsg: document.getElementById('previewDisabledMsg'),
    namingMode: document.getElementById('namingMode'),
    customNameField: document.getElementById('customNameField'),
    customTemplate: document.getElementById('customTemplate'),
    zipDownloadToggle: document.getElementById('zipDownloadToggle'),
    aspectRatio: document.getElementById('aspectRatio'),
    customRatioField: document.getElementById('customRatioField'),
    customRatioW: document.getElementById('customRatioW'),
    customRatioH: document.getElementById('customRatioH'),
    cropModeField: document.getElementById('cropModeField'),
    cropMode: document.getElementById('cropMode'),
    // Settings Panel Elements
    homeView: document.getElementById('homeView'),
    settingsView: document.getElementById('settingsView'),
    settingsBtn: document.getElementById('settingsBtn'),
    backBtn: document.getElementById('backBtn'),
    stayOpenToggle: document.getElementById('stayOpenToggle'),
    popupSizePreset: document.getElementById('popupSizePreset'),
    customSizeFields: document.getElementById('customSizeFields'),
    popupWidth: document.getElementById('popupWidth'),
    popupHeight: document.getElementById('popupHeight'),
    themeRadios: document.querySelectorAll('input[name="theme"]'),
    shortcutsToggle: document.getElementById('shortcutsToggle'),
    resetShortcutsBtn: document.getElementById('resetShortcutsBtn'),
    shortcutOverlay: document.getElementById('shortcutOverlay'),
    recorderActionName: document.getElementById('recorderActionName'),
    recorderKeys: document.getElementById('recorderKeys'),
    editShortcutBtns: document.querySelectorAll('.ibd-edit-shortcut'),
    minWidth: document.getElementById('minWidth'),
    minHeight: document.getElementById('minHeight'),
    dedupToggle: document.getElementById('dedupToggle'),
    downloadProgress: document.getElementById('downloadProgress'),
    downloadProgressBar: document.getElementById('downloadProgressBar'),
    downloadProgressText: document.getElementById('downloadProgressText'),
    downloadProgressPct: document.getElementById('downloadProgressPct'),
    converterEnabledToggle: document.getElementById('converterEnabledToggle'),
    converterToolbarToggle: document.getElementById('converterToolbarToggle'),
    converterToolbarToggleSettings: document.getElementById('converterToolbarToggleSettings'),
    converterFormat: document.getElementById('converterFormat'),
    converterQuality: document.getElementById('converterQuality'),
    converterQualityValue: document.getElementById('converterQualityValue'),
    converterAutoDownloadToggle: document.getElementById('converterAutoDownloadToggle'),
    githubBtn: document.getElementById('githubBtn'),
    clearOnDisableToggle: document.getElementById('clearOnDisableToggle'),
    languageSelect: document.getElementById('languageSelect'),
    exportWordBtn: document.getElementById('exportWordBtn'),
    exportPptBtn: document.getElementById('exportPptBtn'),
    filterBtns: document.querySelectorAll('.ibd-filter-btn'),
    fileUpload: document.getElementById('fileUpload'),
    uploadFormat: document.getElementById('uploadFormat'),
    convertBtn: document.getElementById('convertBtn'),
    selectAllBtn: document.getElementById('selectAllBtn')
  };

  let recordingAction = null;
  let currentShortcuts = { ...DEFAULT_SHORTCUTS };
  let currentLanguage = 'en';

  function applyLanguage(lang) {
    if (!LANGUAGES || !LANGUAGES[lang]) return;
    currentLanguage = lang;
    const translations = LANGUAGES[lang].translations;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });
  }

  function setStatus(text, isError) {
    els.status.textContent = text || '';
    els.status.classList.toggle('ibd-status-error', Boolean(isError));
  }

  function applyTheme(theme) {
    const themes = ['light', 'dark', 'blue', 'pink', 'spotify', 'gray', 'custom'];
    themes.forEach(t => document.body.classList.remove(`ibd-theme-${t}`));
    if (theme && themes.includes(theme)) document.body.classList.add(`ibd-theme-${theme}`);
  }

  function updateLowPerfUI(enabled) {
    document.body.classList.toggle('ibd-low-perf', Boolean(enabled));
    if (enabled) {
      els.previewGallery.style.display = 'none';
      els.previewDisabledMsg.style.display = 'block';
      els.aspectRatio.disabled = true;
      setStatus('Aspect ratio disabled in low-perf mode.', false);
    } else {
      els.previewGallery.style.display = 'flex';
      els.previewDisabledMsg.style.display = 'none';
      els.aspectRatio.disabled = false;
    }
  }

  function clampQuality(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 90;
    return Math.min(100, Math.max(10, Math.round(n)));
  }

  async function getActiveTabId() {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    return (tabs && tabs[0] && tabs[0].id) || null;
  }

  async function renderPreviewGallery() {
    const storedPerf = await api.storage.local.get(LOW_PERF_KEY);
    if (storedPerf[LOW_PERF_KEY]) return;

    const stored = await api.storage.local.get(STORAGE_KEY);
    const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];

    els.previewGallery.innerHTML = '';
    selection.forEach(url => {
      const container = document.createElement('div');
      container.className = 'ibd-thumb-container';
      container.title = 'Click to remove';

      const img = document.createElement('img');
      img.src = url;
      img.className = 'ibd-thumb-img';

      const remove = document.createElement('div');
      remove.className = 'ibd-thumb-remove';
      remove.textContent = '×';

      container.onclick = async () => {
        const current = await api.storage.local.get(STORAGE_KEY);
        const list = Array.isArray(current[STORAGE_KEY]) ? current[STORAGE_KEY] : [];
        const filtered = list.filter(u => u !== url);
        await api.storage.local.set({ [STORAGE_KEY]: filtered });
        const tabId = await getActiveTabId();
        if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_SYNC_HIGHLIGHTS' }); } catch (_) { }
        updateSelectedCount();
      };

      container.appendChild(img);
      container.appendChild(remove);
      els.previewGallery.appendChild(container);
    });
  }

  async function updateSelectedCount() {
    const stored = await api.storage.local.get(STORAGE_KEY);
    const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    els.selectedCount.textContent = String(selection.length);
    els.downloadBtn.disabled = selection.length === 0;
    renderPreviewGallery();
  }

  async function loadSettings() {
    const stored = await api.storage.local.get([
      ENABLED_KEY, QUALITY_KEY, FORMAT_KEY, FOLDER_KEY, USE_SUBFOLDER_KEY, ASK_LOCATION_KEY,
      LOW_PERF_KEY, PREVIEW_KEY, OVERLAY_KEY, BATCH_SIZE_KEY, DELAY_KEY, MAX_SELECT_KEY, LAZY_KEY,
      THEME_KEY, MODE_KEY, NAMING_KEY, TEMPLATE_KEY, ZIP_KEY,
      ASPECT_RATIO_KEY, CUSTOM_RATIO_W_KEY, CUSTOM_RATIO_H_KEY, CROP_MODE_KEY,
      STAY_OPEN_KEY, POPUP_SIZE_PRESET_KEY, POPUP_WIDTH_KEY, POPUP_HEIGHT_KEY,
      CLEAR_ON_DISABLE_KEY, SHORTCUTS_ENABLED_KEY, SHORTCUTS_DATA_KEY,
      CONVERTER_ENABLED_KEY, CONVERTER_TOOLBAR_KEY, CONVERTER_FORMAT_KEY, CONVERTER_QUALITY_KEY, CONVERTER_AUTO_DOWNLOAD_KEY,
      LANGUAGE_KEY, MIN_WIDTH_KEY, MIN_HEIGHT_KEY, DEDUP_KEY
    ]);

    els.enabledToggle.checked = !!stored[ENABLED_KEY];
    els.quality.value = String(clampQuality(stored[QUALITY_KEY] ?? 90));
    els.qualityValue.textContent = els.quality.value;
    els.outputFormat.value = stored[FORMAT_KEY] || 'original';
    els.askLocationToggle.checked = !!stored[ASK_LOCATION_KEY];
    els.useSubfolderToggle.checked = !!stored[USE_SUBFOLDER_KEY];
    els.folderName.value = stored[FOLDER_KEY] || '';

    const lowPerf = !!stored[LOW_PERF_KEY];
    els.lowPerfToggle.checked = lowPerf;
    updateLowPerfUI(lowPerf);

    els.previewToggle.checked = stored[PREVIEW_KEY] !== false;
    els.overlayToggle.checked = stored[OVERLAY_KEY] !== false;
    els.batchSize.value = stored[BATCH_SIZE_KEY] ?? 5;
    els.downloadDelay.value = stored[DELAY_KEY] ?? 100;
    els.maxSelection.value = stored[MAX_SELECT_KEY] ?? 50;
    els.lazyProcessToggle.checked = !!stored[LAZY_KEY];

    const theme = stored[THEME_KEY] || 'light';
    els.themeRadios.forEach(r => { if (r.value === theme) r.checked = true; });
    applyTheme(theme);
    toggleCustomThemeBuilder(theme === 'custom');

    els.selectionMode.value = stored[MODE_KEY] || 'normal';
    els.namingMode.value = stored[NAMING_KEY] || 'auto';
    els.customTemplate.value = stored[TEMPLATE_KEY] || '';
    els.zipDownloadToggle.checked = !!stored[ZIP_KEY];

    els.aspectRatio.value = stored[ASPECT_RATIO_KEY] || 'original';
    els.customRatioW.value = stored[CUSTOM_RATIO_W_KEY] || 1;
    els.customRatioH.value = stored[CUSTOM_RATIO_H_KEY] || 1;
    els.cropMode.value = stored[CROP_MODE_KEY] || 'fill';
    els.stayOpenToggle.checked = !!stored[STAY_OPEN_KEY];
    els.popupSizePreset.value = stored[POPUP_SIZE_PRESET_KEY] || 'medium';
    els.popupWidth.value = stored[POPUP_WIDTH_KEY] || 380;
    els.popupHeight.value = stored[POPUP_HEIGHT_KEY] || 500;
    if (els.clearOnDisableToggle) els.clearOnDisableToggle.checked = !!stored[CLEAR_ON_DISABLE_KEY];

    if (els.shortcutsToggle) els.shortcutsToggle.checked = stored[SHORTCUTS_ENABLED_KEY] !== false;
    currentShortcuts = stored[SHORTCUTS_DATA_KEY] || { ...DEFAULT_SHORTCUTS };
    updateShortcutUI();

    if (els.converterEnabledToggle) els.converterEnabledToggle.checked = !!stored[CONVERTER_ENABLED_KEY];
    if (els.converterToolbarToggle) els.converterToolbarToggle.checked = !!stored[CONVERTER_TOOLBAR_KEY];
    if (els.converterToolbarToggleSettings) els.converterToolbarToggleSettings.checked = !!stored[CONVERTER_TOOLBAR_KEY];
    if (els.converterFormat) els.converterFormat.value = stored[CONVERTER_FORMAT_KEY] || 'jpeg';
    if (els.converterQuality) {
      els.converterQuality.value = String(clampQuality(stored[CONVERTER_QUALITY_KEY] ?? 90));
      if (els.converterQualityValue) els.converterQualityValue.textContent = els.converterQuality.value;
    }
    if (els.converterAutoDownloadToggle) els.converterAutoDownloadToggle.checked = stored[CONVERTER_AUTO_DOWNLOAD_KEY] !== false;

    if (els.minWidth) els.minWidth.value = stored[MIN_WIDTH_KEY] ?? 0;
    if (els.minHeight) els.minHeight.value = stored[MIN_HEIGHT_KEY] ?? 0;
    if (els.dedupToggle) els.dedupToggle.checked = stored[DEDUP_KEY] !== false;

    const lang = stored[LANGUAGE_KEY] || 'en';
    if (els.languageSelect) els.languageSelect.value = lang;
    applyLanguage(lang);

    updateLocationVisibility();
    updateQualityVisibility();
    updateNamingVisibility();
    updateRatioVisibility();
    updateSizeVisibility();
    applyPopupSize();
  }

  function updateRatioVisibility() {
    const ratio = els.aspectRatio.value;
    els.customRatioField.style.display = ratio === 'custom' ? 'flex' : 'none';
    els.cropModeField.style.display = ratio === 'original' ? 'none' : 'block';
  }

  function updateQualityVisibility() {
    const format = els.outputFormat.value;
    els.qualityField.style.display = (format === 'jpeg' || format === 'webp') ? 'block' : 'none';
  }

  function updateLocationVisibility() {
    els.subfolderField.style.display = els.useSubfolderToggle.checked ? 'block' : 'none';
  }

  function updateNamingVisibility() {
    els.customNameField.style.display = els.namingMode.value === 'custom' ? 'block' : 'none';
  }

  function updateSizeVisibility() {
    els.customSizeFields.style.display = els.popupSizePreset.value === 'custom' ? 'flex' : 'none';
  }

  function showView(viewName) {
    els.homeView.style.display = 'none';
    els.settingsView.style.display = 'none';
    if (viewName === 'home') {
      els.homeView.style.display = 'block';
    } else if (viewName === 'settings') {
      els.settingsView.style.display = 'block';
    }
  }

  function applyPopupSize() {
    const preset = els.popupSizePreset.value;
    let width, height;

    switch (preset) {
      case 'small': width = 300; height = 400; break;
      case 'medium': width = 380; height = 500; break;
      case 'large': width = 450; height = 600; break;
      case 'custom':
        width = Number(els.popupWidth.value);
        height = Number(els.popupHeight.value);
        break;
      default: width = 380; height = 500; break;
    }

    width = Math.max(300, Math.min(800, width));
    height = Math.max(400, Math.min(600, height));

    document.documentElement.style.setProperty('--ibd-popup-width', `${width}px`);
    document.documentElement.style.setProperty('--ibd-popup-height', `${height}px`);
    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
  }

  async function saveSetting(key, value) {
    await api.storage.local.set({ [key]: value });
  }

  // --- SHORTCUTS LOGIC ---
  function formatShortcut(s) {
    if (!s || !s.key) return 'None';
    const parts = [];
    if (s.ctrl) parts.push('Ctrl');
    if (s.alt) parts.push('Alt');
    if (s.shift) parts.push('Shift');
    parts.push(s.key.toUpperCase());
    return parts.join('+');
  }

  function updateShortcutUI() {
    for (const [action, data] of Object.entries(currentShortcuts)) {
      const el = document.getElementById(`kb-${action}`);
      if (el) el.textContent = formatShortcut(data);
    }
  }

  function startRecording(action) {
    recordingAction = action;
    els.recorderActionName.textContent = action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    els.recorderKeys.textContent = 'Press keys...';
    els.shortcutOverlay.style.display = 'flex';
  }

  function stopRecording(save) {
    if (save && recordingAction && lastRecorded) {
      currentShortcuts[recordingAction] = lastRecorded;
      saveSetting(SHORTCUTS_DATA_KEY, currentShortcuts);
      updateShortcutUI();
    }
    recordingAction = null;
    lastRecorded = null;
    els.shortcutOverlay.style.display = 'none';
  }

  let lastRecorded = null;
  window.addEventListener('keydown', (e) => {
    if (recordingAction) {
      e.preventDefault();
      if (e.key === 'Escape') return stopRecording(false);
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

      lastRecorded = {
        key: e.key.toLowerCase(),
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey
      };
      els.recorderKeys.textContent = formatShortcut(lastRecorded);
      setTimeout(() => stopRecording(true), 400);
      return;
    }

    if (els.shortcutsToggle?.checked) {
      for (const [action, data] of Object.entries(currentShortcuts)) {
        if (e.key.toLowerCase() === data.key &&
          e.ctrlKey === !!data.ctrl &&
          e.altKey === !!data.alt &&
          e.shiftKey === !!data.shift) {
          e.preventDefault();
          executeAction(action);
          break;
        }
      }
    }
  });

  async function executeAction(action) {
    switch (action) {
      case 'toggleSelection':
        if (els.enabledToggle) {
          els.enabledToggle.checked = !els.enabledToggle.checked;
          els.enabledToggle.dispatchEvent(new Event('change'));
        }
        break;
      case 'selectAll':
        const tabId = await getActiveTabId();
        if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_SELECT_ALL' }); } catch (_) { }
        break;
      case 'clearSelection':
        if (els.clearBtn) els.clearBtn.click();
        break;
      case 'download':
        if (els.downloadBtn && !els.downloadBtn.disabled) els.downloadBtn.click();
        break;
      case 'downloadZip':
        if (els.zipDownloadToggle) {
          const wasChecked = els.zipDownloadToggle.checked;
          els.zipDownloadToggle.checked = true;
          await requestDownload();
          els.zipDownloadToggle.checked = wasChecked;
        }
        break;
      case 'togglePreview':
        if (els.previewToggle) {
          els.previewToggle.checked = !els.previewToggle.checked;
          els.previewToggle.dispatchEvent(new Event('change'));
        }
        break;
      case 'toggleLowPerf':
        if (els.lowPerfToggle) {
          els.lowPerfToggle.checked = !els.lowPerfToggle.checked;
          els.lowPerfToggle.dispatchEvent(new Event('change'));
        }
        break;
    }
  }

  function showProgress(current, total) {
    if (!els.downloadProgress) return;
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    els.downloadProgress.style.display = '';
    els.downloadProgressBar.style.width = pct + '%';
    els.downloadProgressText.textContent = `${current} / ${total}`;
    els.downloadProgressPct.textContent = pct + '%';
  }

  function hideProgress() {
    if (els.downloadProgress) els.downloadProgress.style.display = 'none';
  }

  async function requestDownload() {
    const stored = await api.storage.local.get(STORAGE_KEY);
    const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    if (!selection.length) return setStatus('No images selected.', true);

    const settings = await api.storage.local.get([
      QUALITY_KEY, FORMAT_KEY, FOLDER_KEY, USE_SUBFOLDER_KEY, ASK_LOCATION_KEY,
      BATCH_SIZE_KEY, DELAY_KEY, LAZY_KEY, LOW_PERF_KEY, NAMING_KEY, TEMPLATE_KEY, ZIP_KEY,
      ASPECT_RATIO_KEY, CUSTOM_RATIO_W_KEY, CUSTOM_RATIO_H_KEY, CROP_MODE_KEY,
      DEDUP_KEY
    ]);

    console.log('IBD DEBUG: requestDownload settings:', settings);

    const tab = (await api.tabs.query({ active: true, currentWindow: true }))[0];
    const pageTitle = (tab && tab.title) ? tab.title.substring(0, 50).replace(/[\\/:*?"<>|]/g, '_') : 'Images';
    const site = (tab && tab.url) ? new URL(tab.url).hostname : 'any';

    // Dedup: filter out duplicate URLs if setting enabled (default on)
    const dedupEnabled = settings[DEDUP_KEY] !== false;
    const dedupedSelection = dedupEnabled ? Array.from(new Set(selection)) : selection;

    setStatus('Preparing downloads...');
    showProgress(0, dedupedSelection.length);

    const payload = {
      urls: dedupedSelection,
      quality: clampQuality(settings[QUALITY_KEY] ?? 90),
      downloadLocation: settings[ASK_LOCATION_KEY] ? 'ask' : 'default',
      format: settings[FORMAT_KEY] || 'original',
      folderName: settings[USE_SUBFOLDER_KEY] ? (settings[FOLDER_KEY] || '') : '',
      batchSize: Number(settings[BATCH_SIZE_KEY] || 5),
      downloadDelay: Number(settings[DELAY_KEY] || 100),
      lazy: !!settings[LAZY_KEY],
      lowPerf: !!settings[LOW_PERF_KEY],
      namingMode: settings[NAMING_KEY] || 'auto',
      customTemplate: settings[TEMPLATE_KEY] || '',
      zipBundle: els.zipDownloadToggle.checked,
      aspectRatio: els.aspectRatio.value,
      cropMode: els.cropMode.value,
      customRatioW: Number(els.customRatioW.value || 1),
      customRatioH: Number(els.customRatioH.value || 1),
      pageTitle,
      site
    };

    console.log('IBD DEBUG: Sending payload to background:', payload);

    // Simulate incremental progress via polling storage
    const total = dedupedSelection.length;
    let progressInterval = null;
    if (total > 1) {
      let simulated = 0;
      progressInterval = setInterval(() => {
        simulated = Math.min(simulated + 1, total - 1);
        showProgress(simulated, total);
      }, Math.max(300, Number(settings[DELAY_KEY] || 100) + 200));
    }

    try {
      const res = await api.runtime.sendMessage({ type: 'IBD_DOWNLOAD_SELECTED', payload });
      clearInterval(progressInterval);
      console.log('IBD DEBUG: Response from background:', res);
      if (res && res.ok) {
        showProgress(total, total);
        setStatus(`Downloaded ${total} image${total !== 1 ? 's' : ''}!`);
        // Record history
        try {
          for (const url of dedupedSelection) {
            await addHistoryEntry({
              url: url,
              thumb: url,
              filename: url.split('/').pop().split('?')[0] || 'image',
              page: site,
              ts: Date.now()
            });
          }
        } catch (_) {}
        setTimeout(() => {
          hideProgress();
          setStatus('');
          if (!els.stayOpenToggle?.checked) window.close();
        }, 1800);
      } else if (res && res.failures) {
        clearInterval(progressInterval);
        hideProgress();
        const firstErr = res.failures[0]?.error || 'Unknown error';
        setStatus(`Failed to download ${res.failures.length} images. (Error: ${firstErr})`, true);
      } else {
        clearInterval(progressInterval);
        hideProgress();
        setStatus('Error: ' + (res?.error || 'Unknown error'), true);
      }
    } catch (e) {
      clearInterval(progressInterval);
      hideProgress();
      setStatus('Sync error: ' + e.message, true);
    }
  }

  // --- SAFE INITIALIZATION ---
  async function init() {
    try {
      await loadSettings();
      await updateSelectedCount();
    } catch (err) {
      console.error('Init error:', err);
      setStatus('Init error: ' + err.message, true);
    }
  }

  // --- LISTENERS ---
  if (els.quality) {
    els.quality.oninput = () => { if (els.qualityValue) els.qualityValue.textContent = els.quality.value; };
    els.quality.onchange = () => saveSetting(QUALITY_KEY, Number(els.quality.value));
  }
  if (els.outputFormat) {
    els.outputFormat.onchange = () => {
      saveSetting(FORMAT_KEY, els.outputFormat.value);
      updateQualityVisibility();
    };
  }
  if (els.askLocationToggle) els.askLocationToggle.onchange = () => saveSetting(ASK_LOCATION_KEY, els.askLocationToggle.checked);
  if (els.useSubfolderToggle) {
    els.useSubfolderToggle.onchange = () => {
      saveSetting(USE_SUBFOLDER_KEY, els.useSubfolderToggle.checked);
      updateLocationVisibility();
    };
  }
  if (els.folderName) els.folderName.oninput = () => saveSetting(FOLDER_KEY, els.folderName.value);

  if (els.themeRadios) {
    els.themeRadios.forEach(i => i.onchange = () => { saveSetting(THEME_KEY, i.value); applyTheme(i.value); });
  }

  if (els.lowPerfToggle) {
    els.lowPerfToggle.onchange = () => {
      const enabled = els.lowPerfToggle.checked;
      saveSetting(LOW_PERF_KEY, enabled);
      updateLowPerfUI(enabled);
      if (enabled) {
        saveSetting(PREVIEW_KEY, false); saveSetting(OVERLAY_KEY, false);
        if (els.previewToggle) els.previewToggle.checked = false;
        if (els.overlayToggle) els.overlayToggle.checked = false;
      }
    };
  }

  if (els.previewToggle) els.previewToggle.onchange = () => saveSetting(PREVIEW_KEY, els.previewToggle.checked);
  if (els.overlayToggle) els.overlayToggle.onchange = () => saveSetting(OVERLAY_KEY, els.overlayToggle.checked);
  if (els.batchSize) els.batchSize.onchange = () => saveSetting(BATCH_SIZE_KEY, Number(els.batchSize.value));
  if (els.downloadDelay) els.downloadDelay.onchange = () => saveSetting(DELAY_KEY, Number(els.downloadDelay.value));
  if (els.maxSelection) els.maxSelection.onchange = () => saveSetting(MAX_SELECT_KEY, Number(els.maxSelection.value));
  if (els.lazyProcessToggle) els.lazyProcessToggle.onchange = () => saveSetting(LAZY_KEY, els.lazyProcessToggle.checked);

  if (els.minWidth) els.minWidth.onchange = () => {
    saveSetting(MIN_WIDTH_KEY, Number(els.minWidth.value));
    notifyMinSizeChange();
  };
  if (els.minHeight) els.minHeight.onchange = () => {
    saveSetting(MIN_HEIGHT_KEY, Number(els.minHeight.value));
    notifyMinSizeChange();
  };
  if (els.dedupToggle) els.dedupToggle.onchange = () => saveSetting(DEDUP_KEY, els.dedupToggle.checked);

  async function notifyMinSizeChange() {
    const tabId = await getActiveTabId();
    if (tabId) try {
      await api.tabs.sendMessage(tabId, {
        type: 'IBD_UPDATE_MIN_SIZE',
        payload: { minWidth: Number(els.minWidth.value), minHeight: Number(els.minHeight.value) }
      });
    } catch (_) {}
  }

  if (els.selectionMode) els.selectionMode.onchange = () => saveSetting(MODE_KEY, els.selectionMode.value);
  if (els.namingMode) {
    els.namingMode.onchange = () => {
      saveSetting(NAMING_KEY, els.namingMode.value);
      updateNamingVisibility();
    };
  }
  if (els.customTemplate) els.customTemplate.oninput = () => saveSetting(TEMPLATE_KEY, els.customTemplate.value);
  if (els.zipDownloadToggle) els.zipDownloadToggle.onchange = () => saveSetting(ZIP_KEY, els.zipDownloadToggle.checked);

  if (els.aspectRatio) {
    els.aspectRatio.onchange = () => {
      saveSetting(ASPECT_RATIO_KEY, els.aspectRatio.value);
      updateRatioVisibility();
    };
  }
  if (els.customRatioW) els.customRatioW.oninput = () => saveSetting(CUSTOM_RATIO_W_KEY, Number(els.customRatioW.value));
  if (els.customRatioH) els.customRatioH.oninput = () => saveSetting(CUSTOM_RATIO_H_KEY, Number(els.customRatioH.value));
  if (els.cropMode) els.cropMode.onchange = () => saveSetting(CROP_MODE_KEY, els.cropMode.value);

  if (els.enabledToggle) {
    els.enabledToggle.onchange = async () => {
      const enabled = els.enabledToggle.checked;
      await saveSetting(ENABLED_KEY, enabled);
      const tabId = await getActiveTabId();
      if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_SET_ENABLED', payload: { enabled } }); } catch (_) { }
      if (!enabled) {
        if (els.clearOnDisableToggle?.checked) {
          await saveSetting(STORAGE_KEY, []);
          await updateSelectedCount();
          const tabId = await getActiveTabId();
          if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_CLEAR_SELECTION' }); } catch (_) { }
        }
        setStatus('Selection off.');
      }
      else { setStatus('Selection on.'); }
    };
  }

  if (els.clearBtn) {
    els.clearBtn.onclick = async () => {
      await api.storage.local.set({ [STORAGE_KEY]: [] });
      const tabId = await getActiveTabId();
      if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_CLEAR_SELECTION' }); } catch (_) { }
      updateSelectedCount();
      setStatus('Cleared.');
    };
  }

  if (els.downloadBtn) els.downloadBtn.onclick = requestDownload;

  if (els.selectAllBtn) {
    els.selectAllBtn.onclick = async () => {
      // Ensure selection mode is enabled — IBD_SELECT_ALL is a no-op on the
      // content side when not enabled.
      const s = await api.storage.local.get(ENABLED_KEY);
      if (!s[ENABLED_KEY]) {
        await api.storage.local.set({ [ENABLED_KEY]: true });
        if (els.enabledToggle) els.enabledToggle.checked = true;
      }
      const tabId = await getActiveTabId();
      if (!tabId) { setStatus('No active tab.', true); return; }
      setStatus('Selecting all images…');
      els.selectAllBtn.disabled = true;
      try {
        await api.tabs.sendMessage(tabId, { type: 'IBD_SELECT_ALL' });
        // Give content script a tick to update storage, then refresh UI
        setTimeout(async () => {
          await updateSelectedCount();
          const stored = await api.storage.local.get(STORAGE_KEY);
          const n = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY].length : 0;
          setStatus(n ? `Selected ${n} image${n !== 1 ? 's' : ''}.` : 'No images matched the filter.');
          els.selectAllBtn.disabled = false;
        }, 300);
      } catch (err) {
        els.selectAllBtn.disabled = false;
        setStatus('Select All failed: open the page first, then try again.', true);
      }
    };
  }

  if (els.settingsBtn) els.settingsBtn.onclick = () => showView('settings');
  if (els.backBtn) els.backBtn.onclick = () => showView('home');
  if (els.stayOpenToggle) els.stayOpenToggle.onchange = () => saveSetting(STAY_OPEN_KEY, els.stayOpenToggle.checked);
  if (els.clearOnDisableToggle) els.clearOnDisableToggle.onchange = () => saveSetting(CLEAR_ON_DISABLE_KEY, els.clearOnDisableToggle.checked);
  if (els.popupSizePreset) {
    els.popupSizePreset.onchange = () => {
      saveSetting(POPUP_SIZE_PRESET_KEY, els.popupSizePreset.value);
      updateSizeVisibility();
      applyPopupSize();
    };
  }
  if (els.popupWidth) els.popupWidth.oninput = () => { saveSetting(POPUP_WIDTH_KEY, Number(els.popupWidth.value)); applyPopupSize(); };
  if (els.popupHeight) els.popupHeight.oninput = () => { saveSetting(POPUP_HEIGHT_KEY, Number(els.popupHeight.value)); applyPopupSize(); };
  if (els.githubBtn) els.githubBtn.onclick = () => api.tabs.create({ url: 'https://github.com/Mst888/Photo-Grab' });

  if (els.shortcutsToggle) els.shortcutsToggle.onchange = () => saveSetting(SHORTCUTS_ENABLED_KEY, els.shortcutsToggle.checked);
  if (els.resetShortcutsBtn) {
    els.resetShortcutsBtn.onclick = async () => {
      currentShortcuts = { ...DEFAULT_SHORTCUTS };
      await saveSetting(SHORTCUTS_DATA_KEY, currentShortcuts);
      updateShortcutUI();
      setStatus('Shortcuts reset.');
    };
  }
  if (els.editShortcutBtns) {
    els.editShortcutBtns.forEach(btn => {
      btn.onclick = () => startRecording(btn.dataset.action);
    });
  }

  if (els.converterEnabledToggle) {
    els.converterEnabledToggle.onchange = async () => {
      const enabled = els.converterEnabledToggle.checked;
      await saveSetting(CONVERTER_ENABLED_KEY, enabled);
      const tabId = await getActiveTabId();
      if (tabId) try { await api.tabs.sendMessage(tabId, { type: 'IBD_CONVERTER_TOGGLE', payload: { enabled } }); } catch (_) { }
    };
  }
  async function applyConverterToolbarToggle(visible) {
    await saveSetting(CONVERTER_TOOLBAR_KEY, visible);
    // Toolbar açılınca converter'ı da enable et; kapatınca converter enabled durumuna dokunma
    if (visible) {
      await saveSetting(CONVERTER_ENABLED_KEY, true);
      if (els.converterEnabledToggle) els.converterEnabledToggle.checked = true;
    }
    if (els.converterToolbarToggle) els.converterToolbarToggle.checked = visible;
    if (els.converterToolbarToggleSettings) els.converterToolbarToggleSettings.checked = visible;
    const tabId = await getActiveTabId();
    if (tabId) {
      try {
        await api.tabs.sendMessage(tabId, {
          type: 'IBD_CONVERTER_TOOLBAR_TOGGLE',
          payload: { visible, forceEnabled: visible }
        });
      } catch (_) { }
    }
  }
  if (els.converterToolbarToggle) {
    els.converterToolbarToggle.onchange = async () => {
      await applyConverterToolbarToggle(els.converterToolbarToggle.checked);
    };
  }
  if (els.converterToolbarToggleSettings) {
    els.converterToolbarToggleSettings.onchange = async () => {
      await applyConverterToolbarToggle(els.converterToolbarToggleSettings.checked);
    };
  }
  if (els.converterFormat) els.converterFormat.onchange = () => saveSetting(CONVERTER_FORMAT_KEY, els.converterFormat.value);
  if (els.converterQuality) {
    els.converterQuality.oninput = () => { if (els.converterQualityValue) els.converterQualityValue.textContent = els.converterQuality.value; };
    els.converterQuality.onchange = () => saveSetting(CONVERTER_QUALITY_KEY, Number(els.converterQuality.value));
  }
  if (els.converterAutoDownloadToggle) els.converterAutoDownloadToggle.onchange = () => saveSetting(CONVERTER_AUTO_DOWNLOAD_KEY, els.converterAutoDownloadToggle.checked);

  if (els.languageSelect) {
    els.languageSelect.onchange = () => {
      const lang = els.languageSelect.value;
      saveSetting(LANGUAGE_KEY, lang);
      applyLanguage(lang);
    };
  }

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[STORAGE_KEY]) updateSelectedCount();
    if (changes[LOW_PERF_KEY]) updateLowPerfUI(!!changes[LOW_PERF_KEY].newValue);
  });

  // ===== SETTINGS SIDEBAR NAV =====
  (function initSettingsNav() {
    const navItems = document.querySelectorAll('.ibd-nav-item');
    const sections = document.querySelectorAll('.ibd-settings-section');

    function activateSection(target) {
      navItems.forEach(b => b.classList.remove('ibd-nav-item--active'));
      const activeBtn = [...navItems].find(b => b.dataset.section === target);
      if (activeBtn) activeBtn.classList.add('ibd-nav-item--active');

      if (target === 'all') {
        sections.forEach(s => { s.style.display = ''; });
      } else {
        sections.forEach(s => {
          s.style.display = s.id === 'settingsSection-' + target ? '' : 'none';
        });
      }
    }

    navItems.forEach(btn => {
      btn.addEventListener('click', () => activateSection(btn.dataset.section));
    });

    // Default: show all
    activateSection('all');
  })();

  // ===== HOME TABS =====
  (function initHomeTabs() {
    const tabs = document.querySelectorAll('.ibd-home-tab');
    const panels = document.querySelectorAll('.ibd-home-tab-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('ibd-home-tab--active'));
        tab.classList.add('ibd-home-tab--active');
        panels.forEach(p => {
          p.style.display = p.id === 'homeTab-' + target ? '' : 'none';
        });
        if (target === 'history') renderHistory();
        if (target === 'collections') renderCollections();
      });
    });
  })();

  // ===== HISTORY =====
  async function getHistory() {
    const s = await api.storage.local.get(HISTORY_KEY);
    return s[HISTORY_KEY] || [];
  }
  async function saveHistory(list) {
    await api.storage.local.set({ [HISTORY_KEY]: list });
  }
  async function addHistoryEntry(entry) {
    const list = await getHistory();
    list.unshift(entry);
    if (list.length > 200) list.length = 200;
    await saveHistory(list);
  }

  function renderHistory() {
    const el = document.getElementById('historyList');
    if (!el) return;
    getHistory().then(list => {
      if (!list.length) {
        el.innerHTML = '<div class="ibd-empty-state">No downloads yet</div>';
        return;
      }
      el.innerHTML = '';
      list.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'ibd-history-item';

        const img = document.createElement('img');
        img.className = 'ibd-history-thumb';
        img.src = item.thumb || item.url;
        img.onerror = () => { img.style.display = 'none'; };

        const info = document.createElement('div');
        info.className = 'ibd-history-info';

        const urlEl = document.createElement('div');
        urlEl.className = 'ibd-history-url';
        urlEl.textContent = item.filename || item.url;
        urlEl.title = item.url;

        const meta = document.createElement('div');
        meta.className = 'ibd-history-meta';
        const d = new Date(item.ts);
        meta.textContent = d.toLocaleDateString() + ' · ' + (item.page || '');

        info.appendChild(urlEl);
        info.appendChild(meta);

        const del = document.createElement('button');
        del.className = 'ibd-history-del';
        del.textContent = '✕';
        del.title = 'Remove';
        const capturedTs = item.ts;
        del.addEventListener('click', async () => {
          const l = await getHistory();
          const idx = l.findIndex(x => x.ts === capturedTs && x.url === item.url);
          if (idx !== -1) l.splice(idx, 1);
          await saveHistory(l);
          renderHistory();
        });

        row.appendChild(img);
        row.appendChild(info);
        row.appendChild(del);
        el.appendChild(row);
      });
    });
  }

  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      await saveHistory([]);
      renderHistory();
    });
  }

  // History recording is handled inside requestDownload()

  // ===== COLLECTIONS =====
  async function getCollections() {
    const s = await api.storage.local.get(COLLECTIONS_KEY);
    return s[COLLECTIONS_KEY] || [];
  }
  async function saveCollections(list) {
    await api.storage.local.set({ [COLLECTIONS_KEY]: list });
  }

  let activeCollectionIndex = null;

  function renderCollections() {
    const listEl = document.getElementById('collectionList');
    const detailEl = document.getElementById('collectionDetail');
    if (!listEl) return;
    if (detailEl) detailEl.style.display = 'none';
    listEl.style.display = 'flex';

    getCollections().then(cols => {
      if (!cols.length) {
        listEl.innerHTML = '<div class="ibd-empty-state">No collections yet</div>';
        return;
      }
      listEl.innerHTML = '';
      cols.forEach((col, i) => {
        const item = document.createElement('div');
        item.className = 'ibd-collection-item';

        const name = document.createElement('span');
        name.className = 'ibd-collection-item-name';
        name.textContent = col.name;

        const actions = document.createElement('div');
        actions.className = 'ibd-collection-item-actions';

        const badge = document.createElement('span');
        badge.className = 'ibd-text-badge';
        badge.textContent = (col.images || []).length;

        const del = document.createElement('button');
        del.className = 'ibd-collection-del';
        del.textContent = '✕';
        del.title = 'Delete collection';
        const capturedName = col.name;
        del.addEventListener('click', async e => {
          e.stopPropagation();
          const list = await getCollections();
          const idx = list.findIndex(c => c.name === capturedName);
          if (idx !== -1) list.splice(idx, 1);
          await saveCollections(list);
          renderCollections();
        });

        actions.appendChild(badge);
        actions.appendChild(del);
        item.appendChild(name);
        item.appendChild(actions);

        item.addEventListener('click', () => openCollectionDetail(col.name));
        listEl.appendChild(item);
      });
    });
  }

  function openCollectionDetail(colName) {
    activeCollectionIndex = colName;
    const listEl = document.getElementById('collectionList');
    const detailEl = document.getElementById('collectionDetail');
    const nameEl = document.getElementById('collectionDetailName');
    const countEl = document.getElementById('collectionDetailCount');
    const galleryEl = document.getElementById('collectionDetailGallery');
    if (!detailEl || !listEl) return;

    getCollections().then(cols => {
      const col = cols.find(c => c.name === colName);
      if (!col) return;
      listEl.style.display = 'none';
      detailEl.style.display = 'block';
      if (nameEl) nameEl.textContent = col.name;
      if (countEl) countEl.textContent = (col.images || []).length + ' imgs';
      galleryEl.innerHTML = '';
      (col.images || []).forEach(imgUrl => {
        const wrap = document.createElement('div');
        wrap.className = 'ibd-thumb-container';
        const img = document.createElement('img');
        img.className = 'ibd-thumb-img';
        img.src = imgUrl;
        img.onerror = () => { img.style.opacity = '0.3'; };
        const rm = document.createElement('span');
        rm.className = 'ibd-thumb-remove';
        rm.textContent = '✕';
        rm.addEventListener('click', async () => {
          const list = await getCollections();
          const target = list.find(c => c.name === colName);
          if (target) {
            const imgIdx = target.images.indexOf(imgUrl);
            if (imgIdx !== -1) target.images.splice(imgIdx, 1);
          }
          await saveCollections(list);
          openCollectionDetail(colName);
        });
        wrap.appendChild(img);
        wrap.appendChild(rm);
        galleryEl.appendChild(wrap);
      });
    });
  }

  const collectionBackBtn = document.getElementById('collectionBackBtn');
  if (collectionBackBtn) {
    collectionBackBtn.addEventListener('click', () => {
      activeCollectionIndex = null;
      renderCollections();
    });
  }

  const addCollectionBtn = document.getElementById('addCollectionBtn');
  const newCollectionInput = document.getElementById('newCollectionInput');
  if (addCollectionBtn && newCollectionInput) {
    addCollectionBtn.addEventListener('click', async () => {
      const name = newCollectionInput.value.trim();
      if (!name) return;
      const list = await getCollections();
      if (list.find(c => c.name === name)) return;
      list.push({ name, images: [] });
      await saveCollections(list);
      newCollectionInput.value = '';
      renderCollections();
    });
    newCollectionInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') addCollectionBtn.click();
    });
  }

  const addToCollectionBtn = document.getElementById('addToCollectionBtn');
  if (addToCollectionBtn) {
    addToCollectionBtn.addEventListener('click', async () => {
      if (activeCollectionIndex === null) return;
      const s = await api.storage.local.get(STORAGE_KEY);
      const imgs = s[STORAGE_KEY] || [];
      if (!imgs.length) { return; }
      const list = await getCollections();
      const col = list.find(c => c.name === activeCollectionIndex);
      if (!col) return;
      const existing = new Set(col.images || []);
      imgs.forEach(url => {
        if (typeof url === 'string' && !existing.has(url)) {
          col.images.push(url);
          existing.add(url);
        }
      });
      await saveCollections(list);
      openCollectionDetail(activeCollectionIndex);
    });
  }

  // ===== CLOUD UPLOAD =====
  // Each user authenticates with their OWN OAuth client. Keys are stored
  // locally in browser.storage.local — never sent anywhere except the
  // provider during the OAuth flow.
  //
  // Provider consoles:
  //   Google Drive : console.cloud.google.com  → OAuth 2.0 Client ID (Web)
  //   Dropbox      : dropbox.com/developers/apps → App key
  //   OneDrive     : portal.azure.com → App registrations → Application (client) ID
  //
  // Redirect URI is shown in the Cloud settings panel.

  const CLOUD_API_KEYS_STORAGE = 'ibd_cloud_api_keys_v1';
  const PROVIDER_LABELS = { gdrive: 'Google Drive', dropbox: 'Dropbox', onedrive: 'OneDrive' };

  let cloudApiKeys = { gdrive: '', dropbox: '', onedrive: '' };

  async function loadCloudApiKeys() {
    const s = await api.storage.local.get(CLOUD_API_KEYS_STORAGE);
    cloudApiKeys = { gdrive: '', dropbox: '', onedrive: '', ...(s[CLOUD_API_KEYS_STORAGE] || {}) };
    const gd = document.getElementById('apiKeyGdrive');
    const db = document.getElementById('apiKeyDropbox');
    const od = document.getElementById('apiKeyOnedrive');
    if (gd) gd.value = cloudApiKeys.gdrive || '';
    if (db) db.value = cloudApiKeys.dropbox || '';
    if (od) od.value = cloudApiKeys.onedrive || '';
    refreshConnectedButtons();
  }

  async function refreshConnectedButtons() {
    const tokens = await api.storage.local.get([
      'ibd_cloud_token_gdrive', 'ibd_cloud_token_dropbox', 'ibd_cloud_token_onedrive'
    ]);
    const map = { gdrive: 'cloud_token_gdrive', dropbox: 'cloud_token_dropbox', onedrive: 'cloud_token_onedrive' };
    let anyConnected = false;
    Object.keys(map).forEach(p => {
      const btn = document.querySelector(`.ibd-cloud-btn[data-provider="${p}"]`);
      if (!btn) return;
      const has = !!tokens['ibd_' + map[p]];
      btn.classList.toggle('ibd-cloud-connected', has);
      if (has) anyConnected = true;
    });
    const upBtn = document.getElementById('cloudUploadBtn');
    if (upBtn) upBtn.disabled = !anyConnected;
  }

  function buildAuthUrl(provider, redirectUri) {
    const enc = encodeURIComponent;
    const id = cloudApiKeys[provider];
    if (!id) return null;
    if (provider === 'gdrive') {
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${enc(id)}&redirect_uri=${enc(redirectUri)}&response_type=token&scope=${enc('https://www.googleapis.com/auth/drive.file')}&include_granted_scopes=true`;
    }
    if (provider === 'dropbox') {
      return `https://www.dropbox.com/oauth2/authorize?client_id=${enc(id)}&redirect_uri=${enc(redirectUri)}&response_type=token`;
    }
    if (provider === 'onedrive') {
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${enc(id)}&redirect_uri=${enc(redirectUri)}&response_type=token&scope=${enc('files.readwrite offline_access')}`;
    }
    return null;
  }

  function setCloudStatus(text, isError) {
    const el = document.getElementById('cloudStatus');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#e25b5b' : '';
  }

  document.querySelectorAll('.ibd-cloud-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.provider;
      if (!cloudApiKeys[provider]) {
        setCloudStatus(`⚠ Enter your ${PROVIDER_LABELS[provider]} API key first (see fields below), then click Save API Keys.`, true);
        return;
      }
      try {
        const redirectUri = api.identity.getRedirectURL();
        const authUrl = buildAuthUrl(provider, redirectUri);
        if (!authUrl) { setCloudStatus('Could not build auth URL.', true); return; }
        setCloudStatus(`Waiting for ${PROVIDER_LABELS[provider]} authorization...`);

        const responseUrl = await api.identity.launchWebAuthFlow({ url: authUrl, interactive: true });
        const hash = new URL(responseUrl).hash.slice(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
          btn.classList.add('ibd-cloud-connected');
          setCloudStatus(`✓ ${PROVIDER_LABELS[provider]} connected! Use Upload to send selection.`);
          await api.storage.local.set({ ['ibd_cloud_token_' + provider]: token });
          refreshConnectedButtons();
        } else {
          setCloudStatus('Auth failed — no token received.', true);
        }
      } catch (err) {
        setCloudStatus('Auth cancelled or failed: ' + (err && err.message || err), true);
      }
    });
  });

  // Save / clear API keys
  (function initCloudKeyControls() {
    const saveBtn = document.getElementById('saveApiKeysBtn');
    const clearBtn = document.getElementById('clearCloudTokensBtn');
    const redirectInput = document.getElementById('cloudRedirectUri');
    const copyBtn = document.getElementById('copyRedirectBtn');
    const uploadBtn = document.getElementById('cloudUploadBtn');

    if (redirectInput && api.identity && api.identity.getRedirectURL) {
      try { redirectInput.value = api.identity.getRedirectURL(); } catch (_) {}
    }
    if (copyBtn && redirectInput) {
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(redirectInput.value); copyBtn.textContent = 'Copied!'; setTimeout(() => copyBtn.textContent = 'Copy', 1200); } catch (_) {}
      };
    }
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const gd = document.getElementById('apiKeyGdrive');
        const db = document.getElementById('apiKeyDropbox');
        const od = document.getElementById('apiKeyOnedrive');
        cloudApiKeys = {
          gdrive:   (gd && gd.value || '').trim(),
          dropbox:  (db && db.value || '').trim(),
          onedrive: (od && od.value || '').trim()
        };
        await api.storage.local.set({ [CLOUD_API_KEYS_STORAGE]: cloudApiKeys });
        setCloudStatus('✓ API keys saved locally. Click a provider above to connect.');
      };
    }
    if (clearBtn) {
      clearBtn.onclick = async () => {
        await api.storage.local.remove([
          'ibd_cloud_token_gdrive', 'ibd_cloud_token_dropbox', 'ibd_cloud_token_onedrive'
        ]);
        document.querySelectorAll('.ibd-cloud-btn').forEach(b => b.classList.remove('ibd-cloud-connected'));
        if (uploadBtn) uploadBtn.disabled = true;
        setCloudStatus('All cloud accounts disconnected.');
      };
    }
    if (uploadBtn) {
      uploadBtn.onclick = async () => {
        const provSel = document.getElementById('cloudUploadProvider');
        const provider = provSel ? provSel.value : 'gdrive';
        const tokenKey = 'ibd_cloud_token_' + provider;
        const tokens = await api.storage.local.get(tokenKey);
        const token = tokens[tokenKey];
        if (!token) { setCloudStatus(`Connect to ${PROVIDER_LABELS[provider]} first.`, true); return; }

        const stored = await api.storage.local.get(STORAGE_KEY);
        const selection = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
        if (!selection.length) { setCloudStatus('No images selected to upload.', true); return; }

        uploadBtn.disabled = true;
        setCloudStatus(`Uploading ${selection.length} image(s) to ${PROVIDER_LABELS[provider]}...`);
        try {
          const res = await api.runtime.sendMessage({
            type: 'IBD_CLOUD_UPLOAD',
            payload: { provider, token, urls: selection, folder: 'Photo-Grab' }
          });
          if (res && res.ok) {
            setCloudStatus(`✓ Uploaded ${res.uploaded}/${selection.length} to ${PROVIDER_LABELS[provider]}.`);
          } else {
            setCloudStatus('Upload failed: ' + (res && res.error || 'unknown error'), true);
          }
        } catch (e) {
          setCloudStatus('Upload error: ' + e.message, true);
        } finally {
          uploadBtn.disabled = false;
        }
      };
    }

    loadCloudApiKeys();
  })();

  // ===== CUSTOM PRIMARY COLOR =====
  const CUSTOM_COLOR_KEY = 'ibd_customPrimaryColor_v1';

  function applyCustomPrimaryColor(color) {
    if (color) {
      document.documentElement.style.setProperty('--ibd-primary', color);
      // Derive a lighter version for primary-light
      document.documentElement.style.setProperty('--ibd-primary-light', color + '22');
    } else {
      document.documentElement.style.removeProperty('--ibd-primary');
      document.documentElement.style.removeProperty('--ibd-primary-light');
    }
  }

  (function initCustomColor() {
    const colorInput = document.getElementById('customPrimaryColorInput');
    const resetBtn = document.getElementById('resetPrimaryColorBtn');
    if (!colorInput) return;

    api.storage.local.get(CUSTOM_COLOR_KEY).then(s => {
      const saved = s[CUSTOM_COLOR_KEY];
      if (saved) {
        colorInput.value = saved;
        applyCustomPrimaryColor(saved);
      }
    });

    colorInput.addEventListener('input', async () => {
      const color = colorInput.value;
      applyCustomPrimaryColor(color);
      await api.storage.local.set({ [CUSTOM_COLOR_KEY]: color });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        colorInput.value = '#5b5ef4';
        applyCustomPrimaryColor(null);
        await api.storage.local.remove(CUSTOM_COLOR_KEY);
      });
    }
  })();

  // ===== CUSTOM THEME BUILDER =====
  const CUSTOM_THEME_KEY = 'ibd_customThemeVars_v1';

  const CUSTOM_THEME_PRESETS = {
    midnight: { accent: '#818cf8', bgPopup: '#0d1117', bgCard: '#161b22', textMain: '#e6edf3', textSub: '#8b949e', border: '#30363d' },
    forest:   { accent: '#22c55e', bgPopup: '#0f1f0f', bgCard: '#162116', textMain: '#dcfce7', textSub: '#86efac', border: '#166534' },
    sunset:   { accent: '#f97316', bgPopup: '#1c0a00', bgCard: '#2d1200', textMain: '#fed7aa', textSub: '#fb923c', border: '#7c2d12' },
    ocean:    { accent: '#38bdf8', bgPopup: '#0c1a2e', bgCard: '#0f2744', textMain: '#e0f2fe', textSub: '#7dd3fc', border: '#0e4a7a' },
    rose:     { accent: '#fb7185', bgPopup: '#1c0010', bgCard: '#2a0018', textMain: '#ffe4e6', textSub: '#fda4af', border: '#9f1239' },
  };

  const CUSTOM_THEME_DEFAULT = {
    accent: '#5b5ef4', bgPopup: '#f4f6fb', bgCard: '#ffffff',
    textMain: '#0f172a', textSub: '#4b5675', border: '#e3e8f0'
  };

  const ctFields = [
    { id: 'ctAccent',   valId: 'ctAccentVal',   prop: 'accent'   },
    { id: 'ctBgPopup',  valId: 'ctBgPopupVal',  prop: 'bgPopup'  },
    { id: 'ctBgCard',   valId: 'ctBgCardVal',   prop: 'bgCard'   },
    { id: 'ctTextMain', valId: 'ctTextMainVal',  prop: 'textMain' },
    { id: 'ctTextSub',  valId: 'ctTextSubVal',   prop: 'textSub'  },
    { id: 'ctBorder',   valId: 'ctBorderVal',    prop: 'border'   },
  ];

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function applyCustomThemeVars(vars) {
    const root = document.documentElement;
    root.style.setProperty('--ibd-custom-primary', vars.accent);
    root.style.setProperty('--ibd-custom-primary-hover', vars.accent + 'cc');
    root.style.setProperty('--ibd-custom-primary-light', hexToRgba(vars.accent, 0.12));
    root.style.setProperty('--ibd-custom-bg-popup', vars.bgPopup);
    root.style.setProperty('--ibd-custom-bg-card', vars.bgCard);
    root.style.setProperty('--ibd-custom-bg-stat', vars.bgPopup);
    root.style.setProperty('--ibd-custom-bg-section', vars.bgPopup);
    root.style.setProperty('--ibd-custom-bg-toggle', vars.bgCard);
    root.style.setProperty('--ibd-custom-bg-input', vars.bgCard);
    root.style.setProperty('--ibd-custom-text-main', vars.textMain);
    root.style.setProperty('--ibd-custom-text-sub', vars.textSub);
    root.style.setProperty('--ibd-custom-text-muted', vars.textSub + '99');
    root.style.setProperty('--ibd-custom-border', vars.border);
    root.style.setProperty('--ibd-custom-border-hover', vars.accent);
  }

  function clearCustomThemeVars() {
    const root = document.documentElement;
    ['--ibd-custom-primary','--ibd-custom-primary-hover','--ibd-custom-primary-light',
     '--ibd-custom-bg-popup','--ibd-custom-bg-card','--ibd-custom-bg-stat',
     '--ibd-custom-bg-section','--ibd-custom-bg-toggle','--ibd-custom-bg-input',
     '--ibd-custom-text-main','--ibd-custom-text-sub','--ibd-custom-text-muted',
     '--ibd-custom-border','--ibd-custom-border-hover'
    ].forEach(p => root.style.removeProperty(p));
  }

  function syncCustomThemeInputs(vars) {
    ctFields.forEach(f => {
      const inp = document.getElementById(f.id);
      const lbl = document.getElementById(f.valId);
      if (inp) inp.value = vars[f.prop] || CUSTOM_THEME_DEFAULT[f.prop];
      if (lbl) lbl.textContent = vars[f.prop] || CUSTOM_THEME_DEFAULT[f.prop];
    });
  }

  function toggleCustomThemeBuilder(isCustom) {
    const builder = document.getElementById('customThemeBuilder');
    const primaryRow = document.getElementById('primaryColorRow');
    if (builder) builder.style.display = isCustom ? '' : 'none';
    if (primaryRow) primaryRow.style.display = isCustom ? 'none' : '';
  }

  (function initCustomThemeBuilder() {
    const builder = document.getElementById('customThemeBuilder');
    if (!builder) return;

    let currentVars = { ...CUSTOM_THEME_DEFAULT };

    api.storage.local.get(CUSTOM_THEME_KEY).then(s => {
      if (s[CUSTOM_THEME_KEY]) {
        currentVars = { ...CUSTOM_THEME_DEFAULT, ...s[CUSTOM_THEME_KEY] };
      }
      syncCustomThemeInputs(currentVars);
      const activeTheme = document.querySelector('input[name="theme"]:checked');
      if (activeTheme && activeTheme.value === 'custom') {
        applyCustomThemeVars(currentVars);
        toggleCustomThemeBuilder(true);
      }
    });

    async function saveAndApply(vars) {
      currentVars = { ...vars };
      syncCustomThemeInputs(currentVars);
      applyCustomThemeVars(currentVars);
      await api.storage.local.set({ [CUSTOM_THEME_KEY]: currentVars });
    }

    ctFields.forEach(f => {
      const inp = document.getElementById(f.id);
      const lbl = document.getElementById(f.valId);
      if (!inp) return;
      inp.addEventListener('input', async () => {
        if (lbl) lbl.textContent = inp.value;
        currentVars[f.prop] = inp.value;
        await saveAndApply(currentVars);
      });
    });

    document.querySelectorAll('.ibd-custom-theme-preset').forEach(btn => {
      btn.addEventListener('click', async () => {
        const preset = CUSTOM_THEME_PRESETS[btn.dataset.preset];
        if (preset) await saveAndApply({ ...CUSTOM_THEME_DEFAULT, ...preset });
      });
    });

    const resetBtn = document.getElementById('customThemeResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        await saveAndApply({ ...CUSTOM_THEME_DEFAULT });
      });
    }

    // Hook into theme radio changes to show/hide builder
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const isCustom = radio.value === 'custom';
        toggleCustomThemeBuilder(isCustom);
        if (isCustom) {
          applyCustomThemeVars(currentVars);
        } else {
          clearCustomThemeVars();
        }
      });
    });
  })();

  // ===== WALKTHROUGH =====
  const WALKTHROUGH_SEEN_KEY = 'ibd_walkthroughSeen_v1';
  const WALKTHROUGH_TOTAL = 3;

  (function initWalkthrough() {
    const overlay   = document.getElementById('walkthroughOverlay');
    const nextBtn   = document.getElementById('walkthroughNextBtn');
    const skipBtn   = document.getElementById('walkthroughSkipBtn');
    const helpBtn   = document.getElementById('helpBtn');
    const steps     = document.querySelectorAll('.ibd-walkthrough-step');
    const dots      = document.querySelectorAll('.ibd-walkthrough-dot');
    if (!overlay) return;

    let currentStep = 0;

    function showStep(n) {
      steps.forEach((s, i) => { s.style.display = i === n ? '' : 'none'; });
      dots.forEach((d, i) => {
        d.classList.toggle('ibd-walkthrough-dot--active', i === n);
      });
      if (nextBtn) {
        nextBtn.textContent = n === WALKTHROUGH_TOTAL - 1
          ? (window._ibdT ? window._ibdT('walkthroughDone') : 'Get Started!')
          : (window._ibdT ? window._ibdT('walkthroughNext') : 'Next');
      }
      currentStep = n;
    }

    function openWalkthrough() {
      currentStep = 0;
      showStep(0);
      overlay.style.display = 'flex';
    }

    function closeWalkthrough() {
      overlay.style.display = 'none';
      api.storage.local.set({ [WALKTHROUGH_SEEN_KEY]: true });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentStep < WALKTHROUGH_TOTAL - 1) {
          showStep(currentStep + 1);
        } else {
          closeWalkthrough();
        }
      });
    }

    if (skipBtn) skipBtn.addEventListener('click', closeWalkthrough);

    // ? button always opens walkthrough
    if (helpBtn) helpBtn.addEventListener('click', openWalkthrough);

    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeWalkthrough();
    });

    // Show on first open
    api.storage.local.get(WALKTHROUGH_SEEN_KEY).then(s => {
      if (!s[WALKTHROUGH_SEEN_KEY]) openWalkthrough();
    });
  })();

  // Load custom color on startup
  api.storage.local.get(CUSTOM_COLOR_KEY).then(s => {
    if (s[CUSTOM_COLOR_KEY]) applyCustomPrimaryColor(s[CUSTOM_COLOR_KEY]);
  });

  // ===== WORD EXPORT =====
  if (els.exportWordBtn) {
    els.exportWordBtn.onclick = async () => {
      const stored = await api.storage.local.get(STORAGE_KEY);
      const urls = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
      if (!urls.length) return setStatus('No images selected.', true);
      setStatus('Generating Word document...');
      try {
        const tab = (await api.tabs.query({ active: true, currentWindow: true }))[0];
        const pageTitle = (tab && tab.title) ? tab.title.substring(0, 50).replace(/[\\/:*?"<>|]/g, '_') : 'Images';
        const res = await api.runtime.sendMessage({ type: 'IBD_EXPORT_WORD', payload: { urls, pageTitle } });
        if (res && res.ok) setStatus('Word document downloaded.');
        else setStatus('Word export failed: ' + (res && res.error ? res.error : 'Unknown error'), true);
      } catch (e) {
        setStatus('Word export error: ' + e.message, true);
      }
    };
  }

  // ===== POWERPOINT EXPORT =====
  if (els.exportPptBtn) {
    els.exportPptBtn.onclick = async () => {
      const stored = await api.storage.local.get(STORAGE_KEY);
      const urls = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
      if (!urls.length) return setStatus('No images selected.', true);
      setStatus('Generating PowerPoint...');
      try {
        const tab = (await api.tabs.query({ active: true, currentWindow: true }))[0];
        const pageTitle = (tab && tab.title) ? tab.title.substring(0, 50).replace(/[\\/:*?"<>|]/g, '_') : 'Images';
        const res = await api.runtime.sendMessage({ type: 'IBD_EXPORT_PPT', payload: { urls, pageTitle } });
        if (res && res.ok) setStatus('PowerPoint downloaded.');
        else setStatus('PPT export failed: ' + (res && res.error ? res.error : 'Unknown error'), true);
      } catch (e) {
        setStatus('PPT export error: ' + e.message, true);
      }
    };
  }

  // ===== IMAGE FILTERS =====
  if (els.filterBtns) {
    els.filterBtns.forEach(btn => {
      btn.onclick = async () => {
        const filter = btn.dataset.filter;
        const stored = await api.storage.local.get(STORAGE_KEY);
        const urls = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
        if (!urls.length) return setStatus('No images selected.', true);
        setStatus(`Applying ${filter} filter...`);
        try {
          const res = await api.runtime.sendMessage({ type: 'IBD_APPLY_FILTER', payload: { urls, filter } });
          if (res && res.ok) {
            await api.storage.local.set({ [STORAGE_KEY]: res.filteredUrls });
            await renderPreviewGallery();
            setStatus(`${filter} filter applied.`);
          } else {
            setStatus('Filter failed: ' + (res && res.error ? res.error : 'Unknown'), true);
          }
        } catch (e) {
          setStatus('Filter error: ' + e.message, true);
        }
      };
    });
  }

  // ===== FILE CONVERT =====
  if (els.convertBtn) {
    els.convertBtn.onclick = async () => {
      const files = els.fileUpload && els.fileUpload.files;
      if (!files || files.length === 0) return setStatus('No files selected.', true);
      const format = els.uploadFormat ? els.uploadFormat.value : 'jpeg';
      const ext = format === 'jpeg' ? 'jpg' : format;
      const mimeType = format === 'jpeg' ? 'image/jpeg' : (format === 'png' ? 'image/png' : 'image/webp');
      const quality = format === 'png' ? 1 : 0.9;
      setStatus(`Converting ${files.length} file(s)...`);

      let done = 0;
      for (const file of files) {
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const converted = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              if (format !== 'png') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
              }, mimeType, quality);
            };
            img.onerror = reject;
            img.src = dataUrl;
          });

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const filename = `${baseName}_converted.${ext}`;
          const blobUrl = URL.createObjectURL(converted);
          await api.downloads.download({ url: blobUrl, filename, saveAs: false, conflictAction: 'uniquify' });
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
          done++;
        } catch (e) {
          console.error('[Photo-Grab] Convert error for', file.name, e);
        }
      }

      if (done === files.length) setStatus(`${done} file(s) converted and downloaded.`);
      else setStatus(`${done}/${files.length} converted. Some files failed.`, done < files.length);
      els.fileUpload.value = '';
    };
  }

  init();
})();
