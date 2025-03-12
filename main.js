const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("fs");
const path = require("path");
const { leerDatos } = require("./baquend/leerArchivo"); // Asegúrate de que la ruta es correcta

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    win.loadFile("frontend/analisisEstadistico.html");
    Menu.setApplicationMenu(null);
    win.webContents.openDevTools();
}

ipcMain.handle("leer-archivo", async (event, fileBuffer, hoja) => {
  try {
      console.log("Archivo recibido en buffer, procesándolo...");
      const datos = await leerDatos(fileBuffer, hoja);
      console.log("Datos leídos del archivo:", datos);
      return datos;
  } catch (error) {
      console.error("Error al leer el archivo:", error);
      return null;
  }
});


console.log("se ejecuto el main");
app.whenReady().then(createWindow);