<p align="center">
  <img src="../demos/banner.png" height="90" title="main">
</p>

## AuTool 是什么？
- AuTool 是一款用于桌面自动化的编程框架。

- 类似于桌面端的油猴脚本，可以用来完成各种各样的自动化任务。AuTool 提供了一套丰富的内置API，可以让你轻松地控制你的桌面。你可以在[展示案例](#showcases)看到AuTool可以做什么。


## Getting Started
- 下面是一个AuTool插件的例子，介绍如何利用AuTool的内置API在YAML中进行控制流操作。这个例子展示如何使用在AuTool使用事件驱动编程，它会在当窗口切换时，自动帮你切换输入法。

```yaml
task: switch-when-window-switched
configs:
  - hotkey: ~
  - autostart: true

actions:
  # 监听窗口切换时间
  - event.on(__WIN_ACTIVE_CHANGED__) => $win:

      # 查看窗口标题，如果是Visual Studio Code，切换输入法为英文
      - cmd.if( {{ $win.title }} == 'Visual Studio Code' ):
          - os.shell(InputSourceSelector select com.apple.keylayout.US)
```


## 展示案例
- 桌面端: 监听微信聊天群消息; [根据App自动切换输入法](https://inputsource.pro/zh-CN); [快速调整窗口布局](https://apps.apple.com/app/id441258766); [录制视频转GIF](); [监听订单邮件，自动记账](); [录制/重复桌面操作](); [给手机推送提醒](); [桌面应用启动器](); [文件自动备份到图床]()
  
- 网页端: [筛选推送RSS信息](https://huginn.cn/blog/huginn/huginn-%e8%87%aa%e5%ae%9a%e4%b9%89%e6%8a%93%e5%8f%96%e6%8e%a8%e9%80%81smzdm%e5%92%8cv2ex%e7%9a%84%e4%bc%98%e6%83%a0%e4%bf%a1%e6%81%af); [抢票抢打折单品](https://whop.com/charts/top_rentals/); [录制/重复网页操作](https://www.tango.us/pricing), [自动解决CAPTCHA](), [用代理浏览网页](); [自动签到](); 

- 移动端 iOS/Android: [接受消息推送](https://github.com/Finb/Bark); 调度云端任务; 转发OTP验证码到桌面端完成验证
