# Changelog

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
