const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

export const loadApps = (appDir) => {

  let scripts = path.join(appDir, 'scripts');
  const apps = findTasksJson(scripts)

  let appList = []
  let autostartTasks = []

  apps.forEach(app => {
    let tasks = path.join(app, 'tasks.json')
    let appJson = JSON.parse(fs.readFileSync(tasks, 'utf8'))
    appJson.path = app

    let taskList = []
    var index = 0
    appJson.tasks.forEach(task => {
      let taskFile = path.join(app, task)
      var taskItem = {
        'key': index++,
        'relTaskPath': task.replace('.yaml', ''), // relative path
        'absTaskPath': taskFile, // absolute path
        'appPath': app,          // app path (dir)
        'app': appJson.app,
        'author': appJson.author,
      }

      try {
        const doc = yaml.load(fs.readFileSync(taskFile, 'utf8'));
        // console.log(doc)
        taskItem.desc = doc.desc? doc.desc: []
        taskItem.inputs = []
        
        // options: autostart, remote
        taskItem.options = []
        if ("configs" in doc) {
          if ("options" in doc.configs) {
            taskItem.options = doc.configs.options
          }
          if ("hotkey" in doc.configs) {
            taskItem.hotkey = doc.configs.hotkey
          }
          if ("shortcut" in doc.configs) {
            taskItem.shortcut = doc.configs.shortcut
          }
        }

        if (doc.inputs) {
          for (const [key, value] of Object.entries(doc.inputs)) {
            taskItem.inputs.push({"key": key, "value": value})
          }
        }

        if (taskItem.options.includes("autostart")) {
          autostartTasks.push(taskItem)
        }

      } catch (e) {
        console.log(e);
      }
      
      // console.log("@@", JSON.stringify(taskItem))
      taskList.push(taskItem)
    })
    appJson.tasks = taskList
    appList.push(appJson)
  })
  // console.log("appList", appList)
  return { 'apps': appList, 'autostart': autostartTasks }
}

// https://gist.github.com/timoxley/0cb5053dec107499c8aabad8dfd651ea
function findTasksJson(dir) {
  let allFiles = []

  const authors = fs.readdirSync(dir).filter(f => !f.startsWith('.')).map(f => path.join(dir, f))
  authors.forEach(a => {
    if (fs.statSync(a).isDirectory()) {

      const apps = fs.readdirSync(a).filter(f => fs.statSync(path.join(a, f)).isDirectory()).map(f => path.join(a, f))

      apps.forEach(app => {
        let tasks = path.join(app, 'tasks.json')
        if (fs.existsSync(tasks)) {
          allFiles.push(app)
        }
      })
    }
  })
  return allFiles
}

