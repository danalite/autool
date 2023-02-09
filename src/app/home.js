import { BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { appConfig } from '@/utils/main/config'

export const createMainWindow = async (userHeader) => {
  let dim = appConfig.get('mainWindowDimension')
  let pos = appConfig.get('mainWindowPosition')

  const win = new BrowserWindow({
    title: 'AuTool',
    transparent: false,
    show: true,
    hasShadow: true,

    frame: true,
    resizable: true,
    closable: true,
    minWidth: 590,
    minHeight: 40,

    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#74b1be',
      height: 30
    },

    x: pos.x,
    y: pos.y,
    width: dim.width,
    height: dim.isCollapsed ? 40 : dim.height,
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
    win.setWindowButtonVisibility(false)
    win.setResizable(false)
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


