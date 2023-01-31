const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

export const deleteTask = (appPath, taskPath, taskName) => {
  fs.unlink(taskPath, function (err) {
    if (err) return console.log(err);

    let appJsonPath = path.join(appPath, "tasks.json")
    let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
    let newTasks = appJson.tasks.filter(t => t !== taskName + ".yaml")
    appJson.tasks = newTasks
    fs.writeFile(appJsonPath, JSON.stringify(appJson), err => {
      if (err) {
        console.error(err);
      }
    });
  });
}

export const updateTaskYaml = (taskPath, key, update) => {
  let doc = yaml.load(fs.readFileSync(taskPath, 'utf8'));

  // autocomplete if no configs provided
  if (!("configs" in doc)) {
    doc.configs = {}
  }
  if (!("options" in doc.configs)) {
    doc.configs.options = []
  }

  if (key == 'autostart' || key == 'remote') {
    // Toggle autostart or remote options
    if (update && !doc.configs.options.includes(key)) {
      doc.configs.options.push(key)

    } else if (!update && doc.configs.options.includes(key)) {
      doc.configs.options = doc.configs.options.filter(o => o !== key)
    }

  } else {
    // update startTime or hotkey
    let newKey = key == 'startTime' ? 'start-time' : 'hotkey'
    doc.configs[newKey] = update;
  }

  if (key == 'shortcut') {
    doc.configs[key] = update;
  }

  fs.writeFile(taskPath, yaml.dump(doc), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

export const deleteApp = (appPath) => {
  if (fs.existsSync(appPath)) {
    fs.rmSync(appPath, { recursive: true, force: true })
  } else {
    console.error(`${appPath} not exists`)
  }
}

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
        let content = fs.readFileSync(taskFile, 'utf8') 
        const doc = yaml.load(content);

        if (doc === undefined) {
          console.log("@@", content == undefined, typeof(content))
          content = fs.readFileSync(taskFile, 'utf8')
          console.error("@@", content)
          console.error(`Error: ${taskFile} is empty`)
          return
        }

        taskItem.desc = []
        if ("desc" in doc) taskItem.desc = doc.desc
        taskItem.doc = ""
        if ("doc" in doc) taskItem.doc = doc.doc
        
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
          if ("start-time" in doc.configs) {
            taskItem.startTime = doc.configs["start-time"]
          }
        }

        taskItem.inputs = []
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

