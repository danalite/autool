<p align="center">
  <img src="./demos/banner.png" height="95" title="main">
</p>

[Documents](https://danalite.github.io/autool/) | [APIs](https://danalite.github.io/autool/) | [简体中文](docs/README-zh.md)

[![Build Status](https://img.shields.io/github/actions/workflow/status/danalite/autool/main.yaml?style=flat-square)](https://github.com/danalite/autool/actions)
[![Downloads](https://img.shields.io/github/downloads/danalite/autool/total?style=flat-square&logo=github)](https://github.com/danalite/autool/releases)
[![Community](https://img.shields.io/badge/Community-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/P3t2SvQaZp)

AuTool is a scripting/glue language that brings the power of Tampermonkey to your desktop environment. AuTool was initially developed to achieve three goals: enable AutoHotkey to support event-driven programming, enhance user interactivity, and ensure its platform agnosticism. It can be used to:

- Automate repetitive tasks, e.g., keyboard, mouse, or network requests
- Build pretty GUI for any command-line apps with ease
- Combine software components to create your custom workflow

## Install AuTool
- Download and install AuTool app from the following links:

[![WinExe](https://img.shields.io/badge/Win.exe-download-green?logo=windows&style=flat-square)](https://github.com/danalite/autool/releases)
[![MacOS](https://img.shields.io/badge/MacOS.dmg-download-green?logo=apple&style=flat-square)](https://github.com/danalite/autool/releases)
[![Ubuntu](https://img.shields.io/badge/Ubuntu.deb-download-green?logo=ubuntu&style=flat-square)](https://github.com/danalite/autool/releases)

- Once you have installed AuTool, you can download your desired scripts from [our website](https://danalite.github.io/autool/). These scripts will then appear in the AuTool task manager, where they can be executed with a single click.

<p align="center">
  <img src="./demos/example.png" width="100%" title="AuTool">
</p>

### Usage
- **Install scripts**: you can download an app (i.e., a collection of scripts) by clicking the "+" icon and entering a GitHub folder link. For example, you can enter https://github.com/danalite/autool-script-examples/tree/master/danalite/MacOS-Display.

- **Taskbar**: you can minimize the window into a taskbar by clicking on the rabbit icon at the top. The taskbar will display all checked scripts, and you can run any script by clicking on it.

- **User Dialog**: AuTool simplifies the creation of visually attractive GUIs that interact with end-users. For example, its GUI in the following example follows the system notification style and is generated from a user-provided JSON description. Example script source code: [link](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipbo
ard-Manager)

<p align="center">
  <img src="./demos/demo-daily-vocabulary.gif" width="95%" title="FileSearch">
</p>

## Example AuTool Scripts
[![AuToolExample](https://img.shields.io/badge/AuTool--Examples-download-green?logo=github&style=flat-square)](https://danalite.github.io/autool/docs/basics/apps-macos-runner)

Here is a few AuTool example scripts to get you started and get a taste on what AuTool can help you with. The scripts can be downloaded by clicking the icon above.

- [Quick search and open files](https://github.com/danalite/autool-script-examples/blob/master/danalite/Mini-Tools/File-Searcher.yaml): enter keywords to search and open files or folders.
- [Password Manager](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Password-Manager): generate a new password or copy existing passwords to clipboard.
- [Format Converter](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): convert MOVs into GIFs or other formats.
- [Amazon Deals](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/): Gather hot deals from cloud monitor and keep you informed. 
- [Vocabulary flashcards](https://github.com/danalite/autool-script-examples/tree/master/danalite/Mini-Tools/Clipboard-Manager): flashcards with example and audio. 

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