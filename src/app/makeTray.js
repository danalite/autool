import { app, Menu, nativeImage, Tray } from "electron";
import { appConfig } from "@/utils/main/config";

const toggleWindow = (window, tray) => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showTrayWindow(window, tray)
  }
}

const showTrayWindow = (window, tray) => {
  const position = getWindowPosition(window, tray)
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

const getWindowPosition = (window, tray) => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 1 pixel vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 1)

  return {x: x, y: y}
}

// Create a status page (task scheduled or running. notifications etc.)
export const makeTray = (iconPath, mainWindow, assistWindow) => {
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 })
  const tray = new Tray(icon)

  tray.setToolTip('Frank')

  tray.on('click', function (event) {
    toggleWindow(assistWindow, tray)
    // Show devtools when command clicked
    if (assistWindow.isVisible() && process.defaultApp && event.metaKey) {
      assistWindow.openDevTools({mode: 'detach'})
    }
  })
  
}

const showWindow = (Window) => {
  if (!Window) {
    return
  }

  const visible = Window.isVisible()
  if (!visible) {
    Window.show()
    Window.setSkipTaskbar(false)
  } else {
    Window.hide()
    Window.setSkipTaskbar(true)
  }
}
