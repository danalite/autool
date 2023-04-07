import { BrowserWindow, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { appConfig } from "../utils/main/config";

export const createAssistWindow = async (userHeader) => {
  const currentScreen = screen.getPrimaryDisplay()['size']
  appConfig.set('assistWinSize', currentScreen)
  const assistWin = new BrowserWindow({
    title: 'Canvas',
    frame: false,
    transparent: true,
    // closable: false,
    fullscreenable: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    width: currentScreen.width,
    height: currentScreen.height,
    x: 0,
    y: 0,
    alwaysOnTop: true,
    webPreferences: {
      webviewTag: true,
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

  assistWin.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] },
    (d, c) => {
      if (d.responseHeaders['X-Frame-Options']) {
        delete d.responseHeaders['X-Frame-Options'];
      } else if (d.responseHeaders['x-frame-options']) {
        delete d.responseHeaders['x-frame-options'];
      }

      c({ cancel: false, responseHeaders: d.responseHeaders });
    }
  );

  assistWin.setIgnoreMouseEvents(true);
  assistWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // assistWin.setAlwaysOnTop(true, 'floating', 1)
  // assistWin.setFocusable(true);

  if (process.env.npm_lifecycle_event === "electron:serve") {
    assistWin.webContents.openDevTools()
    await assistWin.loadURL('http://localhost:8080/#/assist', { userAgent: userHeader })

  } else {
    createProtocol('app')
    await assistWin.loadURL('app://./index.html/#/assist', { userAgent: userHeader })
  }
  return assistWin
}
