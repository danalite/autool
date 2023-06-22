import { appConfig } from "@/utils/main/config";

const fs = require('fs')
const path = require('path')

export const protocolHandler = (url, mainWindow) => {
    console.log("protocolHandler: " + url)
    if (url.startsWith("autool://download?url=")) {
        mainWindow.focus()
        var link = url.replace("autool://download?url=", "")
        mainWindow.webContents.send('download', NAnchorLink)

    } else if (url.startsWith("autool://run?")) {
        const pattern = /autool:\/\/run\?taskName=([^&]+)&taskPath=([^&]+)/;
        const matches = url.match(pattern);

        if (matches) {
            let taskName = matches[1];
            let taskPath = matches[2]; 

            taskPath = path.join(appConfig.get('appHome'), taskPath)
            let newTask = { relTaskPath: taskName, absTaskPath: taskPath };

            if (fs.existsSync(taskPath)) {
                mainWindow.webContents.send('to-main-win',
                { action: "run-task", tasks: [newTask] })

            } else {
                console.log("Task not found: " + taskPath)
            }
            
        } else {
            console.log("No matches found.");
        }

    }
}
