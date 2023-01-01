## AuTool v.s. other RPA tools
- Minimalism: we are not making an all-purpose tool that can do anything. Instead, our tool aims to glue and chain different SaaS softwares together with minimal efforts.  

- Interactivity: different machines can interact with each other in a more natural way, e.g., your local desktop can send a message to your cellphone when a certain event happens, or your cellphone can tell the cloud server or your desktop to run a task.

## AuTool v.s. uTool
- A collection of simple web apps (e.g., doc lookup, query and render data from web APIs, etc.) and limited interaction with native OS (e.g., clipboard, file system, shell)

- Not capable of automating complex tasks, like macro recording, mouse/keyboard actions, background actions on particular windows, or remote task proxy

- Not capable of capturing interaction between SaaS softwares, e.g., collecting data from a web page and then fill the data in another app running on native OS

## UiPath, WinBot360
- More suitable for simple RPA tasks with a few functional blocks. The workflow would become much less readable and maintainable if the task is complex

## PyAutoGUI
- No multi-threading support; only one task can be executed at a time
- No background action support. it only operates on the foreground window

### Selenium, Playwright
- Fine-grained control over the browser

- Limited interactivity: cannot do action record/playback
  
- not able to handle captcha solving or OTP verification