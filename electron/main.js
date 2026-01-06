const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // ✅ LOAD REACT BUILD
  mainWindow.loadFile(
    path.join(__dirname, "../frontend/build/index.html")
  );

  // 🔍 OPEN DEVTOOLS (IMPORTANT FOR NOW)
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // 🔹 START BACKEND
  backendProcess = spawn(
    "node",
    ["server.js"], // make sure this file exists
    {
      cwd: path.join(__dirname, "../backend"),
      shell: true,
    }
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`Backend ERROR: ${data}`);
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
