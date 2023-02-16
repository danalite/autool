<p align="center">
  <img src="docs/images/cover.png" height="90" title="main">
</p>

## What is AuTool?
- A programming framework that helps you build your own automation scripts easily
- Let scripts do trivial things, so you can focus on the important things

## What scripts can you build?
Here is a list of scripts that I built with AuTool for my daily routines. You can also build your own.

### Desktop
- [Track the activity time spent on apps]()
- [Switch keyboard language based on the app in use](https://inputsource.pro/); 
- [Arrange window layout on the screen](https://apps.apple.com/app/id441258766); 
- [Screen capture a video and convert to GIF](); 
- [Upload your files to cloud by drag]();
- [Push notifications to your phones](); 
- [Keyboard and mouse action record and replay](); 
  
### Web
- [Download source from web video player]();
- [Track emails for orders and spending](); 
- [Pop up a notification when a new post is published]();
- [Filter and push RSS subscription](https://huginn.cn/blog/huginn/huginn-%e8%87%aa%e5%ae%9a%e4%b9%89%e6%8a%93%e5%8f%96%e6%8e%a8%e9%80%81smzdm%e5%92%8cv2ex%e7%9a%84%e4%bc%98%e6%83%a0%e4%bf%a1%e6%81%af); 
- [Buy cheap tickets or commodities](https://whop.com/charts/top_rentals/); 
- [Record and replay web actions](https://www.tango.us/pricing), 
- [solve CAPTCHA](), 
- [Use proxy to open website](); 
- [Claim daily sign-in rewards](); 

### Mobile side
- [Push email verification code]()
- [Alert weather changes]()

## Getting Started
A simple AuTool script that pushes notification when it rains or snows

```yaml
task: daily-weather-alert

configs:
  # Task is proxied 
  options: ['remote']
  start-time: 

actions:
```

## Design Philosophy
- We trade off low-code for more automation flexibility by providing a yaml-embedded scripting language.

- AuTool is not a general purpose programming language, it's a DSL for automation. We don't aim to replace Python, JavaScript, Go, etc.

- AuTool script is **only used** to develop applets for small needs, or as glue code to integrate other apps. If you have complex requirements, use a professional app instead of AuTool script.

## Why AuTool？
- Free and open-source
- Cross platform; support macOS, Windows, Linux
- Yaml-based event-driven programming, easy to read and customize
- Async task execution engine, more lightweight and scalable
- Support local and remote task execution

## Inspired by
- Microsoft Power Automate, MacOS automator, UiPath, UiBot
- uTools, Zapier, n8n, IFTTT，HugInn, Quicker
- Alfred, LaunchBar, Spotlight, Raycast
- AppleScript, TagUI, Anjian, AutoHotKey, Keyboard Maestro, Hammerspoon
- Android Tasker, iOS shortcut