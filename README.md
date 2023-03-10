<p align="center">
  <img src="imgs/banner.png" height="90" title="main">
</p>

**[NOTE]: We will release the package on Github soon. Please stay tuned.** 中文版文档很快也会发布，敬请期待。

# AuTool Scripts
AuTool is a programming framework to automate your desktop tasks. 

To put it simple, it is like a desktop version of Greasy Monkey, which allows you to do many things with ease. AuTool provides a scripting language with a rich set of APIs to interact with your desktop. Check out our [showcases](#showcases) to see what you can do with AuTool.

## Installation
- Windows TBA
- MacOS TBA

### Build from Source
The following instructions are for building from source.

```bash
git clone https://github.com/danalites/autoo.git
cd autoo

# Install dependencies and build 
yarn run init

# Package python deps and electron app
yarn run build-py
yarn run electron:build
```

## Usage
This section shows how APIs are used in AuTool scripts. The following example shows how to create a task that clicks a button inside a window (if the window is live; does not have to be active window).

```yaml
task: click-background-window
configs:
  - hotkey: Ctrl+Shift+Q 

actions:
  # Most basic action: locate and click
  - window.is(Visual Studio Code):
    - window.locate({{ $IMAGE_PATH... }}) => $pos
    - mouse.click($pos)
    - key.type(Hello World!!!)

    # This will incur a notification popup on the screen
    # Title is 'Hello World!!!' and content is 'Enjoy
    - user.notify(Hello World!!!, Enjoy)
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
AuTool is released under GPL v3.0 license. This license allows people to use, copy, distribute, and modify software, but only if they agree to distribute any modifications they make under the same license and not use the software for commercial purposes. All the rights are reserved by DanaLites LTD (Singapore).

See [LICENSE](LICENSE) for more details.