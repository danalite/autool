import { app, Menu, nativeImage, Tray, shell, dialog } from "electron";

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 })
  const appIcon = new Tray(icon)
  appIcon.setToolTip('AuTool')

  // https://www.electronjs.org/docs/latest/api/menu-item
  const buildAppMenu = () => {
    return Menu.buildFromTemplate([
      {
        label: "Show Main",
        click() {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      {
        label: "Show Canvas",
        click: () => {
          assistWindow.show();
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
        label: "Show DevTools",
        click: () => {
          assistWindow.toggleDevTools();
          mainWindow.toggleDevTools();
        }
      },
      {
        label: "Exit",
        click() {
          app.quit();
        }
      },
      {
        label: "Help",
        click: () => {
          process.nextTick(() => {
            shell.openExternal("https://github.com/danalite/autool/issues");
          });
        },
      },
    ]);
  }

  appIcon.on("click", () => {
    appIcon.setContextMenu(buildAppMenu());
    appIcon.popUpContextMenu();
  });

  appIcon.setContextMenu(buildAppMenu());
}

