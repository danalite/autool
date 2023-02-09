import { screen, ipcMain } from "electron";
import { appConfig } from "@/utils/main/config";
import { deleteApp, addTask, deleteTask, loadApps, updateTaskYaml } from '@/utils/main/queryTasks';
import { registerUioEvent } from "@/utils/main/uioListener";

async function runShellCommand(cmd) {
  const { exec } = require("child_process");
  exec(cmd, (error, stdout, stderr) => {
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

  ipcMain.on('assist-position-toggle', (event, onRight) => {
    let pos = assistWindow.getBounds()
    const currentScreen = screen.getPrimaryDisplay()['size']

    if (onRight && pos.x == 0) {
      assistWindow.setBounds({ x: currentScreen.width - 380, y: 15, width: 380, height: currentScreen.height - 20 })

    } else if (!onRight && pos.x > 0) {
      assistWindow.setBounds({ x: 0, y: 15, width: 380, height: currentScreen.height - 20 })
    }
  })

  // This handler updates our mouse event settings depending
  // on whether the user is hovering over a clickable element
  // in the call window.
  ipcMain.handle("assist-ignore-mouse-events", (e, ...args) => {
    assistWindow.setIgnoreMouseEvents(...args);
  });

  ipcMain.handle("assist-focus", () => {
    assistWindow.focus();
  });

  // Proxy message from main window to assist window
  // https://stackoverflow.com/a/40251412
  ipcMain.on('to-assist-window', (event, message) => {
    assistWindow.webContents.send('assist-win-push', message)
  })

  // read or update local apps, invoke shell command (from windows)
  ipcMain.handle('to-console', async (event, message) => {
    let action = message.action

    if (action === "app-reload") {
      const apps = await loadApps(appConfig.get('appHome'))
      appConfig.set('apps', apps.apps)

    } else if (action === "app-delete") {
      let appPath = message.appPath
      deleteApp(appPath)

    } else if (action === "task-configs-update") {
      updateTaskYaml(message.taskPath, message.key, message.update)

    } else if (action === "task-delete") {
      deleteTask(message.taskPath, message.taskPath, message.taskName)

    } else if (action === "shell") {
      runShellCommand(message.cmd)

    } else if (action == "uio-event") {
      // E.g., when recording is done or hotkey triggered
      // assistWindow should be hidden in some cases
      registerUioEvent(assistWindow, {
        type: message.type,
        source: message.source,
        taskId: message.taskId,
        options: message.options,

        callback: (ret) => {
          if (message.type == "macroRecord") {
            // Save the image to disk
            // console.log(ret, message)
            addTask(message.appPath, message.taskName, ret)

          } else {
            mainWindow.webContents.send("uio-callback", ret)
          }
        }

      })
    }
  })
}