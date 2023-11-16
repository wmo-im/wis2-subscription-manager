const { app, BrowserWindow, Menu, Tray, ipcMain, dialog } = require("electron");
const { PythonShell } = require('python-shell');
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Start the backend Flask app
// let flaskProcess = null;

// const startFlaskApp = () => {
//   const options = {
     
//   }
// }

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    icon: "public/assets/logo-small.png",
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#14418F',
      symbolColor: '#FFFFFF',
      height: 60
    },
    webPreferences: {
      nodeIntegration: false, // Best practice for security reasons
      contextIsolation: true, // Isolates renderer process context from preload script
      preload: path.join(__dirname, "preload.js")
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Hide scroll bar
  mainWindow.webContents.insertCSS("body::-webkit-scrollbar { display: none !important; }");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Always minimise to tray
  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
      if(!app.isQuiting){
          event.preventDefault();
          mainWindow.hide();
      }

      return false;
  });

  // Set app icon in the tray
  var appIcon = null;
  appIcon = new Tray("public/assets/logo-small.png")

  // Restore application from the tray
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
        mainWindow.show();
    } },
    { label: 'Quit', click:  function(){
        app.isQuiting = true;
        app.quit();
    } }
  ]);

  appIcon.setContextMenu(contextMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC listener
ipcMain.handle("open-directory-dialog", async (event) => {
  // Opens the dialog to select a directory
  const result = await dialog.showOpenDialog({ properties: ['openDirectory']});
  if (result.canceled) {
    // If user closes dialog, don't return a directory
    return null;
  }
  else {
    // Otherwise, return a directory
    return result.filePaths[0];
  }

});
