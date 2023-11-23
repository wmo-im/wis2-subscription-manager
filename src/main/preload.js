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

// Expose to renderer to the methods defined in the main process
contextBridge.exposeInMainWorld('electronAPI', {
  loadConfigNames: () => ipcRenderer.invoke('load-config-names'),
  loadConfig: (config) => ipcRenderer.invoke('load-config', config),
  openDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  saveConfig: (name, data) => ipcRenderer.send('save-config', name, data),
  handleSubscription: (data) => ipcRenderer.send('handle-subscription', data),
  onSubscriptionResponse: (callback) => ipcRenderer.on('subscription-response', callback),
  onBackendStdout: (callback) => ipcRenderer.on('backend-stdout', callback),
  onBackendStderr: (callback) => ipcRenderer.on('backend-stderr', callback),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});