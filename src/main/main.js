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

// Handler for storing the selected topics in the GDC page
// We name this 'store-topics' to be referenced elsewhere
let storedTopics = [];
ipcMain.on("store-topics", (event, topics) => {
  try {
    // Add topics to variable
    topics.forEach(topic => {
      storedTopics.push(topic);
  });
  }
  catch (error) {
    console.error("Error in store-topics:", error.message);
  }
});

// Handler for loading the stored topics into the configuration page
// We name this 'load-topics' to be referenced elsewhere
ipcMain.handle("load-topics", async (event) => {
  try {
    // Return the stored topics
    return storedTopics;
  }
  catch (error) {
    console.error("Error in load-topics:", error.message);
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

// Handler for deleting the configuration from the 'configs' directory
// We name this 'delete-config' to be referenced elsewhere
ipcMain.on("delete-config", (event, config) => {
  try {
      const filePath = `backend/configs/${config}.json`;
      // Delete the configuration file
      fs.unlinkSync(filePath);
  }
  catch (error) {
    console.error("Error in delete-config:", error.message);
  }
});

// Handler for writing the broker data to the 'brokers.json' file
// We name this 'write-brokers' to be referenced elsewhere
ipcMain.on("write-brokers", (event, data) => {
  try {
    const filePath = 'backend/brokers.json';
    // Convert data to a JSON string
    console.log("Broker data received:", data)
    const dataString = JSON.stringify(data, null, 2);
    // Write the data to this file
    fs.writeFileSync(filePath, dataString, 'utf8');
  }
  catch (error) {
    console.error("Error in writing broker information to disk:", error);
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
  const configPath = 'backend/config.json';

  // Remove listeners and kill the backend process if it's already running
  if (backendProcess) {
    backendProcess.removeAllListeners();
    kill(backendProcess.pid);
    backendProcess = null;
  }

  if (data.shouldSubscribe) {
    try {
      // Replace the backslashes in the download directory with forward slashes
      data.downloadDirectory = data.downloadDirectory.replaceAll('\\', '/');

      // Remove the shouldSubscribe property from the data
      const configData = { 'broker': data.broker,
                          'topics': data.topics,
                          'download_directory': data.downloadDirectory };

      // Write configuration information to a file before starting backend
      fs.writeFileSync(configPath, JSON.stringify(configData), 'utf8');

      // Start backend executable
      backendProcess = spawn(backendPath, { windowsHide: true });
      
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

// Handler for managing topics on a concurrent subscription
// We name this 'manage-topics' to be referenced elsewhere
ipcMain.on("manage-topics", async (event, data) => {
  try {
    // Replace special characters (e.g. #, +) by UTF-8 encoding
    // except for the forward slash
    const encodedTopic = encodeURIComponent(data.topic).replaceAll('%2F', '/');
    if (data.action == 'add') {
      // Make a HTTP GET request to the Flask app to add the topic
      const response = await fetch(`http://127.0.0.1:5000/wis2/subscriptions/add?topic=${encodedTopic}`, { method: 'GET' });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Send a message to the frontend
      event.sender.send('subscription-response', { status: `Topic ${data.topic} added to subscription` });
    }
    else if (data.action == 'delete') {
      // Make a HTTP GET request to the Flask app to add the topic
      const response = await fetch(`http://127.0.0.1:5000/wis2/subscriptions/delete?topic=${encodedTopic}`, { method: 'GET' });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Send a message to the frontend
      event.sender.send('subscription-response', { status: `Topic ${data.topic} removed from subscription` });
    }

  }
  catch (error) {
    console.error("Error in manage-topics:", error);
    // Send a message to the frontend
    event.sender.send('subscription-response', { status: 'Error updating topics', errorMessage: error.message });
  }
});