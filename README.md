# XSD Viewer — Electron Desktop App

XML Schema diagram visualizer. Displays XSD structure as an interactive graphical diagram (XMLSpy-style).

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm start
```

## Build installers

```bash
npm run build:win      # → dist/XSD Viewer Setup.exe   (Windows x64)
npm run build:mac      # → dist/XSD Viewer.dmg          (macOS x64 + arm64)
npm run build:linux    # → dist/XSD Viewer.AppImage      (Linux)
npm run build:all      # → all three platforms at once
```

> **Note:** Building for macOS requires running on macOS (code signing).  
> Cross-compiling Windows → Linux works fine on CI.

## Project structure

```
xsd-viewer-electron/
├── main.js          ← Electron main process (window, menu, file I/O)
├── preload.js       ← Secure IPC bridge (contextBridge)
├── package.json
├── src/
│   └── index.html   ← Full app UI + XSD parser + SVG renderer
└── assets/
    ├── icon.png     ← App icon (512×512 PNG)
    ├── icon.ico     ← Windows icon
    └── icon.icns    ← macOS icon
```

## Features

- **Graphical diagram** — XMLSpy-style element boxes, compositor connectors (S/C/A), attribute rows
- **Sidebar navigation** — root elements, complex types, simple types
- **Native file open** — File menu → Open XSD… (Ctrl+O), or drag & drop onto the window
- **Open from OS** — double-click any `.xsd` file to open it directly
- **Pan & zoom** — mouse wheel zoom, drag to pan, Fit button
- **Keyboard shortcuts** — Ctrl+O open, Ctrl+Shift+E expand all, Ctrl+Shift+F fit, Ctrl+= zoom in…

## Icons

Place your icon files in `assets/`:
- `icon.png` — 512×512 PNG (Linux + fallback)
- `icon.ico` — Windows multi-resolution ICO
- `icon.icns` — macOS ICNS

You can generate all formats from a single PNG using [electron-icon-maker](https://www.npmjs.com/package/electron-icon-maker):
```bash
npx electron-icon-maker --input=assets/icon.png --output=assets
```
