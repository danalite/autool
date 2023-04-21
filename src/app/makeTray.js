import { app, Menu, nativeImage, Tray, shell, dialog } from "electron";
import { appConfig } from "@/utils/main/config";
import pkg from "../../package.json";

const path = require('path')
var selectedTasks = [];
const refreshSelectedTasks = () => {
  let apps = appConfig.get("apps");
  selectedTasks = [];

  for (let i = 0; i < apps.length; i++) {
    let app = apps[i];
    for (let j = 0; j < app.tasks.length; j++) {
      let task = app.tasks[j];

      if (task.shortcut) {
        selectedTasks.push(task);
      }
    }
  } 
}

const setupCheckedTasks = (mainWindow, icon) => {
  if (selectedTasks.length === 0) {
    return [{ type: "separator" }]
  } else {
    return [
      { type: "separator" },
      ...selectedTasks.map((task, index) => {
        return {
          label: `${index}. ` + task.relTaskPath.split(path.sep).slice(-1)[0],
          icon: icon,
          click: () => {
            mainWindow.webContents.send('to-main-win',
            { action: "run-task", tasks: [task] })
          },
        };
      }),
      { type: "separator"}
    ];
  }
}


// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  const appIcon = new Tray(icon)
  appIcon.setToolTip('AuTool')

  // https://www.electronjs.org/docs/latest/api/menu-item
  const buildAppMenu = () => {
    return  Menu.buildFromTemplate([
    {
      label: "Show Main",
      click() {
        mainWindow.show();
        mainWindow.focus();
      },
      accelerator: "CommandOrControl+E",
    },
    {
      label: "Show Canvas",
      type: "checkbox",
      click: () => {
        if (assistWindow.isVisible()) {
          assistWindow.hide();
        } else {
          assistWindow.show();
        }
      },
      checked: true,
    },
    {
      label: "Restart",
      click() {
        app.relaunch();
        app.quit();
      },
    },
    {
      label: "Exit",
      click() {
        app.quit();
      }
    },
    ...setupCheckedTasks(mainWindow, icon),
    {
      label: "Help",
      click: () => {
        process.nextTick(() => {
          shell.openExternal("https://github.com/danalite/autool/issues");
        });
      },
    },
    // {
    //   label: "About",
    //   click() {
    //     mainWindow.show();
    //     dialog.showMessageBox({
    //       title: "AuTool © DanaLite Ltd. 2023",
    //       message: "Software Platform for Workflows Automation and Digital Adoption",
    //       detail: `version: ${pkg.version}\n`,
    //     });
    //   },
    // },
  ]);
  }

  appIcon.on("click", () => {
    refreshSelectedTasks();
    appIcon.setContextMenu(buildAppMenu());
    appIcon.popUpContextMenu();
  });

  appIcon.setContextMenu(buildAppMenu());
}

