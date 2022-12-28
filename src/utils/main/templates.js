
const macroRecordTemplate = `---
  task: example-of-automating-vpn-connect
  desc: 
    - launch openVPN from macOS panel, click connect, and close it
    - 'start-open-vpn' is the file name used to store recorded macros
    - (re-)start recording with Command+1 and press Command+2 when you finish
    - this example tracks key stokes, mouse clicks, mouse movements, and delay

  actions:
   - os.record(start-open-vpn, {{ {
      'start':'Command+1',
      'stop':'Command+2', 
      'mode':'mouse',
      'track':['key', 'click', 'move', 'delay']} }})
`

const macroMacosSplitWindowTemplate = `---
task: window-split-view
desc: 
   1. Split window to left or right tile of the screen.
   2. This is similar to Spectacle's "Left Half" and "Right Half" actions
   or https://github.com/rxhanson/Rectangle

inputs:
  app1: Chrome
  app2: Visual Studio Code

actions:
  - os.run(osascript -e 'activate app "{{$inputs[app2]}}"')
  - os.run(osascript -e 'activate app "{{$inputs[app1]}}"')
  
  # Key and mouse actions inside window.is are relative to the window
  - window.is($inputs[app1]):
     - mouse.move({{ (69,23) }})
     - cmd.sleep(1.5s)

     # Hover mouse and select "Tile Window to Left of Screen"
     - key.press(Down+Down+Enter)`


export const codingTemplates = (name) => {
    switch (name) {
      case 'macro-recording' :return macroRecordTemplate;
      default: return macroMacosSplitWindowTemplate;
    }
  }