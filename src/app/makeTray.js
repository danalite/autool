import { app, Menu, nativeImage, Tray, shell, dialog } from "electron";
import { appConfig } from "@/utils/main/config";
import pkg from "../../package.json";

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 })
  const appIcon = new Tray(icon)

  appIcon.setToolTip('Frank')

  const createContextMenu = () =>
    Menu.buildFromTemplate([
      {
        label: "Help documents",
        click: () => {
          process.nextTick(() => {
            shell.openExternal("https://github.com/clouDr-f2e/rubick");
          });
        },
      },
      { type: "separator" },
      {
        label: "Show main window",
        // accelerator: getShowAndHiddenHotKey(),
        click() {
          mainWindow.show();
        },
      },
      {
        role: "quit",
        label: "Exit",
      },
      {
        label: "Restart",
        click() {
          app.relaunch();
          app.quit();
        },
      },
      { type: "separator" },
      {
        label: "About AuTool",
        click() {
          dialog.showMessageBox({
            title: "Danalites AuTool",
            message: "Fast and scalable workflow automation tool.",
            detail: `Version: ${pkg.version}\n`,
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

