<p align="center">
  <img src="./demos/banner.png" height="95" title="main">
</p>

[Documents](https://danalite.github.io/autool/) | [APIs](https://danalite.github.io/autool/) | [简体中文](docs/README-zh.md)

[![Build Status](https://img.shields.io/github/actions/workflow/status/danalite/autool/main.yaml?style=flat-square)](https://github.com/danalite/autool/actions)
[![Downloads](https://img.shields.io/github/downloads/danalite/autool/total?style=flat-square&logo=github)](https://github.com/danalite/autool/releases)
[![Community](https://img.shields.io/badge/Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/P3t2SvQaZp)

AuTool is a scripting/glue language that brings the power of Tampermonkey to your desktop environment. It can be used to:
- Automate repetitive tasks, e.g., keyboard, mouse, or network requests
- Build pretty GUI for any command-line apps with ease
- Combine software components to create custom workflow

## Install AuTool
- Download and install AuTool app from the following links:

[![WinExe](https://img.shields.io/badge/Win.exe-download-green?logo=windows&style=flat-square)](https://github.com/danalite/autool/releases)
[![MacOS](https://img.shields.io/badge/MacOS.dmg-download-green?logo=apple&style=flat-square)](https://github.com/danalite/autool/releases)
[![Ubuntu](https://img.shields.io/badge/Ubuntu.deb-download-green?logo=ubuntu&style=flat-square)](https://github.com/danalite/autool/releases)

- After installing the AuTool, download your scripts of interests from [our website](https://danalite.github.io/autool/). The downloaded scripts are shown in AuTool task manager, which is ready to run by click.

<p align="center">
  <img src="./demos/example.png" width="100%" title="AuTool">
</p>

- Note: you can click on the rabbit icon on the top to collapse the window into a taskbar. All checked scripts are shown in the taskbar, and you can click to run the script.

## Example AuTool Scripts
[![AuToolExample](https://img.shields.io/badge/AuTool--Examples-download-green?logo=github&style=flat-square)](https://danalite.github.io/autool/docs/basics/apps-macos-runner)

Here is a few AuTool example scripts to get you started and get a taste on what AuTool can help you with. The scripts can be downloaded by clicking the icon above.

- [x] [File Search](https://github.com/danalite/autool-script-examples/blob/master/danalite/Mini-Tools/File-Searcher.yaml): enter keywords to search and open files or folders.

<p align="center">
  <img src="./demos/demo-file-searcher.gif" width="95%" title="FileSearch">
</p>

- [x] [Password Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Password-Manager): generate a new password or copy existing passwords to clipboard. Powered by [*`pass`*](https://www.passwordstore.org/).

<p align="center">
  <img src="./demos/demo-password-manager.gif" width="95%" title="PasswordManager">
</p>

- [x] [Format Converter](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): convert MOVs into GIFs. Powered by [*`ffmpeg`*](https://ffmpeg.org/).

<p align="center">
  <img src="./demos/demo-format-converter.gif" width="95%" title="FormatConverter">
</p>

- [x] [Amazon Deals](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/): Gather hot deals from cloud monitor and keep you informed. 

<p align="center">
  <img src="./demos/demo-amazon-deals.gif" width="95%" title="AmazonDeals">
</p>

- [x] [Daily Vocabulary](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): flashcards with example and audio. Powered by [*`AnkiConnect`*](https://foosoft.net/projects/anki-connect/) and ChatGPT. 

<p align="center">
  <img src="./demos/demo-daily-vocabulary.gif" width="95%" title="DailyVocabulary">
</p>

## Write Your Own Scripts
- Each AuTool script is a YAML text file which contains a sequence of actions. Here is a simple AuTool script example to run a shell command when the clipboard changes:

```yaml
task: clipboard-monitor  # task name
configs:
  - hotkey: ~  # no hotkey bind to this task
  - autostart: true  # the task is started on startup

actions:
  # event is triggered if any clipboard content updates
  - event.on(__CLIPBOARD_CHANGED__) => $e:
      - cmd.if( {{ $e.type == "image" }} ):  # if it is an image
          - os.shell(xclip -selection clipboard -t image/png -o > /tmp/clipboard.png)
```

## Contributing
Contributions are welcome! To contribute, please fork this repository, create a branch for your changes, and submit a pull request. Before submitting a pull request, please make sure that your changes are fully tested and that they adhere to the contributing guidelines.

## License
**FOR PERSONAL USAGE ONLY**. AuTool is licensed under [GPL v3.0 license](LICENSE). Please contact support@autool.site for any commercial use. The intellectual property of this product is protected by patents, and any unauthorized use will be subject to legal liability. All the rights are reserved by DanaLite Tech LTD (SG).

## Acknowledgement
We learned a lot from the following projects when building AuTool:
- [Task](https://taskfile.dev/): task runner and build tool programmed with YAML
- [Zapier](https://zapier.com): workflow automation that glues software components together
- [AutoHotkey](https://www.autohotkey.com/): a DSL that automates repetitive processes on Windows
- [GNOME Zenity](https://github.com/GNOME/zenity): a tool to create GUI for CLI apps on Linux