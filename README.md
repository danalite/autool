<p align="center">
  <img src="imgs/banner.png" height="90" title="autool">
</p>

[中文README](README-zh.md)

# AuTool Scripts
AuTool is a programming framework to automate your desktop tasks. 

Similar to a desktop version of Greasy Monkey, AuTool can make many things much easier. AuTool scripting language has a rich set of APIs to help you interact the digital world. Check out our [showcases](#showcases) to see what you can do with AuTool.

## Installation
- Windows 8/10/11 (To be released soon)
- [MacOS 10.15+ v0.0.1-alpha](https://github.com/danalites/autool/releases/tag/v0.01)

### Build from Source
- The following instructions are for building from source.
  
```bash
git clone https://github.com/danalites/autool.git
cd autool

# Install dependencies and build 
yarn run init

# Package python deps and electron app
yarn run build-py
yarn run electron:build
```

## Develop an AuTool Script
- AuTool scripts are written in YAML format. You can configure the script start-time, hotkey, or executor types under `configs` key, and specify the actions under `actions` key.

- AuTool provides a set of built-in APIs in form of `${TYPE}.${ACTION}(...${ARGS})`. For example, `os.shell` is a built-in API that can execute shell commands.

```yaml
task: switch-when-window-switched
configs:
  - hotkey: ~
  - autostart: true

actions:
  # Listen for window switch event
  - event.on(__WIN_ACTIVE_CHANGED__) => $win:

      # Switch my input source to English if the window is Visual Studio Code
      - cmd.if( {{ $win.title }} == 'Visual Studio Code' ):
          - os.shell(InputSourceSelector select com.apple.keylayout.US)
```

## Documents
- [Examples](https://danalites.github.io/autoo/docs/basics/apps-macos-display)
- API Reference [Under construction]

## Showcases
<details>
  <summary>Example 1</summary>
  
  - This is the content that will be hidden until the user clicks on the summary element.

</details>

<details>
  <summary>Example 2</summary>  
  - This is the content that will be hidden until the user clicks on the summary element.

</details>

## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
AuTool is released under GPL v3.0 license. This license allows people to use, copy, distribute, and modify software, but only if they agree to distribute any modifications they make under the same license and not use the software for commercial purposes. See [LICENSE](LICENSE) for more details.

All the rights are reserved by DanaLites PTE LTD (Singapore).