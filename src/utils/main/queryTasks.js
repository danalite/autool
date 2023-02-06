const fs = require('fs');
// const fs = require('fs').promises;

const path = require('path');
const yaml = require('js-yaml');

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

export const addTask = (appPath, taskPath, taskName) => {
  
}

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
  let content = fs.readFileSync(taskPath, 'utf8')
  let doc = yaml.load(content);

  // console.log("@@", taskPath, key, update, content)
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

export const loadApps = async (appDir) => {

  let scripts = path.join(appDir, 'scripts');
  const appEntries = findTasksJson(scripts)

  let appList = []
  let autostartTasks = []

  // Read apps in parallel without forEach
  // https://stackoverflow.com/a/37576787
  await Promise.all(appEntries.map(async (appEntry, appIndex) => {
    let tasks = path.join(appEntry, 'tasks.json')
    const content = await fs.readFileSync(tasks, 'utf8')

    let appJson = JSON.parse(content)
    appJson.path = appEntry
    let taskList = []

    // Read tasks in parallel without forEach
    await Promise.all(appJson.tasks.map(async (task, taskIndex) => {
      let taskFile = path.join(appEntry, task)
      var taskItem = {
        'key': taskIndex,
        'relTaskPath': task.replace('.yaml', ''), // relative path
        'absTaskPath': taskFile, // absolute path
        'appPath': appEntry,     // app path (dir)
        'app': appJson.app,
        'author': appJson.author,
      }

      try {
        let content = await readFile(taskFile)
        let doc = yaml.load(content);

        if (doc === undefined) {
          console.error("@@ loadApps. ", content)
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
            taskItem.inputs.push({ "key": key, "value": value })
          }
        }

        if (taskItem.options.includes("autostart")) {
          autostartTasks.push(taskItem)
        }

      } catch (e) {
        console.log(e);
      }
      taskList.push(taskItem)
    }))

    // console.log("@@", JSON.stringify(taskList))
    taskList.sort(function(a, b) {return a.key - b.key})
    appJson.tasks = taskList

    appJson.index = appIndex
    appList.push(appJson)
  }))

  // console.log("appList", appList)
  appList.sort(function(a, b) {return a.index - b.index})
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

