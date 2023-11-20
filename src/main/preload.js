// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

// Setup context bridge for secure and isolated IPC communication
const { contextBridge, ipcRenderer } = require('electron');

// Expose to renderer the open-directory-dialog and handle-subscription 
// methods, as well as response methods for sending subscription 
// messages back up to the Vue frontend
contextBridge.exposeInMainWorld('electronAPI', {
  openDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  handleSubscription: (data) => ipcRenderer.send('handle-subscription', data),
  onSubscriptionResponse: (callback) => ipcRenderer.on('subscription-response', callback),
  onBackendStdout: (callback) => ipcRenderer.on('backend-stdout', callback),
  onBackendStderr: (callback) => ipcRenderer.on('backend-stderr', callback),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});