import { app, Menu, nativeImage, Tray, shell, dialog } from "electron";
import { appConfig } from "@/utils/main/config";
import pkg from "../../package.json";

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  const appIcon = new Tray(icon)

  appIcon.setToolTip('AuTool')
  const appMenu = Menu.buildFromTemplate([
      {
        label: "Show Main",
        click() {
          mainWindow.show();
          mainWindow.focus();
        }, 
        accelerator: "CommandOrControl+E",
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
      { type: "separator" },
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
        label: "Activate Canvas",
        type: "checkbox",
        click: () => {
          if (appMenu.items[5].checked) {
            assistWindow.setIgnoreMouseEvents(false);
          } else {
            assistWindow.setIgnoreMouseEvents(true, { forward: true });
          }
        },
        checked: false,
      },
      { type: "separator" },
      {
        label: "Help",
        click: () => {
          process.nextTick(() => {
            shell.openExternal("https://github.com/danalite/autool/issues");
          });
        },
      },
      {
        label: "About",
        click() {
          mainWindow.show();
          dialog.showMessageBox({
            title: "AuTool © Danalite Technology",
            message: "Software Platform for Workflows Automation and Digital Adoption",
            detail: `version: ${pkg.version}\n`,
          });
        },
      },
    ]);

  appIcon.on("click", () => {
    appIcon.setContextMenu(appMenu);
    appIcon.popUpContextMenu();
  });
  appIcon.setContextMenu(appMenu);
}

