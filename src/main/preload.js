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
  getOS: () => ipcRenderer.invoke('get-os'),
  storeSettings: (settings) => ipcRenderer.send('store-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
});