const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

let win;
const isDev = process.argv.includes('--dev');

// ── CREATE WINDOW ─────────────────────────────────────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 540,
    title: 'XSD Viewer',
    backgroundColor: '#0F172A',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
  });

  win.on('closed', () => { win = null; });
}

// ── MENU ──────────────────────────────────────────────────────────────────────
function buildMenu() {
  const mac = process.platform === 'darwin';
  const send = (ch) => () => win?.webContents.send(ch);

  const tpl = [
    ...(mac ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'hide'  }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' },
    ]}] : []),

    { label: 'File', submenu: [
      { label: 'Open XSD…', accelerator: 'CmdOrCtrl+O', click: openDialog },
      { type: 'separator' },
      { label: 'Load Sample Schema', accelerator: 'CmdOrCtrl+Shift+S', click: send('menu:sample') },
      { type: 'separator' },
      mac ? { role: 'close' } : { role: 'quit' },
    ]},

    { label: 'View', submenu: [
      { label: 'Toggle Attributes',  accelerator: 'CmdOrCtrl+Shift+A', click: send('menu:toggle-attrs') },
      { label: 'Expand All',         accelerator: 'CmdOrCtrl+Shift+E', click: send('menu:expand-all')   },
      { label: 'Collapse All',       accelerator: 'CmdOrCtrl+Shift+C', click: send('menu:collapse-all') },
      { type: 'separator' },
      { label: 'Fit Diagram',        accelerator: 'CmdOrCtrl+Shift+F', click: send('menu:fit')          },
      { label: 'Zoom In',            accelerator: 'CmdOrCtrl+=',       click: send('menu:zoom-in')      },
      { label: 'Zoom Out',           accelerator: 'CmdOrCtrl+-',       click: send('menu:zoom-out')     },
      { label: 'Reset Zoom',         accelerator: 'CmdOrCtrl+0',       click: send('menu:zoom-reset')   },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools' }] : []),
    ]},

    { label: 'Help', submenu: [
      { label: 'About', click: () => dialog.showMessageBox(win, {
        type: 'info', title: 'XSD Viewer',
        message: 'XSD Viewer v1.0.0',
        detail: 'XML Schema diagram visualizer.\nBuilt with Electron.',
        buttons: ['OK'],
      })},
    ]},
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

// ── FILE OPEN ─────────────────────────────────────────────────────────────────
async function openDialog() {
  if (!win) return;
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Open XSD Schema',
    filters: [{ name: 'XML Schema', extensions: ['xsd', 'xml'] }, { name: 'All Files', extensions: ['*'] }],
    properties: ['openFile'],
  });
  if (!canceled && filePaths[0]) loadFile(filePaths[0]);
}

function loadFile(filePath) {
  try {
    const content  = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    win?.webContents.send('file:open', { content, fileName, filePath });
    win?.setTitle('XSD Viewer — ' + fileName);
    app.addRecentDocument(filePath);
  } catch (e) {
    dialog.showErrorBox('Cannot open file', e.message);
  }
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.handle('open-file-dialog', openDialog);
ipcMain.handle('set-title', (_, t) => win?.setTitle(t));

// ── APP LIFECYCLE ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  buildMenu();

  // macOS dock click
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });

  // macOS: file opened from Finder
  app.on('open-file', (e, p) => { e.preventDefault(); win ? loadFile(p) : app.once('ready', () => loadFile(p)); });

  // Windows / Linux: file passed as CLI arg
  const cli = process.argv.slice(isDev ? 2 : 1).find(a => /\.(xsd|xml)$/i.test(a));
  if (cli && fs.existsSync(cli)) setTimeout(() => loadFile(cli), 700);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
