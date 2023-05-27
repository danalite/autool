import { BrowserWindow, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { appConfig } from '@/utils/main/config'

export const createMainWindow = async (userHeader, iconPath) => {
  let dim = appConfig.get('mainWindowDimension')
  let pos = appConfig.get('mainWindowPosition')
  const currentScreen = screen.getPrimaryDisplay()['size']

  const win = new BrowserWindow({
    title: 'AuTool',
    transparent: false,
    show: false,
    hasShadow: true,

    frame: true,
    resizable: true,
    closable: true,
    minWidth: 600,
    minHeight: 40,

    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#74b1be',
      height: 30
    },

    x: pos.x || (currentScreen.width - dim.width) / 2,
    y: pos.y || (currentScreen.height - dim.height) / 2,
    width: dim.isCollapsed ? 600 : dim.width,
    height: dim.isCollapsed ? 40 : dim.height,
    icon: iconPath,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      // devTools:true
    }
  })

  if (dim.isCollapsed) {
    // win.setAlwaysOnTop(true, 'floating', 1)
    win.setWindowButtonVisibility(false)
    win.setResizable(false)
  }

  win.on('ready-to-show', () => {
    if (!appConfig.get('mainWindowDimension.isCollapsed')) {
      win.show()
    }
  })

  // Load the index.html when not in development
  if (process.env.npm_lifecycle_event === "electron:serve") {
    await win.loadURL('http://localhost:8080/', { userAgent: userHeader })
    win.webContents.openDevTools()
  } else {
    createProtocol('app')
    await win.loadURL('app://./index.html', { userAgent: userHeader })
  }
  return win
}


