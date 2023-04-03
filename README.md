<p align="center">
  <img src="./imgs/banner.png" height="90" title="main">
</p>

[Documents](https://danalite.github.io/autool/) | [APIs](https://danalite.github.io/autool/) | [简体中文](docs/README-zh.md)

[![Build Status](https://img.shields.io/github/actions/workflow/status/danalite/autool/main.yaml?style=flat-square)](https://github.com/danalite/autool/actions)
[![Downloads](https://img.shields.io/github/downloads/danalite/autool/total?style=flat-square&logo=github)](https://github.com/danalite/autool/releases)
[![Community](https://img.shields.io/badge/Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/P3t2SvQaZp)

AuTool is a scripting language that brings the power of Greasy Monkey to your desktop environment. It provides a rich set of APIs to help you interact with operating system and network, which can be used to automate your workflow with ease. 

## Install AuTool
- Download and install AuTool app from the following links:

[![WinExe](https://img.shields.io/badge/Win.exe-download-green?logo=windows&style=flat-square)](https://github.com/danalite/autool/releases)
[![MacOS](https://img.shields.io/badge/MacOS.dmg-download-green?logo=apple&style=flat-square)](https://github.com/danalite/autool/releases)
[![Ubuntu](https://img.shields.io/badge/Ubuntu.deb-download-green?logo=ubuntu&style=flat-square)](https://github.com/danalite/autool/releases)

- Install the AuTool app using link above, and you are ready to go! Install example scripts from [our website](https://danalite.github.io/autool/) to get started. You will then see the installed scripts in AuTool task manager, and you can click task to run.

<p align="center">
  <img src="./imgs/example.png" width="100%" title="AuTool">
</p>

## Example AuTool Scripts
[![Mini-Tools](https://img.shields.io/badge/Mini--Tools-download-green?logo=github&style=flat-square)](https://danalite.github.io/autool/docs/basics/apps-macos-runner)

We create a AuTool script bundle named *Mini-Tools* to get you started. You can download the bundle from the link above after opening AuTool app.

- [x] [File Search](https://github.com/danalite/autool-script-examples/blob/master/danalite/Mini-Tools/File-Searcher.yaml): Click the *File-Searcher* button to start the task. You will be promoted to enter the keywords to search in the popup window, and you can click the result to open the file. 

![File Search](./imgs/demo-file-searcher.gif)

- [x] [Password Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Password-Manager): this script is based on [*pass*](https://www.passwordstore.org/). After starting the task, you can choose to generate passwords, copy existing passwords to clipboard, or import passwords.

- [x] [Format Converter](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): this script is based on [*ffmpeg*](https://ffmpeg.org/). It prompts you to select MOV videos and convert them into GIFs for you. You can modify the script to support other formats.

- [x] [Amazon Deals](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/): Gather hot deals from cloud deal monitor and keep you informed. 

- [x] [Daily Vocabulary](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): a tiny script that prompts vocabulary refreshers to you at a scheduled time, based on [*AnkiConnect*](https://foosoft.net/projects/anki-connect/) and GPT4. 

![Daily Vocabulary](./imgs/demo-daily-vocabulary.gif)

- [x] [Watch Tiktok](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/) a tiny script that scrapes Tiktok videos from internet and plays them in a popup window. You can modify the script to support other video sites. 

![Watch Tiktok](./imgs/demo-watch-tiktok.gif)

- [ ] Personal finance with Beancount: add expense or incomes in popup window, and save to local Beancount file. It can be visualized with [Fava](https://beancount.github.io/fava/).

- [ ] [Clipboard Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): 


## Write Your Own Scripts
- Each AuTool script is a YAML text file which contains a sequence of actions. As followed is a simple AuTool script to run a shell command when the clipboard changes:

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

## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
**FOR PERSONAL USAGE ONLY**. AuTool is released under [GPL v3.0 license](LICENSE). For any commercial use, please contact support@autool.site. The intellectual property of this product is protected by patents, and any unauthorized use will be subject to legal liability. All the rights are reserved by DanaLite Tech LTD (SG).