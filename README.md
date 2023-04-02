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

*Mini-Tools* is a bundle of AuTool scripts with the following functions. You can download the bundle from the link above after opening AuTool app.

- [x] [File Search](https://github.com/danalite/autool-script-examples/blob/master/danalite/Mini-Tools/File-Searcher.yaml): to search files in target folder. The searched results can be fed into downstream scripts (e.g., open the files, or upload to cloud storage)

![File Search](./imgs/demo-file-searcher.gif)

- [ ] [Clipboard Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): 

- [x] [Password Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Password-Manager): a GUI wrapper of [pass](https://www.passwordstore.org/) to generate passwords, copy passwords to clipboard, and upload passwords to cloud storage.

- [x] [Format Converter](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): a GUI wrapper of `ffmpeg` that helps you convert MOVs to GIFs with selected frame rate and quality (you can modify the script to support other formats)

- [ ] Amazon Deals: Gather hot deals from cloud deal monitor and keep you informed (you can filter based on discount rates and keywords as you need)

- [x] [Daily Vocabulary](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): memorize new words with [AnkiConnect](https://foosoft.net/projects/anki-connect/), chatGPT (to generate sentence/dialog from new words), and TTS (to generate audios)

- [x] [Watch Tiktok videos](): to watch random videos from Tiktok. You can also specify the keywords to filter the videos.

- [ ] Personal finance with Beancount: add expense or incomes in popup window, and save to local Beancount file. It can be visualized with [Fava](https://beancount.github.io/fava/).

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

## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
**FOR PERSONAL USAGE ONLY**. AuTool is released under [GPL v3.0 license](LICENSE). For any commercial use, please contact support@autool.site. The intellectual property of this product is protected by patents, and any unauthorized use will be subject to legal liability. All the rights are reserved by DanaLite Tech LTD (SG).