const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;

// Register the app protocol as privileged
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// Create a custom protocol to handle Next.js routing
function registerAppProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    let url = request.url.replace('app://', '');
    
    // Remove query params or hashes
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // 0. Asset Redirect Logic:
    // If a request is for an asset (like _next, images, static) but includes subfolders,
    // we jump straight to the root of the out directory.
    // e.g. app://hadith/bukhari/_next/static/css/main.css -> app://_next/static/css/main.css
    if (cleanUrl.includes('/_next/') || cleanUrl.includes('/static/') || cleanUrl.includes('/public/')) {
        const assetPath = cleanUrl.substring(cleanUrl.lastIndexOf('/_next/') !== -1 ? cleanUrl.lastIndexOf('/_next/') + 1 : 
                           cleanUrl.lastIndexOf('/static/') !== -1 ? cleanUrl.lastIndexOf('/static/') + 1 : 
                           cleanUrl.lastIndexOf('/public/') + 1);
        const assetFile = path.join(__dirname, '../out', assetPath);
        if (fs.existsSync(assetFile) && fs.statSync(assetFile).isFile()) {
            return callback({ path: assetFile });
        }
    }

    let filePath = path.join(__dirname, '../out', cleanUrl);

    // 1. Direct file check (e.g. images, scripts)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return callback({ path: filePath });
    }

    // 2. Directory index.html check (standard static routes)
    const indexHtml = path.join(filePath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return callback({ path: indexHtml });
    }

    // 3. SPA/Dynamic Route Fallback: 
    // If a path like /lectures/my-slug isn't found, try to serve /lectures/index.html
    let currentDir = cleanUrl;
    while (currentDir && currentDir !== '.' && currentDir !== '/') {
      currentDir = path.dirname(currentDir);
      const fallbackPath = path.join(__dirname, '../out', currentDir, 'index.html');
      
      if (fs.existsSync(fallbackPath)) {
        return callback({ path: fallbackPath });
      }
    }

    // 4. Final fallback to root index.html
    callback({ path: path.join(__dirname, '../out/index.html') });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: "Waqfah - وقفة",
    autoHideMenuBar: true,
    backgroundColor: '#000000'
  });

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools(); // Enabled for debugging
  } else {
    // In production, use our custom app:// protocol
    win.loadURL('app://./index.html');
    win.webContents.openDevTools(); // Enabled to debug EXE black screen
  }
}

// Important for Next.js: allow the app:// protocol
app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
