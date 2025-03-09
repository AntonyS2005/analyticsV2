const { app, BrowserWindow, Menu } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Permite usar Node.js en el frontend
            contextIsolation: false
        }
    });

    win.loadFile("index.html"); // Cargar tu página principal

    // 🔥 Ocultar la barra de menú
    Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
