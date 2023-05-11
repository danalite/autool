import { ipcMain, app } from "electron";
import { appConfig } from "@/utils/main/config";
import { addApp, addTask, deleteApp, deleteTask, loadApps, updateTaskYaml } from '@/utils/main/queryTasks';
import { registerUioEvent } from "@/utils/main/systemHook";

const fs = require('fs');
export const ipcListener = (mainWindow, assistWindow) => {
  ipcMain.on('move-main', (event, pos) => {
    let dim = appConfig.get('mainWindowDimension')
    let bounds = dim.isCollapsed ? { width: 590, height: 40 } : { width: dim.width, height: dim.height }
    mainWindow.setBounds({ x: pos.x, y: pos.y, ...bounds })
  })

  // Collapse main console to floating bar
  ipcMain.on('main-win-collapse', (event, dim) => {
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
      mainWindow.setWindowButtonVisibility(false)
      mainWindow.setResizable(false)
    } else {
      mainWindow.setAlwaysOnTop(false)
      mainWindow.setWindowButtonVisibility(true)
      mainWindow.setResizable(true)
    }
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

  // Proxy message from assist window to main window
  ipcMain.on('event-to-main-win', (event, message) => {
    // if message has key `callback`, send to callback channel
    if (message.callback) {
      mainWindow.webContents.send(message.callback, message.data)
    } else {
      mainWindow.webContents.send("to-main-win", message)
    }
  })

  // read or update local apps, invoke shell command (from windows)
  ipcMain.on('to-console', async (event, message) => {
    let action = message.action

    if (action === "reload-apps") {
      const apps = await loadApps(appConfig.get('appHome'))
      appConfig.set('apps', apps.apps)
      mainWindow.webContents.send("apps-loaded", {})

    } else if (action === "delete-app") {
      let appPath = message.appPath
      deleteApp(appPath)

    } else if (action === "create-app") {
      addApp(message.appAuthor, message.appName, message.appIcon)

    } else if (action === "update-task-configs") {
      updateTaskYaml(message.taskPath, message.key, message.update)

    } else if (action === "delete-task") {
      deleteTask(message.appPath, message.taskPath, message.taskName)

    } else if (action === "create-task") {
      addTask(message.appPath, message.taskName, message.content)

    // } else if (action === "load-image") {
    //   const encode = fs.readFileSync(message.path).toString('base64');
    //   const content = `data:image/png;base64,${encode}`
    //   assistWindow.webContents.send("image-loaded", content)

    } else if (action == "uio-event") {
      // E.g., when recording is done or hotkey triggered
      // assistWindow should be hidden in some cases
      registerUioEvent(assistWindow, {
        ...message,
        callback: (ret) => {
          if (message.type == "macroRecord") {
            let task = {
              task: message.taskName,
              actions: ret
            }
            addTask(message.appPath, message.taskName, task)

          } else if (message.source == "canvasWindow") {
            // console.log("canvasWindow callback", message.callback)

            assistWindow.webContents.send(message.callback, {
              type: message.type, ...ret
            })

          } else {
            // keyWait (resumeTask) or hotkeyWait (trigger task)
            mainWindow.webContents.send("uio-callback",
              { type: message.type, taskName: message.source, ...ret })
          }
        }

      })
    }
  })
}