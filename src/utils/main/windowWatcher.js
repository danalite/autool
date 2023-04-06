const activeWindow = require('active-win');
let options = {}

let lastWindowProcessId = null;
let lastWindowBounds = {x :0 , y: 0, width: 0, height: 0}
let lastWindowName = null;

const notSameBounds = (bounds1, bounds2) => {
    return bounds1.x != bounds2.x || bounds1.y != bounds2.y || bounds1.width != bounds2.width || bounds1.height != bounds2.height;
}

// Start a background process to watch for window changes
export const monitorWindowChange = (assistWindow) => {
    setInterval(() => {
        activeWindow(options).then(
            win => {
                // console.log("[ Main ] ", win);
                if (win == undefined) {
                    if (lastWindowProcessId != null) {
                        assistWindow.webContents.send('window-change', {
                            processId: null,
                            name: null,
                            bounds: {x :0 , y: 0, width: 0, height: 0}
                        });
                    }
                    lastWindowProcessId = null;
                    lastWindowName = null;
                    lastWindowBounds = {x :0 , y: 0, width: 0, height: 0};

                } else {

                    if (lastWindowProcessId != win.owner.processId || lastWindowName != win.owner.name || notSameBounds(lastWindowBounds, win.bounds)) {

                        assistWindow.webContents.send('window-change', {
                            processId: win.owner.processId,
                            name: win.owner.name,
                            bounds: win.bounds
                        });
                    }
                    lastWindowProcessId = win.owner.processId;
                    lastWindowName = win.owner.name;
                    lastWindowBounds = win.bounds;
                }
            });
    }, 500);
}