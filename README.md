<p align="center">
  <img src="./imgs/banner.png" height="90" title="main">
</p>

AuTool Software Automation
==============================================
[Documentation](https://danalite.github.io/autool/) | [简体中文](docs/README-zh.md)

[![Build Status](https://img.shields.io/github/actions/workflow/status/danalite/autool/main.yaml?style=flat-square)](https://github.com/danalite/autool/actions)
[![Downloads](https://img.shields.io/github/downloads/danalite/autool/total?style=flat-square&logo=github)](https://github.com/danalite/autool/releases)
[![Community](https://img.shields.io/badge/Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/P3t2SvQaZp)

AuTool is a scripting language that brings the power of Greasy Monkey to your desktop environment. It provides a rich set of APIs to help you interact with operating system and network, which can be used to automate your workflow with ease. 

## Install
**Note**: AuTool is still in alpha stage. We are working to refine the functions. Please stay tuned for the updates.
- [Windows installer (portable)](https://github.com/danalite/autool/releases/tag/v0.01)
- [MacOS installer (DMG)](https://github.com/danalite/autool/releases/tag/v0.01)

## Usage
- Please install the AuTool app first. Then you can start to write your own scripts. 

## Features
TBA

## AuTool Scripts
- Each AuTool script/plugin is a YAML text file. You can specify your own action sequence in it. As followed is a simple AuTool script to change keyboard when active window is changed.

```yaml
task: clipboard-monitor
configs:
  - hotkey: ~
  - autostart: true

actions:
  - event.on(__OS_CLIPBOARD_CHANGED__) => $e:
      - cmd.if( {{ $e.type == "image" }} ):
          - os.shell(xclip -selection clipboard -t image/png -o > /tmp/clipboard.png)
```

## Documents
- [Examples](https://danalite.github.io/autool/docs/basics/apps-macos-display)
- API Reference [Under construction]

## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
**FOR PERSONAL USAGE ONLY**. AuTool is released under [GPL v3.0 license](LICENSE). For any commercial use, please contact support@autool.site. The intellectual property of this product is protected by patents, and any unauthorized use will be subject to legal liability. All the rights are reserved by DanaLite Tech LTD (SG).