import { app, ipcMain, BrowserView } from "electron";
import { appConfig } from "@/utils/main/config";
import { loadApps } from '@/utils/main/queryTasks';

const path = require("path");
const fs = require('fs');

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
    const duration = 100;

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

  // Close window and terminate py server
  ipcMain.on('main-win-close', () => {
    const assistWindowBounds = assistWindow.getBounds()
    appConfig.set('assistWindowPosition', { x: assistWindowBounds.x, y: assistWindowBounds.y })
    appConfig.set('credentials.port', '')
    app.quit()
  })

  // This handler updates our mouse event settings depending
  // on whether the user is hovering over a clickable element
  // in the call window.
  ipcMain.handle("set-ignore-mouse-events", (e, ...args) => {
    assistWindow.setIgnoreMouseEvents(...args);
  });

  // local app or tasks CURD
  ipcMain.handle('app-reload', async (event) => {
    // console.log("[ NodeJS ] reloading apps...")
    const apps = loadApps(appConfig.get('appHome'))
    appConfig.set('apps', apps.apps)
  })

  ipcMain.handle('app-task-delete', async (event, appOrTask) => {
    if (appOrTask.type === "task") {
      let taskPath = task.appPath + task.name + ".yaml"
      fs.unlink(taskPath, function (err) {
        if (err) return console.log(err);

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

    } else if (appOrTask.type === "app") {
      let appPath = appOrTask.appPath
      if (fs.existsSync(appPath)) {
        fs.rmSync(appPath, { recursive: true, force: true })
      } else {
        console.error(`${appPath} not exists`)
      }
    }
  })
}
