<p align="center">
  <img src="./demos/banner.png" height="95" title="main">
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

- After installing the AuTool, download scripts from [our website](https://danalite.github.io/autool/) to import the features. The downloaded scripts are shown in AuTool task manager, which is ready to run by click.

<p align="center">
  <img src="./demos/example.png" width="100%" title="AuTool">
</p>

## Example AuTool Scripts
[![Mini-Tools](https://img.shields.io/badge/Mini--Tools-download-green?logo=github&style=flat-square)](https://danalite.github.io/autool/docs/basics/apps-macos-runner)

We provide *Mini-Tools*, an AuTool script bundle as an example to get you started. It can be downloaded by clicking the icon above. *Mini-Tools* includes the following scripts:

- [x] [File Search](https://github.com/danalite/autool-script-examples/blob/master/danalite/Mini-Tools/File-Searcher.yaml): enter keywords to search and open files or folders.

<p align="center">
  <img src="./demos/demo-file-searcher.gif" width="95%" title="FileSearch">
</p>

- [x] [Password Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Password-Manager): generate a new password or copy existing passwords to clipboard (based on [*`pass`*](https://www.passwordstore.org/)).

<p align="center">
  <img src="./demos/demo-password-manager.gif" width="95%" title="PasswordManager">
</p>

- [x] [Format Converter](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): convert MOVs into GIFs (based on [*`ffmpeg`*](https://ffmpeg.org/)).

<p align="center">
  <img src="./demos/demo-format-converter.gif" width="95%" title="FormatConverter">
</p>

- [x] [Amazon Deals](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/): Gather hot deals from cloud monitor and keep you informed. 

<p align="center">
  <img src="./demos/demo-amazon-deals.gif" width="95%" title="AmazonDeals">
</p>

- [x] [Daily Vocabulary](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): flashcards with example and audio (based on [*`AnkiConnect`*](https://foosoft.net/projects/anki-connect/) and ChatGPT). 

<p align="center">
  <img src="./demos/demo-daily-vocabulary.gif" width="95%" title="DailyVocabulary">
</p>

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