import {
  app,
  dialog,
  BrowserWindow,
  ipcMain
} from 'electron'

import { uioStop } from './utils/main/systemHook'
import { appConfig, userAgentList } from './utils/main/config'

import {
  createAssistWindow,
  createMainWindow,
  ipcListener,
  makeTray
} from "./app";

import { spawn } from "child_process"
import { loadApps } from './utils/main/queryTasks';
import { uioStartup } from "./utils/main/systemHook";
import { protocolHandler } from './utils/main/deeplink';

var fs = require('fs');
const Store = require("electron-store")
Store.initRenderer()

const path = require('path')
const devMode = process.env.npm_lifecycle_event === "electron:serve"

const iconPath = path.join(
  `${__dirname}/../imgs`, 'logo-medium.png',
)

const userHeader = userAgentList[Math.floor((Math.random() * userAgentList.length))]

let mainWindow;
let assistWindow;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('autool', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('autool')
}


let subPy = null;
let confirmQuit = false

const PY_SRC_FOLDER = "../runtime"
const PY_MODULE = "app.py"

const getPythonScriptPath = () => {
  if (devMode) {
    return path.join(__dirname, PY_SRC_FOLDER, PY_MODULE);
  }

  if (process.platform === "win32") {
    return path.join(
      __dirname,
      PY_SRC_FOLDER,
      PY_MODULE.slice(0, -3) + ".exe"
    );
  }
  return path.join(__dirname, PY_SRC_FOLDER, PY_MODULE.slice(0, -3));
};

const checkProcessRunning = (pid) => {
  // https://stackoverflow.com/a/57286834
  try {
    return process.kill(pid, 0);
  } catch (error) {
    console.error(error);
    return error.code === 'EPERM';
  }
}

const startPythonSubprocess = () => {
  if (subPy != null) {
    if (checkProcessRunning(subPy.pid)) {
      console.log("[ NodeJS ] Python subprocess already started. PID ", subPy.pid);
      return;
    }
  }

  let script = getPythonScriptPath();
  let appHome = appConfig.get('appHome')
  let logPath = path.join(appHome, 'background.log')

  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '')
  }

  // Size in bytes
  if (fs.statSync(logPath).size > 1024 * 1024) {
    fs.unlinkSync(logPath)
  }

  let out = fs.openSync(logPath, 'a');
  let err = fs.openSync(logPath, 'a');

  if (!devMode) {
    subPy = spawn(script, [], {
      detached: true,
      env: {
        ...process.env,
        'PYTHONIOENCODING': 'utf8',
        'LANG': 'en_US.UTF-8'
      },
      stdio: ['ignore', out, err],
    });

  } else {
    subPy = spawn('python', ['-u', script],
      {
        detached: true,
        stdio: ['ignore', out, err],
      });
  }
  subPy.unref();
  console.log("[ Backend ] websocket server started. PID ", subPy.pid);
};

const init = async () => {
  let userPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support/libauto' : process.env.HOME + "/.local/share")

  let defaultAppHome = path.join(userPath, 'scripts')
  appConfig.set('defaultAppHome', defaultAppHome)
  let appHome = appConfig.get('appHome') 
  if (!appHome) {
    appHome = defaultAppHome
  }
  if (!fs.existsSync(appHome)) {
    fs.mkdirSync(appHome, { recursive: true });
  }
  appConfig.set('appHome', appHome)
  console.log("[ NodeJS ] appHome: ", appHome)

  // restart link
  ipcMain.on('backend-server-reboot', (event, arg) => {
    startPythonSubprocess()
  })

  // deep links
  if (process.platform === "win32") {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
        // the commandLine is array of strings in which last element is deep link url
        // the url str ends with /

        let url = commandLine.pop().slice(0, -1)
        protocolHandler(url, mainWindow)
      })
    }
  } else {
    app.on('open-url', (event, url) => {
      protocolHandler(url, mainWindow)
    })
  }

  startPythonSubprocess()
  assistWindow = await createAssistWindow(userHeader)
  mainWindow = await createMainWindow(userHeader, iconPath)

  ipcListener(mainWindow, assistWindow)
  makeTray(iconPath, mainWindow, assistWindow)

  // Setting up app path and server checking
  await appSetup()
}

app.whenReady().then(async () => {
  await init()
  if (process.platform === "darwin") {
    app.dock.setIcon(iconPath)
    app.dock.show()
  }

  uioStartup(mainWindow, assistWindow)
  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (subPy == null) {
      startPythonSubprocess();
    }

    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow()
    }
  })

  mainWindow.on('moved', () => {
    var size = mainWindow.getBounds();
    appConfig.set('mainWindowPosition.x', size.x)
    appConfig.set('mainWindowPosition.y', size.y)
  })

  mainWindow.on('resized', function (e) {
    var size = mainWindow.getSize();
    var width = size[0];
    var height = size[1];

    if (height < 200) {
      mainWindow.webContents.send('collapse-main', {})
    } else {
      appConfig.set('mainWindowDimension.width', width)
      appConfig.set('mainWindowDimension.height', height)
    }
  });

  mainWindow.on('close', (e) => {
    if (confirmQuit) {
      return
    } else {
      mainWindow.focus()
      var choice = dialog.showMessageBoxSync(
        mainWindow,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
        });

      e.preventDefault();
      if (choice == 0) {
        confirmQuit = true
        uioStop()
        app.quit()
        process.exit(0)
      }
    }
  })

  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

})

// Setup before launching GUI window
const appSetup = async () => {
  let appHome = appConfig.get('appHome')
  const apps = await loadApps(appHome)
  appConfig.set('apps', apps.apps)
  
  if (apps.apps.length == 0) {
    setTimeout(() => {
      const link = "https://github.com/danalite/awesome-autool-scripts/tree/master/danalite/Unit-Tests"
      mainWindow.webContents.send('download', link)
    }, 1000)
  }

  // Gather and confirm whether to autostart tasks
  let taskNames = apps.autostart.map((e) => e.relTaskPath.split(path.sep).slice(-1)[0])
  if (taskNames.length > 0) {
    // console.log(`[ NodeJS ] autostart ${taskNames}`)
    setTimeout(() => {
      // Once approved, options are forwarded to main window & backend
      assistWindow.webContents.send('assist-win-push', {
        type: "select",
        options: taskNames,
        title: "Auto-start tasks?",
        timeout: 18,
        max: taskNames.length,
        source: "console.main",
        callback: "auto-start-approve",
        preset: Array(taskNames.length).fill(true)
      })

      ipcMain.once("auto-start-approve", (event, message) => {
        let tasks = JSON.parse(message)
        let approvedTasks = apps.autostart.filter(t => tasks.includes(t.relTaskPath))

        if (mainWindow) {
          mainWindow.webContents.send('to-main-win',
            { action: "run-task", tasks: approvedTasks })
        }
      })

    }, 2000)
  }
}
