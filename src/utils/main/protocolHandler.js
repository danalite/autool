export const protocolHandler = (url, mainWindow) => {
    if (url.startsWith("autool://download?url=")) {
        mainWindow.focus()
        var githubUrl = url.replace("autool://download?url=", "")
        mainWindow.webContents.send('download', githubUrl)
    }
}
