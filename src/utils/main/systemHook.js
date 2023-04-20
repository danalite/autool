import {
  screen,
  globalShortcut,
  shell
} from 'electron'

import { getKeyByValue, parseSequence, uioEventEnum } from '@/utils/main/macroOpt';
import { uIOhook, UiohookKey } from 'uiohook-napi'
import { appConfig } from '@/utils/main/config'

const activeWindow = require('active-win');

// queue the incoming IO hook requests
let ioEventQueue = []
var isMacroRecording = false
var macroRecordedSequence = []

// A history window to record the last 10 key strokes
var keyStrokesWindow = []
var keyboardActionTable = []

var isTrackingTime = false
var lastActionTimeStamp = 0

var mouseActionTables = []
var isHelperWindowShown = false


export const uioStartup = (assistWindow) => {
  uIOhook.start()
  // assistWindowMouseWatch(assistWindow)

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

  // MAT actions to keyboard events
  let keyTargets = ['keyup', 'keydown']
  for (let i = 0; i < keyTargets.length; i++) {
    uIOhook.on(keyTargets[i], (e) => {

      // Key stroke history window
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

const registerMouseClickedUpdateMAT = (event) => {
  mouseActionTables.push({
    name: "click-select-mask",
    source: event.source,
    rule: (e) => {
      // console.log("mouse hover!!! ", e, lastActionTimeStamp)
      // check if the mouse is hovered and stayed on the target for more than 200ms
      if (lastActionTimeStamp == 0) {
        lastActionTimeStamp = e.time
      }
      let trigger = e.time - lastActionTimeStamp > 2 * 1e8
      lastActionTimeStamp = e.time
      return trigger
    },
    action: (e) => {
      // console.log("mouse hover!!! ", e.x, e.y)
      // get active window and send relative position
      activeWindow({}).then((win) => {
        if (!win) return
        if (event.targetWindow && win.owner.name != event.targetWindow) return

        // console.log("mouse hover ", win.owner.name, event.targetWindow)
        let relativeX = e.x - win.bounds.x
        let relativeY = e.y - win.bounds.y
        let isOutOfBound = relativeX < 0 || relativeY < 0 || relativeX > win.bounds.width || relativeY > win.bounds.height

        // console.log("mouse hover ", win, relativeX, relativeY)
        if (!isOutOfBound) {
          event.callback({
            type: "mouseClicked",
            mouseX: relativeX,
            mouseY: relativeY,
            x: win.bounds.x,
            y: win.bounds.y,
            windowOwner: win.owner.name,
            windowId: win.id,
            width: win.bounds.width,
            height: win.bounds.height
          })
        }
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
          lastActionTimeStamp = 0

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

  } else if (event.type == "mouseClicked") {
    registerMouseClickedUpdateMAT(event)

  } else {
    console.log("@@ Unhandled Uio event", event)
  }
}

export const uioStop = async () => {
  uIOhook.stop()
}
