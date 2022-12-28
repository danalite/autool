import { app, ipcMain } from "electron";
import { appConfig } from "@/utils/main/config";

const path = require("path");
const fs = require('fs');

export const ipcListener = (mainWindow, assistWindow) => {
  ipcMain.on('move-main', (event, pos) => {
    mainWindow.setBounds({ x: pos.x, y: pos.y, width: 450, height: 650 })
  })

  ipcMain.on('main-win-minimize', () => {
    mainWindow.hide()
  })

  ipcMain.on('main-win-min', () => {
    mainWindow.minimize()
  })

  // Close window and terminate py server
  ipcMain.on('main-win-close', () => {
    const assistWindowBounds = assistWindow.getBounds()
    appConfig.set('assistWindowPosition', { x: assistWindowBounds.x, y: assistWindowBounds.y })
    appConfig.set('credentials.port', '')
    app.quit()
  })

  // 移动助手窗口
  ipcMain.on('move-assistWindow', (event, pos) => {
    assistWindow.setBounds({ x: pos.x, y: pos.y, width: 320, height: 720 })
  })

  // 刷新助手页面
  ipcMain.on('setting-page-refresh-assist', () => {
    assistWindow.webContents.send('client-connect-success')
  })

  ipcMain.on('delete-task', (event, task) => {
    let taskPath = task.appPath + task.name + ".yaml"
    fs.unlink(taskPath, function (err) {
      if (err) return console.log(err);

      // Update the tasks JSON
      let appJsonPath = path.join(task.appPath, "tasks.json")
      let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
      let newTasks = appJson.tasks.filter(t => t !== task.name + ".yaml")
      appJson.tasks = newTasks
      fs.writeFile(appJsonPath, JSON.stringify(appJson), err => {
        if (err) {
          console.error(err);
        }
      });
    });
  })

  ipcMain.on('save-task', (event, taskStr) => {
    let task = JSON.parse(taskStr)
    fs.writeFile(task.taskPath, task.content, err => {
      if (err) {
        console.error(err);
      }
    });
    let appJsonPath = path.join(task.appPath, "tasks.json")
    let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
    if (!appJson.tasks.includes(task.name + ".yaml")) {
      appJson.tasks.push(task.name + ".yaml")
    }
    fs.writeFile(appJsonPath, JSON.stringify(appJson), err => {
      if (err) {
        console.error(err);
      }
    });
  })

  ipcMain.on('run-task', (event, task) => {
    let tempTaskPath = appConfig.get('appTemp')
    fs.writeFile(tempTaskPath, task.content, err => {
      if (err) {
        console.error(err);
      }
      let newTasks = [{
        name: task.name,
        absTaskPath: tempTaskPath,
        appPath: task.appPath,
        inputs: [],
        options: []
      }]
      mainWindow.webContents.send('run-task-from-main', 
        {is_autostart: false, tasks: newTasks})
    });
  })
}
