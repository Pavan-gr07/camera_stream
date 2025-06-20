import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Listen for IP updates from main process
    onSetIp: (callback) => ipcRenderer.on('set-ip', (event, ip) => callback(ip)),

    // Remove listener to prevent memory leaks
    removeSetIpListener: () => ipcRenderer.removeAllListeners('set-ip'),

    // Get environment variables (alternative method)
    getEnvVar: (varName) => ipcRenderer.invoke('get-env-var', varName)
});