import { catchClause } from "@babel/types";
import { BrowserWindow, ipcMain } from "electron";
import { truncate } from "fs/promises";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

const createQueryMatchWindow = async (userHeader) => {
  const queryMatchWindow = new BrowserWindow({
    title: 'FrankQueryMatch',
    show: false,
    frame: false,
    resizable: true,
    width: 1166,
    height: 650,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      devTools:truncate
    }
  })

  queryMatchWindow.on('ready-to-show', () => {
    queryMatchWindow.show()
  })

  // Load URL from different router-view (dev | production)
  if (process.env.npm_lifecycle_event === "electron:serve") {
    await queryMatchWindow.loadURL('http://localhost:8080/#/queryMatch', { userAgent: userHeader })
  } else {
    createProtocol('app')
    await queryMatchWindow.loadURL('app://./index.html/#/queryMatch', { userAgent: userHeader })
  }
  return queryMatchWindow
}

export const queryMatchIpc = async (mainWindow, userHeader) => {
  let queryMatchWindow

  // Show the sub-window
  ipcMain.on('show-query-match', async () => {
    if (queryMatchWindow == undefined) {
      queryMatchWindow = await createQueryMatchWindow(userHeader)
    } else {
      try {
        queryMatchWindow.show()
      } catch(e) {
        queryMatchWindow = await createQueryMatchWindow(userHeader)
      }
    }
  })

  // Move sub-window
  ipcMain.on('move-query-match-window', (event, pos) => {
    queryMatchWindow.setBounds({ x: pos.x, y: pos.y, width: 1166, height: 650 })
  })

  // Minimize sub-window
  ipcMain.on('query-match-min', () => {
    queryMatchWindow.minimize()
  })

  // 关闭游戏历史窗口
  ipcMain.on('query-match-close', () => {
    closeWin(false)
  })

  // 关闭查询游戏窗口, 回到主页
  ipcMain.on('query-match-back-home', () => {
    closeWin(true)
  })
}

const closeWin = (showMain) => {
  let queryMatchWin
  let mainWin
  for (const currentWindow of BrowserWindow.getAllWindows()) {
    if (currentWindow.title === 'QueryMatch') {
      queryMatchWin = currentWindow
    } else if (currentWindow.title === 'Frank') {
      mainWin = currentWindow
    }
  }
  if (showMain) {
    queryMatchWin.close()
    mainWin.show()
  } else {
    queryMatchWin.close()
  }
}
