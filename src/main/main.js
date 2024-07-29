const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  nativeImage,
  ipcMain
} = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: 'public/assets/logo-circle',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#14418F',
      symbolColor: '#FFFFFF',
      height: 64
    },
    webPreferences: {
      nodeIntegration: false, // Best practice for security reasons
      contextIsolation: true, // Isolates renderer process context from preload script
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  /* eslint-disable */
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  /* eslint-disable */

  // Hide scroll bar
  mainWindow.webContents.insertCSS(
    'body::-webkit-scrollbar { display: none !important; }'
  );

  // Always minimise to tray
  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  // Build the tray depending on the OS
  let tray;
  let iconPath;

  switch (process.platform) {
    case 'win32':
      iconPath = path.join(
        __dirname,
        '..',
        '..',
        'public/assets/tray-icon-win32.ico'
      );
      break;
    case 'linux':
      iconPath = path.join(
        __dirname,
        '..',
        '..',
        'public/assets/tray-icon-linux.png'
      );
      break;
    case 'darwin':
      iconPath = path.join(
        __dirname,
        '..',
        '..',
        'public/assets/tray-icon-darwinTemplate.png'
      );
      break;
    default:
      iconPath = path.join(
        __dirname,
        '..',
        '..',
        'public/assets/tray-icon-win32.ico'
      );
  }
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  // Restore application from the tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Subscription Manager',
      click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true;
        // Now quit the app
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Inter-process communication setup (IPC)

// Handler to return the OS platform, to enable OS specific functionality
// We name this 'get-os' to be referenced elsewhere
ipcMain.handle('get-os', async event => {
  return process.platform;
});

// Handler for storing the shared settings between pages
// We name this 'store-settings' to be referenced elsewhere
let settings = {};
ipcMain.on('store-settings', (event, newSettings) => {
  try {
    settings = newSettings;
  } catch (error) {
    console.error('Error in store-settings:', error.message);
  }
});

// Hander for loading the shared settings between pages
// We name this 'load-settings' to be referenced elsewhere
ipcMain.handle('load-settings', async event => {
  try {
    return settings;
  } catch (error) {
    console.error('Error in load-settings:', error.message);
  }
});
