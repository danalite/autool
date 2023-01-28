import { BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { appConfig } from '@/utils/main/config'

export const createMainWindow = async (userHeader) => {
  let dim = appConfig.get('mainWindowDimension')
  const win = new BrowserWindow({
    title: 'AuTool',
    center: true,
    transparent: true,
    show: true,
    hasShadow: true,
    frame: false,
    resizable: false,
    width: dim.width,
    height: dim.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      // devTools:true
    }
  })

  if (dim.isCollapsed) {
    win.setAlwaysOnTop(true, 'floating', 1)
  }

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


