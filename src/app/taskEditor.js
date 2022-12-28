import { BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

export const createTaskEditorWindow = async (userHeader) => {
  const taskEditorWindow = new BrowserWindow({
    title: 'TaskEditor',
    show: false,
    frame: false,
    resizable: false,
    width: 1024,
    height: 576,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      devTools: true
    }
  })
  
  // taskEditorWindow.on('ready-to-show', () => {
  //   taskEditorWindow.show()
  // })

  if (process.env.npm_lifecycle_event === "electron:serve") {
    await taskEditorWindow.loadURL('http://localhost:8080/#/taskEditor', { userAgent: userHeader })

  } else {
    createProtocol('app')
    await taskEditorWindow.loadURL('app://./index.html/#/taskEditor', { userAgent: userHeader })
  }
  return taskEditorWindow
}

