## What?
- 类似IFTTT的 效率工具, 用来 streamline / automate 繁琐的UI操作
- Example: [抓取RSS信息推送到手机](https://huginn.cn/blog/huginn/huginn-%e8%87%aa%e5%ae%9a%e4%b9%89%e6%8a%93%e5%8f%96%e6%8e%a8%e9%80%81smzdm%e5%92%8cv2ex%e7%9a%84%e4%bc%98%e6%83%a0%e4%bf%a1%e6%81%af)， 监听聊天群消息, [自动切换输入法](https://inputsource.pro/zh-CN)， [快速调整窗口layout](https://apps.apple.com/app/id441258766)， [抢票](https://whop.com/charts/top_rentals/)


## Why?
- 1. 流程自动话需要大量customization 然而现有的产品追求low-code，很难实现复杂需求 （fine-grained programmable control）

- 2. 现有产品很贵；同质化严重；编程不友好；不支持云部署；不支持多平台；不支持多用户协作；追求插件大而全，重复造轮子，而且还造不好；占用系统资源多

## Why ours？
- 开源免费；跨平台；可读性好，方便配置
- 事件驱动编程；async 执行引擎，节省系统资源；轻量级，高并发
- 鼓励插件docker化，方便代码复用，避免重复造轮子

## How it looks like?
- Compose automation script in YAML

```yaml
--- 
   task: auto-switch-input-method

   configs:
    options: ['autostart']
    hotkey: Ctrl+L

   actions:
     ## 在窗口切换时触发 hook 事件
     - event.on(__ACTIVE_WINDOW_CHANGED) => $win:
       - cmd.if({{ $win in ['WeChat'] }}):
         - os.run(InputSourceSelector select com.apple.inputmethod.SCIM.ITABC)

     # 推送消息到手机
     - user.notify({{ {'to':$env[PHONE],'title':'...'} }})

```

- Execute the script inside the app

<p align="center">
  <img src="docs/images/mainApp.png" width="350" title="hover text">
  <img src="docs/images/mainSch.png" width="350" alt="accessibility text">
</p>


## Competitors
- Low-code: Microsoft Power Automate, UiPath, UiBot
- Web: uTools, Zapier, n8n, IFTTT，HugInn
- DSL: AppleScript, TagUI, VBA, 按键精灵, AutoHotKey
- Mobile: Android Tasker, 
