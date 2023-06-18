## CHANGE LOG

## 23-06-18
- Fix pyinstaller multiprocessing issue: https://stackoverflow.com/q/33405338
- RM debug interface for each task. Move it to appHome/background.log
- Fix the issue in app to make it quit if no active connections in 15 seconds

## 23-06-17
- Fix background app stuck issue (and not showing popup windows) when startup
- Fix python UTF8 encoding issue
- Auto-downloading unit test cases
- Fix the history indexing issue. It causes flushing errors.
- Fix the `setAttribute` issue. Likely to be caused by the module references (i.e., newAppWindow)?

```js
Uncaught (in promise) DOMException: Failed to execute 'setAttribute' on 'Element': '0' is not a valid attribute name.
```

## 23-06-16
- Fix the LOAD ERROR for assist window: https://github.com/electron/electron/issues/17526

```js
Error: ERR_ABORTED (-3) loading 'http://localhost:8080/#/assist'
    at rejectAndCleanup (node:electron/js2c/browser_init:161:7647)
    at EventEmitter.navigationListener (node:electron/js2c/browser_init:161:7953)
    at EventEmitter.emit (node:events:527:28) {
  errno: -3,
  code: 'ERR_ABORTED',
  url: 'http://localhost:8080/#/assist'
}
```

- Fix `__KEY_PRESSED__` not cleared after task is cancelled

## 23-06-15
- Update db.write API to support batch filtering
- Adjust the interactive array UI. Put hidden text in centric position

## 23-06-12
- App screen time recorder plugin
- French vocabulary learning plugin

## 23-06-10
- Customize select component (to make it copyable)
- Add dummy placeholder images if carousel has less than 3 images
- Adjust the style of checkbox texts

## 23-06-09
- Support multiple event watching in a single task
- Tested database API support (write and query CSV)
- Tested `__KEY_PRESSED__` event with keyboard tracking task 

## 2023-06-02
- App list refresher after downloading apps

## 2023-05-31
- Update home page: use CSP style to connect WSS server
- Update home page: use wrapper function to pass events to UIO hook or assist window
- Update cleanup: removed unnecessary IPC hooks in main process
- Update bug fix: wrong hotkey is triggered when double pressed Meta
- Update iohook: change `hotkeyRemove` to `cleanupTask`
- Update API: use `event.on` to replace `user.input(area)`

### 2023-05-29
- Vocabulary learning app (using pure CSV + local SQLite database for tracing)
- Fix issues in RTE libauto
- Prepare for public release

### 2023-05-22
- Add popup window session support. Users can have multiple inputs windows running in parallel
- Fix the codec issue: https://github.com/danalite/autool/issues/5
- Remove the selected apps part. Use download links on website instead
- Rearrange the task scheduling panel

### 2023-05-18
- Make main window hide when inactive (active by long pressing Meta)
- Make UIO hook more modular
- Remove task runner from tray menu
- Move license checking to backend
- Move window watcher to backend

### 2023-05-12
- Remover hardcoding of task running button in chat session
- Interactive chat: post process text into elements
- Interactive chat: click to copy conversation
- Fix `node-gpy` issue when building on windows

```bash
gyp: C:\\Users\\runneradmin\\AppData\\Local\\node-gyp\\Cache\\16.20.0\\common.gypi not found (cwd: D:\\a\\autool\\autool\\node_modules\\iconv) while reading includes of binding.gyp while trying to load binding.gyp
gyp ERR! configure error 
gyp ERR! stack Error: `gyp` failed with exit code: 1
gyp ERR! stack     at ChildProcess.onCpExit (C:\\Users\\runneradmin\\AppData\\Local\\Yarn\\Data\\global\\node_modules\\node-gyp\\lib\\configure.js:325:16)
gyp ERR! stack     at ChildProcess.emit (node:events:513:28)
```

### 2023-05-11
- Fix dynamic input type
- Stream return from backend server

### 2023-05-08
- Refined the dynamic API spec
- Use realtime thumbnail for searching images

### 2023-04-28
- Implement a chat window
- Feature preview: long press Meta to awake assistant
- Add a new environment variable `PLATFORM` 

### 2023-04-22
- Add initial windows location for pos=0,0

### 2023-04-21
- Organize the script-examples
- Hide main window when close button is clicked
- Fixed selenium issue: https://github.com/wkeeling/selenium-wire/issues/402#issuecomment-1059038086

### 2023-04-20 
- Add todo app example
- Add password manager example

### 2023-04-19
- Add new env variable `PWD` to specify the app path
- Remove `Activate Canvas` button in menu
- Put selected tasks into tray menu (and run action)

### 2023-04-18
- Add dynamic input types with default values (record add/sub)

### 2023-04-16
- Fixed the setAttribute issue
- Fixed the Open DEV tool loading issue

### 2023-04-15
- Updated README with new GIF demos
- Updated README with tiny link pointing to community apps

### 2023-04-14
- Add an option to clear existing annotations in `window.annotate`
- Add SAM support to canvas

### 2023-04-12
- Support array and dict in window.annotation
- Support mask in window.annotation

### 2023-04-10
- Update renderTitle (user ghost buttons)
- Remove the sort-button in canvas/bookmarks
- Changed workflow (only trigger on release push)
- Add option in menu to activate/deactivate the overlay
- Make canvas overlay width configurable
- Redesign task manager UI page

### 2023-04-09
- Fixed the collapsed window width bug
- Message when script downloading is started
- Lazy import desktopCapturer from electron