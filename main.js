// main.js

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require("exceljs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile("frontend/analisisEstadistico.html");
  Menu.setApplicationMenu(null);
  win.webContents.openDevTools();

}

ipcMain.handle("leer-archivo", async (event, ruta) => {
  console.log("API llamada para leer archivo con ruta:", ruta);  // Log de la llamada de la API
  try {
    const datos = await leerDatos(ruta);  // Utiliza tu función `leerDatos` para procesar el archivo
    console.log("Datos leídos del archivo:", datos);  // Log de los datos leídos
    return datos;
  } catch (error) {
    console.error("Error al leer el archivo:", error);  // Si ocurre un error
    return null;
  }
});
console.log("se ejecuto el main");
app.whenReady().then(createWindow);
