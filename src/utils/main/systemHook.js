import {
  screen,
  ipcMain,
  globalShortcut,
  shell
} from 'electron'

import { getKeyByValue, parseSequence, uioEventEnum } from '@/utils/main/macroOpt';
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { appConfig } from '@/utils/main/config'

const activeWindow = require('active-win');

// queue the incoming IO hook requests
let ioEventQueue = []

// TODO: support mouseup, mousedown
var recordOptions = {
  "click": true,
  "keydown": true,
  "keyup": true
}

// IO hook event tracing
let macroRecordCsr = {
  started: false,
  taskId: '',
  startKey: '',
  stopKey: '',
  track: [],
}

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

var isMacroRecording = false
var macroRecordedSequence = []

// A history window to record the last 10 key strokes
var keyStrokesWindow = []
var keyboardActionTable = []

var isTrackingTime = false
var lastActionTimeStamp = 0

var mouseActionTables = []
var isOverAssist = false
var isHelperWindowShown = false
var assistBounds = {}

const assistWindowMouseWatch = (assistWindow) => {
  // If no macro recording, activate assist window and DOM listeners  
  //    when mouse is hovered on assist window area. 
  //   Otherwise, assist window is hidden and DOM listeners are disabled.
  assistBounds = assistWindow.getBounds()

  mouseActionTables.push(
    {
      name: "move-assist-window-enter",
      source: "console",
      rule: (e) => {
        return e.x > assistBounds.x + assistBounds.width - 380 || e.x < 500
      },
      action: (e) => {
        // console.log("enter assist window area")  
      }
    },

    // Leave assist window area
    {
      name: "move-assist-window-leave",
      source: "console",
      rule: (e) => {
        return e.x > 500 && e.x < assistBounds.x + assistBounds.width - 380
      },
      action: (e) => {
        // console.log("leave assist window area")
        // assistWindow.webContents.send('mouse-leave-assist', { })
      }
    }, 
  )
}

export const uioStartup = (assistWindow) => {
  uIOhook.start()
  assistWindowMouseWatch(assistWindow)

  uIOhook.on('mousemove', async (e) => {
    await Promise.all(mouseActionTables.map(async (action) => {
      // Movement hook specific actions
      if (action.rule(e) && action.name.startsWith("move")) {
        await action.action(e)
      }
    }))
  })

  uIOhook.on('click', async (e) => {
    await Promise.all(mouseActionTables.map(async (action) => {
      if (action.rule(e) && action.name.startsWith("click")) {
        await action.action(e)
      }
    }))
  })

  let keyTargets = ['keyup', 'keydown']
  for (let i = 0; i < keyTargets.length; i++) {
    uIOhook.on(keyTargets[i], (e) => {

      // Key stroke window
      keyStrokesWindow.push(e)
      if (keyStrokesWindow.length > 10) {
        keyStrokesWindow.shift()
      }

      // Keyboard match and action table
      keyboardActionTable.map(async (action) => {
        if (action.rule(e)) {
          await action.action(e)
        }
      })
    })
  }

  let ret = globalShortcut.register('CommandOrControl+D', () => {
    isHelperWindowShown = !isHelperWindowShown
    assistWindow.webContents.send('toggle-helper-drawer', {})
  })
  if (!ret) {
    console.log(`[ NodeJS ] hotkey failed`)
  }
}

const isHotKeyComboPressed = (hotKeyStr) => {
  let targetKeys = hotKeyStr.split("+").reverse()
  let length = targetKeys.length

  if (keyStrokesWindow.length < length) return false
  let newKeys = [...keyStrokesWindow].reverse().slice(0, 4)

  let match = 0
  for (let i = 0; i < length; i++) {
    if (targetKeys[i] == getKeyByValue(newKeys[i].keycode) && uioEventEnum[newKeys[i].type] == "keydown") {
      match++
    }
  }
  // console.log("match ", targetKeys, newKeys.map((k) => getKeyByValue(k.keycode)), match)
  return match == length
}

const isConsecutiveKeys = (targetKey) => {
  if (keyStrokesWindow.length < 4) return false
  let newKeys = [...keyStrokesWindow].reverse().slice(0, 4)
  const interval = (newKeys[0].time - newKeys[3].time) / 10e8

  // console.log("@@", newKeys.map((k) => k.keycode), interval)
  return uioEventEnum[newKeys[0].type] == "keyup" && newKeys.reduce((a, c) => a && (c.keycode == targetKey), true) && (interval < 0.5)
}

const detectIcon = (e, reception = { width: 600, height: 120 }) => {
  // https://stackoverflow.com/a/71663530
  const screenSize = screen.getPrimaryDisplay()['size']
  const { desktopCapturer } = require('electron')
  desktopCapturer.getSources({
    types: ['screen'], thumbnailSize: {
      height: screenSize.height,
      width: screenSize.width
    }
  }).then(sources => {
    // https://subscription.packtpub.com/book/mobile/9781838552206/4/ch04lvl1sec34/resizing-and-cropping-the-image
    let region = {
      x: Math.max(e.x - reception.width / 2, 0),
      y: Math.max(e.y - reception.height / 2, 0),
      width: reception.width,
      height: reception.height
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
}

const hotkeyRemoveUpdateMAT = (event) => {
  keyboardActionTable = keyboardActionTable.filter((a) => a.name != `hotkey-${event.taskId}`)
}

const hotkeyRegisterUpdateMAT = (event) => {
  keyboardActionTable.push({
    name: `hotkey-${event.taskId}`,
    source: event.source,
    rule: (e) => {
      return isHotKeyComboPressed(event.hotkey)
    },
    action: (e) => {
      event.callback({ taskId: event.taskId })
    }
  })
}

const keyWaitUpdateMAT = (event) => {
  // console.log(event, "@@@")
  keyboardActionTable.push({
    name: "key-wait",
    // From a specific task source
    source: event.source,
    rule: (e) => {
      console.log(getKeyByValue(e.keycode), event.options, e.keycode)
      return event.options.includes(getKeyByValue(e.keycode))
    },
    action: (e) => {
      keyboardActionTable = keyboardActionTable.filter((a) => a.source != event.source)
      const keycode = getKeyByValue(e.keycode)
      event.callback({
        type: "keyWait",
        taskId: event.taskId,
        source: event.source,
        return: keycode
      })
    }
  })
}

const macroRecordUpdateMAT = (options) => {
  // Existing MAT items:
  //    key-shift-shift: restart and clear the seq
  //    key-meta-meta: stop and return the seq
  //    key-all: record 
  //    click-all: record mouse clicks (no drag)

  keyboardActionTable.push({
    name: "key-all",
    rule: (e) => {
      return true
    },
    action: (e) => {
      if (isMacroRecording) {
        if (isTrackingTime) {
          let delta = e.time - lastActionTimeStamp
          if (delta > 0.02 * 1e9) {
            macroRecordedSequence.push({
              type: "delay",
              value: delta / 1e9
            })
          }
          lastActionTimeStamp = e.time
        }
        macroRecordedSequence.push(e)
      }
    }
  })

  mouseActionTables.push({
    name: "click-all",
    rule: (e) => {
      return true
    },
    action: (e) => {
      if (isMacroRecording) {
        if (isTrackingTime) {
          let delta = e.time - lastActionTimeStamp
          if (delta > 0.05 * 1e8) {
            macroRecordedSequence.push({
              type: "delay",
              time: delta
            })
          }
          lastActionTimeStamp = e.time
        }
        macroRecordedSequence.push(e)
      }
    }
  })

  if (options.includes("delay")) {
    isTrackingTime = true
    lastActionTimeStamp = Date.now() * 100
  }
}

export const registerUioEvent = (assistWindow, event) => {
  // Notes: only one Uio event is handled at a time
  //        if there are multiple events, they are queued

  // 1. keyWait:
  //    - wait for a key press event for target keys
  //    - return the key pressed

  // 2. osRecord:
  //    - Shift + Shift: start recording
  //    - Command + Command: stop recording
  //    - all user-defined hotkeys are NOT disabled 

  if (event.type == "macroRecord") {
    if (isMacroRecording) {
      assistWindow.webContents.send('assist-win-push', {
        type: "user-notify",
        title: 'WARNING: macro recording!',
        content: 'Please finish the current recording first.',
        timeout: 15
      })
      return

    } else {
      assistWindow.webContents.send('assist-win-push', {
        type: "user-notify",
        title: "Macro recorder ready!",
        content: "Press \"Shift+Shift\" to start\n \"Command+Command\" to stop\n\nThis window will disappear when you start.",
      })

      // Wait for start key (Shift + Shift)
      keyboardActionTable.push({
        name: "key-shift-shift",
        source: "console.appMain",
        rule: (e) => {
          return isConsecutiveKeys(UiohookKey.Shift)
        },
        action: (e) => {
          // console.log("@@", "start recording macro")
          if (isMacroRecording) {
            // Clear recorded sequence and restart
            shell.beep()
            macroRecordedSequence = []

          } else {
            mouseActionTables.splice(0, mouseActionTables.length)
            assistWindow.minimize()

            // load MAT and start recording
            macroRecordUpdateMAT(event.options)
            isMacroRecording = true
          }
        }
      })

      // Wait for stop key (Command + Command)
      keyboardActionTable.push({
        name: "key-command-command",
        source: "console.appMain",
        rule: (e) => {
          return isConsecutiveKeys(UiohookKey.Meta)
        }
        ,
        action: (e) => {
          console.log("@@", "stop recording macro")
          isMacroRecording = false
          assistWindow.restore()
          shell.beep()

          // clear and reset MAT
          keyboardActionTable.splice(0, keyboardActionTable.length)
          mouseActionTables.splice(0, mouseActionTables.length)
          assistWindowMouseWatch(assistWindow)

          // send recorded sequence back to requestor
          let seq = parseSequence(macroRecordedSequence)
          // console.log("@@@", macroRecordedSequence)
          event.callback(seq)
        }
      })
    }

  } else if (event.type == "keyWait") {
    // When macro recording is on, queue the event
    if (isMacroRecording) {
      ioEventQueue.push(event)

    } else {
      keyWaitUpdateMAT(event)
    }

  } else if (event.type == "hotkeyWait") {
    // When macro recording is on, queue the event
    if (isMacroRecording) {
      ioEventQueue.push(event)

    } else {
      hotkeyRegisterUpdateMAT(event)
    }

  } else if (event.type == "hotkeyRemove") {
    // console.log("@@ remove Hotkey", event)
    keyboardActionTable = keyboardActionTable.filter((item) => {
      return item.name != `hotkey-${event.taskId}`
    })
  }
}

const getActiveWindowClickPos = async (e) => {
  let options = {}
  let win = await activeWindow(options)
  if (win == undefined) {
    return {
      window: null,
      x: e.x,
      y: e.y,
    }
  } else {
    return {
      window: win.owner.name,
      x: e.x - win.bounds.x,
      y: e.y - win.bounds.y,
    }
  }
};

export const uioStop = async () => {
  uIOhook.stop()
}

export const systemHookStart = async (hotkeyTable) => {
  ipcMain.on('io-hook-request', (event, data) => {
    const taskId = data.uuid

    const { type } = data.value
    if (type === 'keyWait') {
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
      // Notification

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

}