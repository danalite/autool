<p align="center">
  <img src="docs/images/cover.png" height="90" title="main">
</p>

## What is AuTool?
- A cross-platform efficiency tool to streamline and automate your daily tasks.

## What can you do with it?
### Desktop (MacOS, Windows)
- Monitor chat groups non-intrusively; 
- [Switch keyboard input according to app in use](https://inputsource.pro/zh-CN); 
- [Arrange windows in one click](https://apps.apple.com/app/id441258766); 
- [Convert a video to GIF](); 
- [Monitor order emails for bookkeeping](); 
- [Keyboard and mouse action record and replay](); 
- [Send a push notification to iPhone](); 
- [A super lightweight app launcher](); 
- [Upload your files to cloud by drag]()
  
### Web
- [Filter and push RSS subscription](https://huginn.cn/blog/huginn/huginn-%e8%87%aa%e5%ae%9a%e4%b9%89%e6%8a%93%e5%8f%96%e6%8e%a8%e9%80%81smzdm%e5%92%8cv2ex%e7%9a%84%e4%bc%98%e6%83%a0%e4%bf%a1%e6%81%af); 
- [Buy cheap tickets or commodities](https://whop.com/charts/top_rentals/); 
- [Record and replay web actions](https://www.tango.us/pricing), 
- [solve CAPTCHA](), 
- [Use proxy to open website](); 
- [Claim daily sign-in rewards](); 

### Mobile side (iOS, Android)
- [Get reminders sent from desktop or server](https://github.com/Finb/Bark)
- Schedule tasks running on desktop or server; 
- Forward OTP code from phone to desktop or server

## Getting Started

```yaml
task: 监视网页更新

configs:
  # 注册热键, 任务推送到服务器执行
  options: ['remote']
  start-time: 

actions:
  # 打开网页
  - web.open(...)
  - web.find(XPATH...) => $element

  # 从本地数据库获取上一次更新日期
  - db.read(LAST_UPDATED) => $prev

  # 如果不一样，给我的手机发一个推送
  - cmd.if( {{ $element != $prev }} ):
    - user.notify({ {'to':$env[phone],'title':'更新啦！'} })
    - db.write(LAST_UPDATED, $element)
```

## Why?
- 流程自动化需要大量自定义过程，然而现有的大部分产品追求low-code, 同质化严重，缺少细粒度的流程控制，很难实现复杂需求

- 现有产品本身很贵，附带插件也贵；编程不友好，开发成本很高；不支持云部署；多平台支持差；不支持多用户协作，不支持多任务协同；占用系统资源多；追求插件大而全，重复造轮子，而且还造不好；缺少，大量伪需求

## Why AuTool？
- Cross-platform, free and open-source
- 基于yaml编程，API可读性更好，方便配置
- 多设备协同，支持手机端/PC/Mac；跨用户推送消息，执行任务
- 事件驱动编程；async 执行引擎，节省系统资源；轻量级，高并发
- 鼓励插件独立化，服务化，docker化；方便原始代码复用，避免重复造轮子

## Alternatives 其他类似产品
- Low-code: Microsoft Power Automate, OSX automator, UiPath, UiBot
- Web-based: uTools, Zapier, n8n, IFTTT，HugInn
- App launcher: Alfred, LaunchBar, Spotlight, Raycast
- DSL: AppleScript, TagUI, Anjian, AutoHotKey, Keyboard Maestro, Hammerspoon
- Mobile: Android Tasker, iOS shortcut