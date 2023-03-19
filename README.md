<p align="center">
  <img src="imgs/banner.png" height="90" title="autool">
  [中文](docs/README-zh.md)
</p>

# AuTool Scripts
AuTool is a programming framework to automate your desktop tasks; it is designed to bring the power of Greasy Monkey to your desktop environment.

AuTool provides a rich set of API intrinsics to help you interact the OS and network, and automate your workflow as needed. Check out our [showcases](#showcases) to see what you can do with AuTool.

## Installation
**Note**: AuTool is still in alpha stage. We are working to refine the functions. Please stay tuned for the updates.

- [Windows 10/11 v0.0.1-alpha](https://github.com/danalites/autool/releases/tag/v0.01)
- [MacOS 10.15+ v0.0.1-alpha](https://github.com/danalites/autool/releases/tag/v0.01)

<details>
  <summary>Build from Source</summary>
  
```bash
git clone https://github.com/danalites/autool.git
cd autool

# Install dependencies and build 
yarn run init

# Package python deps and electron app
yarn run build-py
yarn run electron:build
```

</details>


## Usage
- Install the free apps from our document page: [https://autool.readthedocs.io/en/latest/](https://autool.readthedocs.io/en/latest/)

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
- [Examples](https://danalites.github.io/autool/docs/basics/apps-macos-display)

- API Reference [Under construction]


## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
AuTool is released under GPL v3.0 license. This license allows people to use, copy, distribute, and modify software, but only if they agree to distribute any modifications they make under the same license and not use the software for commercial purposes. See [LICENSE](LICENSE) for more details.

**FOR PERSONAL USAGE ONLY. CONTACT**. All the rights are reserved by DanaLites PTE LTD (Singapore).