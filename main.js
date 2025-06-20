import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const isDev = !app.isPackaged;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (isDev) {
        // 🟢 Dev: Load Vite server
        mainWindow.loadURL('http://localhost:5173');
    } else {
        // 🔵 Production: Load built index.html from dist folder
        const indexPath = path.join(__dirname, 'dist-react/index.html');

        if (fs.existsSync(indexPath)) {
            mainWindow.loadFile(indexPath);
        } else {
            console.error('index.html not found in dist folder.');
        }
    }
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
