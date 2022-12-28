import {
  app,
  screen,
  BrowserWindow,
  ipcMain,
  Notification,
  globalShortcut,
  desktopCapturer
} from 'electron'

const activeWindow = require('active-win');
const axios = require('axios')
const fs = require('fs');

import { appConfig, userAgentList } from './utils/main/config'
import { optimizeMacroSeq } from './utils/main/macroOpt';

import {
  createAssistWindow,
  createMainWindow,
  ipcListener,
  makeTray,
  createTaskEditorWindow,
  queryMatchIpc
} from "./app";

import { execFile, spawn } from "child_process"
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { loadApps } from './utils/main/queryTasks';
import { License } from '@vicons/tabler';

const Store = require("electron-store")
Store.initRenderer()

const path = require('path')
const devMode = process.env.npm_lifecycle_event === "electron:serve"

const iconPath = path.join(
  devMode ? `${__dirname}/../resources` : `${__dirname}/../resources`,
  'app.png',
)

const userHeader = userAgentList[Math.floor((Math.random() * userAgentList.length))]

let mainWindow;
let assistWindow;
let taskEditorWindow;

// Backend PyWebsocket server
let subPy = null;
const PY_SRC_FOLDER = "../backend"
const PY_MODULE = "app.py"

// IO hook event tracing
let macroRecordCsr = {
  started: false,
  taskId: '',
  startKey: '',
  stopKey: '',
  track: [],
}
var lastTimeStamp = 0
var recordedActions = []
let selectAreaAction = {
  started: false,
  target: {
    taskId: '',
    owner: '',
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    lt: [0, 0],
  }
}
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
  new Notification({
    title: "AbaTech SSR has started. ",
    body: "Aren't you excited about learning workflow automation?",
    icon: iconPath,
  }).show()
  startPythonSubprocess()

  mainWindow = await createMainWindow(userHeader)
  assistWindow = await createAssistWindow(userHeader)
  taskEditorWindow = await createTaskEditorWindow(userHeader)

  assistWindow.on('blur', () => {
    if (!assistWindow.webContents.isDevToolsOpened()) {
      assistWindow.hide()
    }
  })

  makeTray(iconPath, mainWindow, assistWindow)

  // Setting up app path and server checking
  await appSetup()

  ipcListener(mainWindow, assistWindow)
  mainWindow.webContents.send('start-wss-backend')

  queryMatchIpc(mainWindow, userHeader) // 战绩查询窗口
  taskEditorIpc()

  // Listen IO events requested by user
  uIOEventMonitor(ioListenerTable)
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
    uIOhook.stop()
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

      if (res.status !== 200) {
        console.log(res.statusText)

      } else {
        console.log("[ NodeJS ] ", res.data.email, res.data.valid)
        appConfig.set("license.valid", res.data.valid)
      }

    } catch (error) {
      console.log("[ NodeJS ] failed connecting to whop API")
      appConfig.set("license.valid", false)
    }
  }

  appConfig.set("appTemp", path.join(path.join(appHome, "scripts"), "temp.yaml"))
  const appsAndAutostart = loadApps(appHome)
  appConfig.set('apps', appsAndAutostart.apps)

  // auto-start tasks
  let newTasks = []
  appsAndAutostart.autostart.forEach((e) => {
    newTasks.push({
      relTaskPath: e.relTaskPath,
      absTaskPath: e.absTaskPath,
      appPath: e.appPath,
      inputs: e.inputs,
      options: e.options
    })
  })

  let taskNames = newTasks.map((e) => e.relTaskPath)
  console.log(`[ NodeJS ] autostart ${taskNames}`)
  setTimeout(async () => {
    mainWindow.webContents.send('run-task-from-main', 
      {is_autostart: true, tasks: newTasks})
  }, 5000)
}

const taskEditorIpc = async () => {
  ipcMain.on('show-editor-window', async (event, v) => {
    const data = JSON.parse(v)
    const appHome = appConfig.get('appHome')
    try {
      if (data.type === "task") {
        const taskCode = fs.readFileSync(data.absTaskPath, 'utf8');
        taskEditorWindow.webContents.send('open-task-editor', {
          ...data,
          'content': taskCode,
        })

      } else {
        let tasks = data.tasks.map((e) => {
          return e.relTaskPath
        })
        let appPath = data.path + path.sep
        if (data.tasks.length === 0) {
          appPath = path.join(appHome, "scripts") + path.sep + "example-Author" + path.sep + "example-App" + path.sep
        }

        taskEditorWindow.webContents.send('open-task-editor', {
          'type': data.type,
          'author': data.author,
          'app': data.app,
          'appPath': appPath,
          'icon': data.icon,
          'tasks': tasks,
        })
      }

    } catch (err) {
      console.error(err);
    }

    taskEditorWindow.show()
    taskEditorWindow.webContents.openDevTools()
  })

  ipcMain.on('load-task', (event, task) => {
    fs.readFile(task.path, 'utf8', (err, data) => {
      if (err) {
        // Creating a new task if loading not exists
        if (err.code == 'ENOENT') {
          let tempCode = `---
 task: taskName
 inputs:
   - name: inputName
   
 actions:
   - cmd.print($inputs[name])`

          fs.writeFile(task.path, tempCode, function (err) {
            if (err) throw err;
            let appJsonPath = path.join(task.appPath, "tasks.json")
            let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
            
            if (!appJson.tasks.includes(task.name + ".yaml")) {
              appJson.tasks.push(task.name + ".yaml")
            }
            fs.writeFileSync(appJsonPath, JSON.stringify(appJson));
          });
          taskEditorWindow.webContents.send('render-task-code', tempCode)
        } else {
          console.error(err);
        }
        return
      }
      taskEditorWindow.webContents.send('render-task-code', data)
    });
  })

  ipcMain.on('load-app', (event, data) => {
    let appJsonPath = path.join(data.appPath, "tasks.json")
    let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
    const tasks = appJson.tasks.map((e) => { return e.replace(".yaml", "") })
    const appIcon = appJson.icon
    taskEditorWindow.webContents.send('render-app',
      { 'tasks': tasks, 'icon': appIcon })
  })

  ipcMain.on('move-editor-window', (event, pos) => {
    taskEditorWindow.setBounds({ x: pos.x, y: pos.y, width: 1024, height: 576 })
  })

  ipcMain.on('min-task-editor-window', () => {
    taskEditorWindow.minimize()
  })

  ipcMain.on('close-task-editor-window', () => {
    taskEditorWindow.hide()
  })
}

const uIOEventMonitor = async (hotkeyTable) => {
  // IO hook event from AppMain/Ts
  //  Example data = {
  //     event: 'O_EVENT_HOOK_REQ',
  //     uuid: 'f2f4a303-e9f9-45dd-a5e4-58754baffb62',
  //     value: {
  //       type: 'osRecord',
  //       start: 'Enter+Enter',
  //       stop: 'Esc+Esc',
  //       mode: 'screenshot',
  //       track: [ 'key', 'click', 'move', 'time' ]
  //     },
  //     taskName: 'example-task-name'
  //   }
  ipcMain.on('io-hook-request', (event, data) => {
    const taskId = data.uuid
    const { type } = data.value
    if (type === 'osRecord') {
      const { start, stop, mode, track } = data.value
      new Notification({
        title: `osRecord: Hit "${start}" to start recording`,
        body: `${stop} to stop. All other local tasks are suspended.`,
        icon: iconPath,
      }).show()
      macroRecordCsr["started"] = false
      macroRecordCsr["taskId"] = taskId
      macroRecordCsr["track"] = track
      macroRecordCsr["mode"] = mode
      macroRecordCsr["start"] = start
      macroRecordCsr["stop"] = stop

      // Global hotkey for start/stop recording
      let ret = globalShortcut.register(start, () => {
        macroRecordCsr["started"] = true
        lastTimeStamp = Date.now()
        recordedActions = []
        console.log("Main app: osRecord started")
      })
      if (!ret) {
        console.log(`[ NodeJS ] ${start} registration failed`)
      }

      ret = globalShortcut.register(stop, () => {
        macroRecordCsr["started"] = false
        const optimizedSeq = optimizeMacroSeq(macroRecordCsr, recordedActions)
        console.log("Main app: osRecord stopped", optimizedSeq)

        let newEvent = {
          event: 'I_EVENT_USER_INPUT',
          uuid: taskId,
          value: {
            type: 'osRecord',
            traces: optimizedSeq
          }
        }
        mainWindow.webContents.send('io-hook-resp', newEvent)
        globalShortcut.unregister(start)
        globalShortcut.unregister(stop)
      })
      if (!ret) {
        console.log(`[ NodeJS ] ${stop} unhooking failed`)
      }

    } else if (type === 'keyWait') {
      const { key } = data.value
      new Notification({
        title: `keyWait: Hit "${key}" to continue task`,
        body: `This keyWait won't be blocking execution of other tasks.`,
        icon: iconPath,
      }).show()

      ret = globalShortcut.register(key, () => {
        console.log("Main app: keyWait event resolved (", key, ")")
        globalShortcut.unregister(start)
        let newEvent = {
          event: 'I_EVENT_USER_INPUT',
          uuid: taskId,
          value: {
            type: 'keyWait',
            key: key
          }
        }
        mainWindow.webContents.send('io-hook-resp', newEvent)
      })
      if (!ret) {
        console.log(`[ NodeJS ] ${stop} unhooking failed`)
      }

    } else if (type === 'selectArea') {
      const { window } = data.value
      new Notification({
        title: `selectArea: Please drag a rectangle to select area`,
        body: `target window: ${window}`,
        icon: iconPath,
      }).show()

      let options = {}
      activeWindow(options).then(
        win => {
          // console.log("@@ reg", win.bounds)
          selectAreaAction.started = true
          selectAreaAction.target = {
            taskId: taskId,
            owner: win.owner.name,
            bounds: win.bounds,
            lt: [0, 0]
          }
        });

    }

    console.log("[ NodeJS ] io-hook-request", data)
  })

  const trackTime = () => {
    if (macroRecordCsr["track"].includes("delay")) {
      const now = Date.now()
      recordedActions.push({
        "type": "sleep",
        'duration': now - lastTimeStamp
      })
      lastTimeStamp = now
    }
  }

  // IO hook event recording
  uIOhook.on('keyup', (e) => {
    if (macroRecordCsr["started"] && macroRecordCsr["track"].includes("key")) {
      trackTime()
      recordedActions.push({
        type: 'keyup',
        key: e.keycode,
      })
    }
  })

  uIOhook.on('keydown', (e) => {
    if (macroRecordCsr["started"] && macroRecordCsr["track"].includes("key")) {
      trackTime()
      recordedActions.push({
        type: 'keydown',
        key: e.keycode,
      })
    }
  })

  // Mouse dragging events (e.g., select area)
  uIOhook.on('mousedown', (e) => {
    console.log("@@ down", e.x, e.y)
    if (macroRecordCsr["started"] && macroRecordCsr["track"].includes("move")) {
      trackTime()
      recordedActions.push({
        type: 'mousedown',
        key: e.keycode,
      })

    } else if (!macroRecordCsr["started"] && selectAreaAction.started) {
      // console.log("@@ down", e.x, e.y)
      selectAreaAction.target.lt = [e.x, e.y]
    }
  })

  uIOhook.on('mouseup', (e) => {
    console.log("@@ up", e.x, e.y)
    if (macroRecordCsr["started"] && macroRecordCsr["track"].includes("move")) {

      // Send selected region to task
    } else if (!macroRecordCsr["started"] && selectAreaAction.started) {
      const { taskId, owner, bounds, lt } = selectAreaAction.target
      // console.log("@@ up", e.x, e.y)
      let area_width = e.x - lt[0]
      let area_height = e.y - lt[1]
      let newEvent = {
        event: 'I_EVENT_USER_INPUT',
        uuid: taskId,
        value: {
          type: 'selectArea',
          window: owner,
          area: [lt[0] - bounds.x, lt[1] - bounds.y, area_width, area_height]
        }
      }
      mainWindow.webContents.send('io-hook-resp', newEvent)
      selectAreaAction.started = false
    }
  })

  // Mouse up and down at same location
  uIOhook.on('click', (e) => {
    // console.log("@@ click", e)
    if (macroRecordCsr["started"] && macroRecordCsr["track"].includes("click")) {
      trackTime()

      // Screenshot and recognize
      switch (macroRecordCsr["mode"]) {
        case 'screenshot':
          // https://stackoverflow.com/a/71663530
          const screenSize = screen.getPrimaryDisplay()['size']
          desktopCapturer.getSources({
            types: ['screen'], thumbnailSize: {
              height: screenSize.height,
              width: screenSize.width
            }
          }).then(sources => {
            // https://subscription.packtpub.com/book/mobile/9781838552206/4/ch04lvl1sec34/resizing-and-cropping-the-image
            let region = {
              x: Math.max(e.x - 300, 0),
              y: Math.max(e.y - 60, 0),
              width: 600,
              height: 120
            }
            const content = sources[0].thumbnail.crop(region).toDataURL()
            // const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
            // fs.writeFileSync("/Users/Desktop/test.png", content)

            let payload = { "image": content }
            const uiServer = appConfig.get('remoteServer.ui')
            axios.post(uiServer, payload).then((resp) => {
              console.log(resp.data)
            }).catch((err) => {
              console.log(err)
            })

          }).catch(err => {
            console.log(err)
          })
          break;

        case 'mouse':
          recordedActions.push({
            type: 'click',
            x: e.x,
            y: e.y,
          })
          break;

        case 'mouseWin':
          let options = {}
          activeWindow(options).then(
            win => {
              if (win == undefined) {
                // Click on background
                recordedActions.push({
                  type: 'click',
                  x: e.x,
                  y: e.y,
                })
              } else {
                // Click on a foreground window
                recordedActions.push({
                  type: 'click',
                  window: win.owner.name,
                  x: e.x - win.bounds.x,
                  y: e.y - win.bounds.y,
                })
              }
            });
          break;
      }
    }
  })

  uIOhook.start()
}
