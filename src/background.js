import {
  app,
  BrowserWindow,
} from 'electron'

const axios = require('axios')

import { UiohookKey } from 'uiohook-napi'
import { appConfig, userAgentList } from './utils/main/config'
import { uioListenerStart, uioListenerStop } from './utils/main/uioListener';

import {
  createAssistWindow,
  createMainWindow,
  ipcListener,
  makeTray
} from "./app";

import { execFile, spawn } from "child_process"
import { loadApps } from './utils/main/queryTasks';

const Store = require("electron-store")
Store.initRenderer()

const path = require('path')
const devMode = process.env.npm_lifecycle_event === "electron:serve"

const iconPath = path.join(
  `${__dirname}/../resources`, 'logo.png',
)

const userHeader = userAgentList[Math.floor((Math.random() * userAgentList.length))]

let mainWindow;
let assistWindow;

// Backend PyWebsocket server
let subPy = null;
const PY_SRC_FOLDER = "../backend"
const PY_MODULE = "app.py"

var ioListenerTable = new Object()
ioListenerTable[UiohookKey.Q] = "hello"

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
    console.log('[ Backend ] process exited with ' +
      `code ${code} and signal ${signal}`);
  });

  subPy.stdout.on('data', (data) => {
    console.log(`\n[ Backend ] ${data}`);
  });

  // Pipe subprocess output to main std.out
  subPy.stderr.pipe(process.stdout)
};

const init = async () => {
  startPythonSubprocess()

  mainWindow = await createMainWindow(userHeader)
  assistWindow = await createAssistWindow(userHeader)

  // assistWindow.on('blur', () => {
  //   if (!assistWindow.webContents.isDevToolsOpened()) {
  //     assistWindow.hide()
  //   }
  // })

  makeTray(iconPath, mainWindow, assistWindow)

  // Setting up app path and server checking
  await appSetup()

  ipcListener(mainWindow, assistWindow)
  mainWindow.webContents.send('start-wss-backend')

  uioListenerStart(ioListenerTable)
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

  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", () => {
    console.log("[ NodeJS ] Terminating subPy...")
    uioListenerStop()
    subPy.kill()  // 'SIGTERM'
    // process.exit(0)
  })

})

// Setup before launching GUI window
const appSetup = async () => {
  let appHome = appConfig.get('appHome')
  if (appHome === '') {
    let userPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support/libauto' : process.env.HOME + "/.local/share")
    appConfig.set('appHome', userPath)
    appHome = userPath
  }

  // Validate license 
  const license = appConfig.get('license')
  if (license.key !== '') {
    try {
      console.log(`[ NodeJS ] License validating ${license.key}`)
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

  const apps = loadApps(appHome)
  appConfig.set('apps', apps.apps)

  // Auto-start tasks
  let taskNames = apps.autostart.map((e) => e.relTaskPath)
  console.log(`[ NodeJS ] autostart ${taskNames}`)
  
  setTimeout(async () => {
    mainWindow.webContents.send('run-task-from-main', 
      {is_autostart: true, tasks: apps.autostart})
  }, 2000)
}
