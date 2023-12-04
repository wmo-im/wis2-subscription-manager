const { app, BrowserWindow, Menu, Tray, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require('fs');
const spawn = require('child_process').spawn;
var kill  = require('tree-kill');
let backendProcess = null;

// Handle creating/removing shortcuts on Winrsdows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: "public/assets/logo-small.png",
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#14418F',
      symbolColor: '#FFFFFF',
      height: 64
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
        // Now quit the app
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

// Inter-process communication setup (IPC)

// Handler for accessing the global discovery catalogue
// using the catalogue-backend executable, with arguments
// url, query (the search term), and bbox (the bounding box)
// We name this 'search-catalogue' to be referenced elsewhere
ipcMain.handle("search-catalogue", async (event, data) => {
  try {
    const backendPath = 'backend/catalogue-backend.exe';

    // Build arguments array
    const args = ['--url', data.url];
    if (data.query) {
      args.push('--query');
      args.push(data.query);
    }
    if (data.country) {
      args.push('--country');
      args.push(data.country);
    }

    // Start backend executable with arguments
    const backendProcess = spawn(backendPath, args,
    { windowsHide: true });
    // Log stdout data
    backendProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    // Log stderr data
    backendProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    // Log exit code
    backendProcess.on('close', (code) => {
      console.log(`Catalogue search process exited with code ${code}`);
    });
    // Return a message to the frontend
    return { status: 'Catalogue search started' };
  }
  catch (error) {
    console.error("Error in search-catalogue:", error);
    // Return a message to the frontend
    return { status: 'Error starting catalogue search', errorMessage: error.message };
  }
});

// Handler for loading the configuration names
// We name this 'load-config-names' to be referenced elsewhere
ipcMain.handle("load-config-names", async (event) => {
  try {
    // Read the configuration directory
    const files = fs.readdirSync('backend/configs');
    // Create an array of the file basename excluding the .json extension
    const configNames = files.map(file => path.basename(file, '.json'));
    // Return the configuration names
    return configNames;
  }
  catch (error) {
    console.error("Error in load-config-names:", error.message);
    // Return an error message
    return [];
  }
});

// Handler for loading the selected configuration data
// We name this 'load-config' to be referenced elsewhere
ipcMain.handle("load-config", async (event, config) => {
  try {
    const filePath = `backend/configs/${config}.json`;
    // Read the configuration file
    const configJSON = fs.readFileSync(filePath, 'utf8');
    // Parse the configuration file
    const configData = JSON.parse(configJSON);
    // Return the configuration file
    return configData;
  }
  catch (error) {
    console.error("Error in load-config:", error.message);
  }
});

// Hanlder for getting the latest broker URLs and synchronisation
// time when the user presses the 'Sync Brokers' button
// We name this 'sync-brokers' to be referenced elsewhere
ipcMain.on("sync-brokers", (event) => {
  try {
    const backendPath = 'backend/broker-backend.exe';
    // Start backend executable
    const backendProcess = spawn(backendPath, { windowsHide: true });
    // Log stdout data
    backendProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    // Log stderr data
    backendProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    // Log exit code
    backendProcess.on('close', (code) => {
      console.log(`Broker sync process exited with code ${code}`);
    });
  }
  catch (error) {
    console.error("Error in sync-brokers:", error);
  }
});

// Handler for reading the latest broker URLs and sychronisation
// time from the 'brokers.json' file and returning it to the frontend
// We name this 'read-brokers' to be referenced elsewhere
ipcMain.handle("load-brokers", async (event) => {
  try {
    const filePath = 'backend/brokers.json';
    // Read the brokers file
    const brokersJSON = fs.readFileSync(filePath, 'utf8');
    // Parse the brokers file
    const brokersData = JSON.parse(brokersJSON);
    // Return the brokers file
    return brokersData;
  }
  catch (error) {
    console.error("Error in load-brokers:", error.message);
  }
});

// Handler for the choose directory pop up
// We name this 'open-directory-dialog' to be referenced elsewhere
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

// Handler for the saving the configuration
// We name this 'save-config' to be referenced elsewhere
ipcMain.on("save-config", (event, name, data) => {
  try {
    const filePath = `backend/configs/${name}.json`;
    // Write the configuration file
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  }
  catch (error) {
    console.error("Error in save-config:", error.message);
  }
});

// Handler for the subscription process
// We name this 'handle-subscription' to be referenced elsewhere
ipcMain.on("handle-subscription", (event, data) => {
  const backendPath = 'backend/subscribe-backend.exe';
  const subscriptionsPath = 'backend/subscriptions.json';

  // Remove listeners and kill the backend process if it's already running
  if (backendProcess) {
    backendProcess.removeAllListeners();
    kill(backendProcess.pid);
    backendProcess = null;
  }

  if (data.shouldSubscribe) {
    try {
      let subscriptions = {};

      // Structure the subscription JSON file with format
      // "topic1": "download/directory" (in Linux format)
      data.topics.forEach(topic => {
        subscriptions[topic] = data.downloadDirectory.replaceAll('\\', '/');
      });

      // Write topics to subscriptions.json before starting backend
      fs.writeFileSync(subscriptionsPath, JSON.stringify(subscriptions), 'utf8');

      // Start backend executable with arguments
      if (data.downloadDirectory === "") {
        // If no download directory given, do not pass as argument
        backendProcess = spawn(backendPath, ['--broker', data.broker],
        { windowsHide: true });
      }
      else {
        // If download directory given, pass as argument
        backendProcess = spawn(backendPath, ['--broker', data.broker, '--download_dir', data.downloadDirectory],
        { windowsHide: true });
      }
      
      // Send stdout and stderr data to frontend
      backendProcess.stdout.on('data', (data) => {
        event.sender.send('backend-stdout', data.toString());
      });
  
      backendProcess.stderr.on('data', (data) => {
        event.sender.send('backend-stderr', data.toString());
      });
  
      // Handle process exit
      backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        event.sender.send('subscription-response', { status: `Subscription process ended with code ${code}` });
        backendProcess.removeAllListeners();
        backendProcess = null;
      });
  
      // Send a message to the frontend
      event.sender.send('subscription-response', { status: 'Subscription started' });
    }
    catch (error) {
      console.error("Error in handle-subscription:", error);
      // Send a message to the frontend
      event.sender.send('subscription-response', { status: 'Error starting subscription', errorMessage: error.message });
    }
  }
  else {
    // Send a message to the frontend
    event.sender.send('subscription-response', { status: 'Subscription cancelled' });
  }
});