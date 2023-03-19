import {
  app,
  dialog,
  systemPreferences,
  BrowserWindow,
  ipcMain
} from 'electron'

const axios = require('axios')

// import { kill } from './utils/main/subprocessUtils'
import { uioStop } from './utils/main/uioListener'
import { appConfig, userAgentList } from './utils/main/config'

import {
  createAssistWindow,
  createMainWindow,
  ipcListener,
  makeTray
} from "./app";

import { execFile, spawn, exec } from "child_process"
import { loadApps } from './utils/main/queryTasks';
import { uioStartup } from "./utils/main/uioListener";

const Store = require("electron-store")
Store.initRenderer()

const path = require('path')
const devMode = process.env.npm_lifecycle_event === "electron:serve"

const iconPath = path.join(
  `${__dirname}/../imgs`, 'logo.png',
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

// Backend PyWebsocket server
let subPy = null;
let subPyExited = false
let isRestartEnabled = false
let confirmQuit = false

const PY_SRC_FOLDER = "../backend"
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

const startPythonSubprocess = () => {
  let script = getPythonScriptPath();

  if (!devMode) {
    console.log("[ NodeJS ] prodMode. " + script)
    subPy = execFile(script, []);

  } else {
    console.log("[ NodeJS ] devMode. python -u " + script)
    subPy = spawn('python', ['-u', script], { detached: true });
  }

  console.log("[ Backend ] websocket server started. PID ", subPy.pid);

  subPy.on('exit', function (code, signal) {
    console.log('[ NodeJS ] process exited with ' +
      `code ${code} and signal ${signal}`);
    subPyExited = true

    if (isRestartEnabled) {
      startPythonSubprocess()
      isRestartEnabled = false
      mainWindow.webContents.send('wss-server-restarted')
    }
  });

  subPy.stdout.on('data', (data) => {
    console.log(`\n[ Backend ] ${data}`);
  });

  // Pipe subprocess output to main std.out
  subPy.stderr.pipe(process.stdout)
};

ipcMain.on('wss-server-restart', (event, arg) => {
  console.log("[ NodeJS ] restarting wss server...")
  subPy.kill('SIGTERM')
  isRestartEnabled = true
})

const init = async () => {
  startPythonSubprocess()

  // Electron deep links
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
      dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`)
    })
  }
  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })

  mainWindow = await createMainWindow(userHeader)
  assistWindow = await createAssistWindow(userHeader)

  // assistWindow.on('blur', () => {
  //   if (!assistWindow.webContents.isDevToolsOpened()) {
  //     assistWindow.hide()
  //   }
  // })
  if (process.platform === "darwin") {
    let enabled = systemPreferences.isTrustedAccessibilityClient(true)
    console.log("[ NodeJS ] OSX accessibility status: ", enabled)
  }

  uioStartup(assistWindow)
  makeTray(iconPath, mainWindow, assistWindow)

  // Setting up app path and server checking
  await appSetup()
  ipcListener(mainWindow, assistWindow)
  mainWindow.webContents.send('start-wss-backend', {})
}

app.whenReady().then(async () => {
  await init()
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

    appConfig.set('mainWindowDimension.width', width)
    appConfig.set('mainWindowDimension.height', height)
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

  app.on("before-quit", async () => {
    // Send stop signal to backend
    await mainWindow.webContents.send('to-backend', {
      event: 'I_EVENT_WSS_REQ',
      action: 'Shutdown'
    })
    console.log("[ NodeJS ] before-quit!")
    if (!subPyExited) {
      console.log("[ NodeJS ] subPy not exited. Killing...")
      subPy.kill('SIGTERM')
    }
    process.exit(0)
  })

})

// Setup before launching GUI window
const appSetup = async () => {
  let appHome = appConfig.get('appHome')
  if (appHome === '') {
    // let userPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support/libauto' : process.env.HOME + "/.local/share")
    // appHome = path.join(userPath, 'scripts')

    let user = require("os").userInfo().username
    appHome = `/Users/${user}/Desktop/apps/`
    appConfig.set('appHome', appHome)
  }

  // Validate license 
  const license = appConfig.get('license')
  if (license.key !== '') {
    try {
      console.log(`[ NodeJS ] Checking license ${license.key}`)
      const res = await axios.post(`https://api.whop.com/api/v1/licenses/${license.key}/validate`, { metadata: {} }, {
        headers: {
          "Authorization": "fe5f45a48bb348cd0cdad3b81dc9fa0def67265a8e",
          "accept": "application/json",
          "content-type": 'application/json'
        }
      });

      if (res.status === 200) {
        appConfig.set("license.valid", res.data.valid)

      } else {
        console.log("[ NodeJS ] failed verifying license")
      }

    } catch (error) {
      console.log("[ NodeJS ] failed connecting to whop API")
      appConfig.set("license.valid", false)
    }
  }

  const apps = await loadApps(appHome)
  appConfig.set('apps', apps.apps)
  appConfig.set('pathSeparator', path.sep)

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
