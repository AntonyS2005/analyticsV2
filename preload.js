console.log("se inicio la api")
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld("api", {
  leerArchivo: (buffer, hoja) => ipcRenderer.invoke("leer-archivo", buffer, hoja),
});
