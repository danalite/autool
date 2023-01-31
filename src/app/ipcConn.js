import { app, ipcMain } from "electron";
import { appConfig } from "@/utils/main/config";

import { deleteApp, deleteTask, loadApps, updateTaskYaml } from '@/utils/main/queryTasks';

var parser = require('cron-parser');

export const ipcListener = (mainWindow, assistWindow) => {
  ipcMain.on('move-main', (event, pos) => {
    let dim = appConfig.get('mainWindowDimension')
    mainWindow.setBounds({ x: pos.x, y: pos.y, width: dim.width, height: dim.height })
  })

  // Collapse main console to floating bar
  ipcMain.on('main-win-resize', (event, dim) => {

    // https://gist.github.com/my-lalex/f81352ad69fba206b84e59341fc469ed
    const startWidth = mainWindow.getBounds().width;
    const startHeight = mainWindow.getBounds().height;
    const targetWidth = dim.width;
    const targetHeight = dim.height;

    const easing = (t, b, c, d) => (t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b);
    const duration = 80;

    let currentFrame = 0;
    const updateSize = () => {
      currentFrame++;
      mainWindow.setSize(
        Math.round(easing(currentFrame, startWidth, targetWidth - startWidth, duration)),
        Math.round(easing(currentFrame, startHeight, targetHeight - startHeight, duration)),
      );
      if (currentFrame < duration) setImmediate(updateSize);
    };
    setImmediate(updateSize);
    if (targetHeight < 100) {
      mainWindow.setAlwaysOnTop(true, 'floating', 1)
    } else {
      mainWindow.setAlwaysOnTop(false)
    }
  })

  ipcMain.on('main-win-minimize', () => {
    mainWindow.hide()
  })

  ipcMain.on('main-win-min', () => {
    mainWindow.minimize()
  })

  // Close window and save collapsed status
  ipcMain.on('main-win-close', () => {
    const dim = mainWindow.getBounds()
    let isCollapsed = dim.height < 100
    appConfig.set('mainWindowDimension', {
      width: dim.width, height: dim.height, isCollapsed: isCollapsed
    })
    appConfig.set('mainWindowPosition', { x: dim.x, y: dim.y })
    app.quit()
  })

  // This handler updates our mouse event settings depending
  // on whether the user is hovering over a clickable element
  // in the call window.
  ipcMain.handle("assist-ignore-mouse-events", (e, ...args) => {
    assistWindow.setIgnoreMouseEvents(...args);
  });

  // Proxy message from main window to assist window
  // https://stackoverflow.com/a/40251412
  ipcMain.on('to-assist-window', (event, message) => {
    assistWindow.webContents.send('assist-win-push', message)
  })

  // read or update local apps, invoke shell command (from windows)
  ipcMain.handle('to-console', (event, message) => {
    let action = message.action

    if (action === "app-reload") {
      const apps = loadApps(appConfig.get('appHome'))
      appConfig.set('apps', apps.apps)

    } else if (action === "app-delete") {
      let appPath = message.appPath
      deleteApp(appPath)

    } else if (action === "task-cron-parse") {

      try {
        let cron = message.startTime
        let next = parser.parseExpression(cron).next()
        console.log(next, next.toString())
      } catch (e) {
        console.error(e)
        event.sender.reply
      }

    } else if (action === "task-configs-update") {
      updateTaskYaml(message.taskPath, message.key, message.update)

    } else if (action === "task-delete") {
      deleteTask(message.taskPath, message.taskPath, message.taskName)


    } else if (action === "shell") {
      const { exec } = require("child_process");
      exec(message.cmd, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    }
  })
}
