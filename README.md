# Photo-Grab 📸

[![Latest Release](https://img.shields.io/github/v/release/Mst888/Photo-Grab?style=flat-square)](https://github.com/Mst888/Photo-Grab/releases) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/Mst888/Photo-Grab/blob/main/LICENSE) [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-ff813f?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/mst888)

A fast, elegant **Firefox-only** browser extension for power users who want to pick, organize, and download images from the web in bulk — without the fuss.

---

## ✨ Why Photo-Grab?

Photo-Grab was built for people who collect images — researchers, designers, archivists, and curious web explorers. It gives you fine-grained control over selection and download, plus quality-of-life features to keep your workflow smooth.

- Lightning-fast area selection
- Smart filters for resolution and format
- One-click "same size" grouping
- ZIP bundling and smart filenames
- Compact, modern popup UI with floating toolbar

---

## 🌟 Key Features

### 🎯 Precision Selection
- Area Selection: Drag a rectangle over the page to select multiple images.
- Smart Filters: Quickly filter for high-res images (800×600+) or specific file formats.
- Same Size Mode: Select an image and highlight all images on the page with the same dimensions.
- Visual Feedback: Blue outlines and index badges show selection status in real time.

### 📦 Power Downloads (v1.6+)
- ZIP Bundling: Download all selected images as a single .zip archive.
- Smart Naming Templates: Use `{site}`, `{title}`, `{index}`, etc., to generate useful filenames automatically.
- Subfolder Support: Create subfolders from the popup to organize downloads.

### 🎨 Premium UI/UX
- Compact Popup: Designed for a small footprint (300×500) so it doesn't interrupt your browsing.
- Modern Themes: Onyx Gray, Spotify Green, Classic Blue, and more.
- Floating Toolbar: Quick in-page controls without opening the popup.

---

## 🚀 Quick Start

**Note: This extension is designed exclusively for Mozilla Firefox.**

1. Install the extension in Firefox from developer mode (load unpacked) or from the releases page:
   - [Releases](https://github.com/Mst888/Photo-Grab/releases)
2. Open a webpage with images.
3. Click the toolbar icon, choose your selection mode (area / same-size / filters), then download as ZIP or individually.

---

## 🛠️ Build Instructions

This repository contains the source code for Photo-Grab. To build from source:

### 1. Environment Requirements
- Node.js: v18.x or higher
- npm: v9.x or higher

### 2. Installation
```bash
npm install
```

### 3. Packaging
To generate a distributable `.zip`:
```bash
npm run build
```
The resulting package will be in the `web-ext-artifacts/` directory.

---

## 📄 Source Code Policy
- Vanilla JS: No transpilation, minification, or obfuscation.
- Human Readable: Code is provided in original form for transparency.

---

## ☕ Support the Project
If you find Photo-Grab useful, consider buying me a coffee to help fund improvements and maintenance:

[Buy Me a Coffee](https://buymeacoffee.com/mst888) • [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-ff813f?style=flat-square&logo=buymeacoffee)](https://buymeacoffee.com/mst888)

---

**Author:** Mst888  
**Version:** 1.8.4