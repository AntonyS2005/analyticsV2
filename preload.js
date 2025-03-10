console.log("se inicio la api")
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  leerArchivo: (ruta) => ipcRenderer.invoke('leer-archivo', ruta),
});