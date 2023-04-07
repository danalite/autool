import { app, Menu, nativeImage, Tray, shell, dialog } from "electron";
import { appConfig } from "@/utils/main/config";
import pkg from "../../package.json";

let isEditing = false;

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  const appIcon = new Tray(icon)

  appIcon.setToolTip('AuTool')

  const createContextMenu = () =>
    Menu.buildFromTemplate([
      {
        label: "Main Console",
        click() {
          mainWindow.show();
          mainWindow.focus();
        },
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
        label: "Hide Canvas",
        click: () => {
          if (assistWindow.isVisible()) {
            assistWindow.hide();
          } else {
            assistWindow.show();
          }
        },
      },
      {
        label: "Edit Canvas",
        click: () => {
          assistWindow.setIgnoreMouseEvents(isEditing);
          isEditing = !isEditing;
        }
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
          dialog.showMessageBox({
            title: "AuTool © DANALITE Technology",
            message: "Software Automation Platform",
            detail: `version: ${pkg.version}\n`,
          });
        },
      },
    ]);

  appIcon.on("click", () => {
    appIcon.setContextMenu(createContextMenu());
    appIcon.popUpContextMenu();
  });

  appIcon.setContextMenu(createContextMenu());

}

