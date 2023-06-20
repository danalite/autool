
export const protocolHandler = (url, mainWindow) => {
    console.log("protocolHandler: " + url)
    if (url.startsWith("autool://download?url=")) {
        mainWindow.focus()
        var githubUrl = url.replace("autool://download?url=", "")
        mainWindow.webContents.send('download', githubUrl)
    }
}
