import { BrowserWindow, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

export const createAssistWindow = async (userHeader) => {
  const currentScreen = screen.getPrimaryDisplay()['size']
  const assistWindowPosition = { x: 0, y: 15 }

  const assistWin = new BrowserWindow({
    title: 'toolAssist',
    frame: false,
    transparent:true,
    resizable: false,
    width: 380,
    height: currentScreen.height - 20,
    x: assistWindowPosition.x,
    y: assistWindowPosition.y,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      // devTools:false
    }
  })

  assistWin.on('ready-to-show', () => {
    assistWin.show()
  })

  assistWin.setIgnoreMouseEvents(false);
  assistWin.setFocusable(true);
  assistWin.webContents.openDevTools()

  if (process.env.npm_lifecycle_event === "electron:serve") {
    await assistWin.loadURL('http://localhost:8080/#/assist', { userAgent: userHeader })

  } else {
    createProtocol('app')
    await assistWin.loadURL('app://./index.html/#/assist', { userAgent: userHeader })
  }
  return assistWin
}
