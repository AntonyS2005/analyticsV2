const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')  // Usamos un archivo preload.js
        }
    });

    win.loadFile("index.html");
    win.webContents.openDevTools();

    // Ocultar la barra de menú
    Menu.setApplicationMenu(null);
}

// Manejar la solicitud de obtener la ruta del archivo
ipcMain.handle('obtenerRutaArchivo', async (event, file) => {
    return file.path;  // Devolvemos la ruta del archivo seleccionado
});

app.whenReady().then(createWindow);