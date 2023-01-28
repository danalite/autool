import {
  screen,
  ipcMain,
  Notification,
  globalShortcut,
  desktopCapturer
} from 'electron'

const path = require('path')

import { optimizeMacroSeq } from '@/utils/main/macroOpt';
import { uIOhook } from 'uiohook-napi'

const iconPath = path.join(
  `${__dirname}/../resources`, 'logo.png',
)

const activeWindow = require('active-win');

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

export const uioListenerStop = async () => {
  uIOhook.stop()
}

export const uioListenerStart = async (hotkeyTable) => {
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
        mainWindow.webContents.send('to-backend', newEvent)
        globalShortcut.unregister(start)
        globalShortcut.unregister(stop)
      })
      if (!ret) {
        console.log(`[ NodeJS ] ${stop} unhooking failed`)
      }

    } else if (type === 'keyWait') {
      const { key } = data.value

      let ret = globalShortcut.register(key, () => {
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
        mainWindow.webContents.send('to-backend', newEvent)
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
    // console.log("@@ down", e.x, e.y)
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
    // console.log("@@ up", e.x, e.y)
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
      mainWindow.webContents.send('to-backend', newEvent)
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