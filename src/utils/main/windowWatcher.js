const activeWindow = require('active-win');
let options = {}

// Start a background process to watch for window changes
export const monitorWindowChange = (assistWindow) => {
    setInterval(() => {
        activeWindow(options).then(
            win => {
                if (win == undefined) {

                } else {
                    // Send event to backend to trigger waiting events
                    assistWindow.webContents.send('assist-win-push', {
                        type: "active-window",
                        options: win
                    });
                }
            });
    }, 1000);
}