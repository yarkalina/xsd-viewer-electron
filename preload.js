/**
 * preload.js
 * Runs with Node access, exposes a safe API to the renderer via contextBridge.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Trigger native open-file dialog from renderer
  openFile: () => ipcRenderer.invoke('open-file-dialog'),

  // Update window title
  setTitle: (t) => ipcRenderer.invoke('set-title', t),

  // Listen for file opened from menu / OS / CLI
  onFileOpen: (cb) => ipcRenderer.on('file:open', (_, data) => cb(data)),

  // Listen for menu commands
  onMenu: (cb) => {
    const events = [
      'menu:sample', 'menu:toggle-attrs',
      'menu:expand-all', 'menu:collapse-all',
      'menu:fit', 'menu:zoom-in', 'menu:zoom-out', 'menu:zoom-reset',
    ];
    events.forEach(ch => ipcRenderer.on(ch, () => cb(ch)));
  },
});
