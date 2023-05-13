## CHANGE LOG

### 2023-05-12
- Remover hardcoding of task running button in chat session
- Interactive chat: post process text into elements
- Interactive chat: click to copy conversation
- Fix node-gpy issue when building on windows

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