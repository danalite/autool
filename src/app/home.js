import { BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

export const createMainWindow = async (userHeader) => {
  const win = new BrowserWindow({
    title: 'AuTool',
    center: true,
    transparent: true,
    show: true,
    frame: false,
    resizable: false,
    width: 390,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      // devTools:true
    }
  })

  // Enable dev tools in chrome
  win.webContents.openDevTools()

  win.on('ready-to-show', () => {
    win.show()
  })

  // Load the index.html when not in development
  if (process.env.npm_lifecycle_event === "electron:serve") {
    await win.loadURL('http://localhost:8080/', { userAgent: userHeader })
  } else {
    createProtocol('app')
    await win.loadURL('app://./index.html', { userAgent: userHeader })
  }
  return win
}


