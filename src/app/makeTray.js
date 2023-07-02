import { Menu, nativeImage, Tray, shell, dialog } from "electron";
import { appConfig } from "@/utils/main/config";

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  const appIcon = new Tray(icon)
  appIcon.setToolTip('AuTool')

  // https://www.electronjs.org/docs/latest/api/menu-item
  const buildAppMenu = () => {
    return Menu.buildFromTemplate([
      {
        label: "Main Window",
        type: "checkbox",
        checked: mainWindow.isVisible(),
        // icon: icon,
        click() {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: "Canvas",
        type: "checkbox",
        checked: assistWindow.isVisible(),
        // icon: icon,
        click: () => {
          if (assistWindow.isVisible()) {
            assistWindow.hide();
          } else {
            assistWindow.show();
          }
        }
      },
      { type: "separator" },
      // {
      //   label: "Restart",
      //   click() {
      //     app.relaunch();
      //     app.quit();
      //   },
      // },
      {
        label: "DevTools",
        // icon: nativeImage.createFromDataURL(
        click: () => {
          const pathSeparator = process.platform === "win32" ? "\\" : "/";
          let logPath = appConfig.get("appHome") + pathSeparator + "background.log";
          shell.openExternal("vscode://file/" + logPath);
        }
      },
      {
        label: "Help",
        click: () => {
          shell.openExternal("https://github.com/danalite/autool/issues");
        }
      },
      { type: "separator" },
      {
        role: "about"
      },
      {
        label: "Quit",
        click() {
          process.exit(0);
        }
      },
    ]);
  }

  appIcon.on("click", () => {
    appIcon.setContextMenu(buildAppMenu());
    appIcon.popUpContextMenu();
  });

  appIcon.setContextMenu(buildAppMenu());
}

