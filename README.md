<img src="imgs/banner.png" height=""/> Scripting Language for Workflow Automation
==============================================
[Documentation](https://danalite.github.io/autool/) | [简体中文](docs/README-zh.md)

[![Build Status](https://img.shields.io/github/actions/workflow/status/danalite/autool/main.yaml?style=for-the-badge)](https://github.com/danalite/autool/actions)
[![Downloads](https://img.shields.io/github/downloads/danalite/autool/total?style=for-the-badge&logo=github)](https://github.com/danalite/autool/releases)
[![Community](https://img.shields.io/badge/Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/P3t2SvQaZp)

AuTool is a scripting language that brings the power of Greasy Monkey to your desktop environment; it provides a rich set of APIs to help you interact with your operating system and network, which can be used to automate your workflow with ease. Check out our [showcases](#showcases) to see what you can do with AuTool.

## Installation
**Note**: AuTool is still in alpha stage. We are working to refine the functions. Please stay tuned for the updates.

- [Windows 10/11 v0.0.1-alpha](https://github.com/danalite/autool/releases/tag/v0.01)
- [MacOS 10.15+ v0.0.1-alpha](https://github.com/danalite/autool/releases/tag/v0.01)

## Usage
- Install the free apps from our [example script page](https://danalite.github.io/autool/docs/basics/apps-macos-display/).
- AuTool searches for `autool-tasks.json` file under `$HOME/Desktop/apps` folder, and loads the tasks into the GUI window.

<p align="center">
  <img src="imgs/demo-loaded-apps.png" width="600" title="autool">
</p>

### Add Scripts
- Each AuTool script is a YAML text file. You can specify your own action sequence or configure the script start-time, hotkey, number of instances, etc.

- Here is a simple example to change keyboard when active window is changed. The APIs are in form of `${TYPE}.${ACTION}(...${ARGS}) => ${RETURN}`. E.g., `os.shell` is a built-in API that can execute shell commands and returns the output.

```yaml
task: switch-when-window-switched
configs:
  - hotkey: ~
  - autostart: true

actions:
  # Listen for window switch event
  - event.on(__WIN_ACTIVE_CHANGED__) => $win:

      # Switch keyboard to English 
      - cmd.if( {{ $win.title }} == 'Visual Studio Code' ):
          - os.shell(InputSourceSelector select com.apple.keylayout.US)
```

## Documents
- [Examples](https://danalite.github.io/autool/docs/basics/apps-macos-display)
- API Reference [Under construction]


## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
**FOR PERSONAL USAGE ONLY**. AuTool is released under [GPL v3.0 license](LICENSE). For any commercial use, please contact support@autool.site. The intellectual property of this product is protected by patents, and any unauthorized use will be subject to legal liability. All the rights are reserved by DanaLite Tech LTD (SG).