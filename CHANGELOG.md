# Changelog

## [1.8.3] - 2026-03-05

### ✨ Yeni Özellikler

**📜 İndirme Geçmişi (Download History)**
- Her başarılı indirmede otomatik kayıt (URL, dosya adı, sayfa adresi, tarih/saat)
- Home sekmesinde History tabından görüntüleme, thumbnail önizleme
- Tek tıkla bireysel kayıt silme, Tümünü Temizle butonu
- Maksimum 200 kayıt (en eski otomatik silinir)

**📁 Koleksiyonlar (Collections)**
- İsimli koleksiyon oluşturma, seçili görselleri tek tıkla ekleme
- Koleksiyon detay görünümü — içindeki görseller galeri olarak listelenir
- Koleksiyondan görsel kaldırma ve koleksiyon silme
- Home sekmesinde Collections tabından erişim

**☁️ Bulut Yükleme (Cloud Upload) — Placeholder**
- Google Drive, Dropbox, OneDrive için OAuth bağlantı butonları (`browser.identity.launchWebAuthFlow`)
- Settings → Cloud sekmesinden erişim
- Henüz tamamlanmamış, placeholder olarak bırakıldı

**🎨 Özel Tema Rengi (Custom Primary Color)**
- Settings → Theme sekmesinde Primary Color renk seçici
- Seçilen renk anlık olarak tüm UI'a uygulanır (`--ibd-primary` CSS değişkeni)
- Renk tercihi storage'a kaydedilir; Reset butonu ile varsayılana dönme

**🖌️ Özelleştirilmiş Tema (Custom Theme Builder)**
- Tema seçiciye 7. seçenek olarak "Custom" eklendi
- 6 renk parametresi anlık olarak düzenlenebilir: Accent, Background, Card, Text, Subtitle, Border
- Her renk değişikliği canlı olarak tüm UI'a yansır
- 5 hazır preset: **Midnight**, **Forest**, **Sunset**, **Ocean**, **Rose**
- Tema tercihleri storage'a kaydedilir; Reset butonu ile varsayılana dönme
- Custom tema aktifken Primary Color seçici gizlenir, Custom Builder gösterilir

**🧭 Walkthrough Rehberi**
- İlk açılışta otomatik 3 adımlı rehber (Görsel Seçimi → İndirme → Geçmiş/Koleksiyonlar)
- Header'daki ? butonu ile istediğinde tekrar açılabilir
- Dot indikatör, Skip ve backdrop ile kapanma

**🌍 Çoklu Dil Desteği Genişletildi**
- History, Collections, Cloud, Walkthrough, Custom Color için 30+ yeni key
- Tüm 6 dile (TR/EN/RU/FR/ES/DE) eklendi

### 🐛 Bug Fixes
- **Converter Bar**: `converterEnabled=false` iken toolbar açılmıyordu — `forceEnabled` payload + storage sync ile düzeltildi
- **History Kayıt**: Capture listener kaldırıldı, kayıt `requestDownload()` içinde `res.ok` sonrasına taşındı
- **Collections Index Drift**: Silme/detay işlemleri index yerine koleksiyon adına göre yapılıyor
- **Collections Null Guard**: `collectionDetail` null kontrolü eklendi
- **addToCollection URL**: `img.src || img` yerine `typeof url === 'string'` kontrolü

### 📦 Yeni Storage Key'leri
- `ibd_downloadHistory_v1` — İndirme geçmişi (max 200)
- `ibd_collections_v1` — Koleksiyonlar listesi
- `ibd_customPrimaryColor_v1` — Özel ana renk (hex)
- `ibd_customThemeVars_v1` — Custom tema renk değerleri (accent, bgPopup, bgCard, textMain, textSub, border)
- `ibd_walkthroughSeen_v1` — Walkthrough gösterildi mi

---

## [1.8.2] - 2026-01-31

### 🐛 Bug Fixes
- **JSZip Loading**: Fixed JSZip import path mismatch (jszip.min.js → jszip.js) that prevented ZIP downloads
- **Canvas Fallback**: Added OffscreenCanvas availability check with proper error handling for better compatibility
- **Download Stability**: Improved error handling in download flow to prevent silent failures

### 🔧 Technical
- Enhanced error messages for canvas operations
- Better fallback mechanisms for unsupported browser features
- Improved background script reliability

---

## [1.8.1] - 2026-01-25

### 🔧 Firefox Add-ons Compliance
- **JSZip Update**: Replaced minified `jszip.min.js` with unminified `jszip.js` for Mozilla Add-ons compliance
- **Code Transparency**: All code now fully readable for Mozilla reviewers
- **No Functionality Changes**: All features work exactly as in v1.8.0

---

## [1.8.0] - 2026-01-25

### ✨ New Features

**🔄 Photo Converter**
- **Upload & Convert**: Upload local images and convert between JPEG, PNG, and WEBP formats
- **Floating Toolbar**: Right-bottom positioned converter toolbar on any webpage
- **Quality Control**: Adjustable quality slider (60-100%) for lossy formats
- **Auto-Download**: Automatic download after conversion with proper filename generation
- **Settings Integration**: Full control from settings panel (enable/disable, toolbar visibility)
- **Theme Support**: Converter toolbar adapts to all 6 themes
- **Canvas API**: Client-side conversion using HTML5 Canvas API
- **Keyboard Shortcut**: Alt+C to toggle converter toolbar

**🌐 Multi-Language Support**
- **6 Languages**: English, Türkçe, Русский, Français, Español, Deutsch
- **Instant Switching**: Change language without reload
- **Full Translation**: All UI elements, settings, buttons, and labels
- **Persistent**: Language preference saved across sessions
- **Easy Expansion**: Modular structure for adding more languages

**⌨️ Improved Keyboard Shortcuts**
- **Better Key Assignments**: More intuitive and logical shortcuts
- **Alt+E**: Toggle Selection Mode (was Alt+S)
- **Alt+X**: Clear Selection (was Alt+C)
- **Alt+C**: Toggle Converter Toolbar (NEW)
- All shortcuts remain customizable with visual recorder

### 🔧 Improvements
- Enhanced keyboard shortcut layout for better usability
- Added language selector in settings panel
- Improved converter toolbar positioning and styling
- Better error handling for image conversion

### 📦 Technical
- New file: `languages.js` with 500+ lines of translations
- Storage key: `ibd_language_v1` for language preference
- Storage keys for converter: `ibd_converterEnabled_v1`, `ibd_converterToolbarVisible_v1`, etc.
- Message handlers for converter communication between components

---

## [1.7.1] - 2026-01-04

### 🔧 Platform & Compatibility
- **Firefox-Only Support**: Exclusively optimized for Mozilla Firefox (Extension ID: `image-grabber-pro@mesud.dev`)
- Removed Chrome API fallback for better performance and Firefox-specific features

### ✨ New Features

**🎨 Image Processing**
- **Aspect Ratio Control**: Presets (1:1, 4:3, 16:9) or custom dimensions with Fill/Fit crop modes
- **Format Conversion**: Convert to JPEG, PNG, or WebP with quality control (10-100%)
- **Smart Naming**: Use templates with `{site}`, `{title}`, `{index}` variables for organized downloads

**⌨️ Keyboard Shortcuts**
- Fully customizable shortcuts with visual recorder (Alt+S, Alt+A, Alt+C, Alt+D, Alt+Z, Alt+P, Alt+L)
- One-click reset to defaults

**🎯 Advanced Selection**
- **Area Selection**: Drag rectangle to select multiple images
- **Same Size Mode**: Select all images with identical dimensions
- **Large Filter**: Auto-filter high-res images (800×600+)
- **Smart Detection**: Enhanced srcset and picture element support

**📦 Download Options**
- **ZIP Bundling**: Download all as single archive
- **Batch Control**: Configure size (1-10) and delay (0-1000ms)
- **Subfolder Organization**: Auto-organize into named folders
- **Max Selection**: Set limit (10-200 images)

**🎨 UI/UX**
- **Settings Panel**: Organized configuration view
- **6 Themes**: Light, Dark, Blue, Pink, Spotify Green, Onyx Gray
- **Popup Presets**: Small/Medium/Large/Custom sizes
- **Preview Gallery**: Visual thumbnails in popup
- **Floating Toolbar**: In-page quick access
- **Stay Open**: Keep popup after downloads

**⚡ Performance**
- **Low Performance Mode**: Optimized for slower systems, reduces quality for 20+ images
- **Lazy Processing**: On-demand image processing
- Better memory management and timeout controls

### 🐛 Bug Fixes
- Fixed srcset parsing, background-image detection, data-src handling, duplicate selections, and URL normalization

### 🔄 Technical
- Manifest V3 compliance, improved error handling, optimized storage, enhanced messaging, vanilla JavaScript

---

## [1.5.0] - Previous Release
- Basic image selection and download
- Simple quality settings
- Limited theme support
- Chrome and Firefox compatibility

---

## Migration Notes
**Breaking**: Firefox-only, new extension ID. Settings and preferences automatically migrated.
