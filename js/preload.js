const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    obtenerRutaArchivo: (archivo) => ipcRenderer.invoke('obtenerRutaArchivo', archivo)
});