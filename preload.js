import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    onSetIp: (callback) => ipcRenderer.on('set-ip', (event, ip) => callback(ip))
});
