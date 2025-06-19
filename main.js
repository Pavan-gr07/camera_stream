import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Needed for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get IP from CLI argument
const ipArg = process.argv.find(arg => arg.startsWith('--ip='));
const ip = ipArg ? ipArg.split('=')[1] : 'localhost'; // fallback

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'), // ✅ needed for IPC bridge
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'dist-electron/index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-ip', ip); // ✅ send to renderer
    });
};

app.whenReady().then(createWindow);
