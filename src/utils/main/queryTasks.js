const fs = require('fs');

const path = require('path');
const yaml = require('js-yaml');
import { appConfig } from '@/utils/main/config'

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

export const addTask = (appPath, taskName, doc) => {
  let taskNameExt = taskName + ".yaml"
  let appJsonPath = path.join(appPath, "autool-tasks.json")
  let appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

  appJson.tasks.push(taskNameExt)
  // console.log("@@", appJson)
  fs.writeFile(appJsonPath, JSON.stringify(appJson), err => {
    if (err) {
      console.error(err);
    }
  });

  let newTaskPath = path.join(appPath, taskNameExt)
  fs.writeFile(newTaskPath, doc, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

// Create a new app with folder and autool-tasks.json
export const addApp = (appAuthor, appName, appIcon) => {
  let appHome = appConfig.get('appHome')
  let scriptHome = path.join(appHome, appAuthor, appName)

  if (!fs.existsSync(scriptHome)) {
    fs.mkdirSync(scriptHome, { recursive: true });
  }

  let appJson = {
    "app": appName,
    "author": appAuthor,
    "icon": appIcon,
    "tasks": ["example.yaml"]
  }
  let appJsonPath = path.join(scriptHome, "autool-tasks.json")
  fs.writeFile(appJsonPath, JSON.stringify(appJson), err => {
    if (err) {
      console.error(err);
    }
  });

  let exampleTask = {
    "task": "example",
    "actions": ["cmd.print(Hello World!)", "cmd.print(This is an example task.)"]
  }
  let exampleTaskPath = path.join(scriptHome, "example.yaml")
  fs.writeFile(exampleTaskPath, yaml.dump(exampleTask), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

export const deleteTask = (appPath, taskPath, taskName) => {
  fs.unlink(taskPath, function (err) {
    if (err) return console.log(err);

    let appJsonPath = path.join(appPath, "autool-tasks.json")
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

  } else if (key == 'startTime' || key == 'hotkey') {
    let newKey = key == 'startTime' ? 'start-time' : 'hotkey'
    if (newKey == 'hotkey' && typeof update !== 'string') {
      console.log("@@ waring: hotkey should be string", update)
      return
    }
    doc.configs[newKey] = update;

  } else if (key == 'shortcut') {
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

const parseTask = async (taskFile, taskItem) => {
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
    taskItem.shortcut = false
    taskItem.hotkey = ""
    taskItem.startTime = ""
    taskItem.options = []

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

  } catch (e) {
    console.log(e);
  }
}

export const loadApps = async (appDir) => {
  const appEntries = findTasksJson(appDir)

  let appList = []
  let autostartTasks = []

  // Read apps in parallel without forEach
  // https://stackoverflow.com/a/37576787
  await Promise.all(appEntries.map(async (appEntry, appIndex) => {
    let tasks = path.join(appEntry, 'autool-tasks.json')
    const content = await fs.readFileSync(tasks, 'utf8')

    let appJson = JSON.parse(content)
    appJson.path = appEntry
    let taskList = []

    // Read tasks in parallel without forEach
    await Promise.all(appJson.tasks.map(async (task, taskIndex) => {
      let taskFile = path.join(appEntry, task)
      // Check if task file exists
      if (fs.existsSync(taskFile)) {
        var taskItem = {
          'key': taskIndex,
          'relTaskPath': task.replace('.yaml', ''), // relative path
          'absTaskPath': taskFile, // absolute path
          'appPath': appEntry,     // app path (dir)
          'app': appJson.app,
          'author': appJson.author,
        }

        await parseTask(taskFile, taskItem)
        const options = taskItem.options || []
        if (options.includes('autostart')) {
          autostartTasks.push(taskItem)
        }
        taskList.push(taskItem)
      }
    }))


    // console.log("@@", JSON.stringify(taskList))
    taskList.sort(function (a, b) { return a.key - b.key })
    appJson.tasks = taskList

    appJson.index = appIndex
    appList.push(appJson)
  }))

  // console.log("appList", appList)
  appList.sort(function (a, b) { return a.index - b.index })
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
        let tasks = path.join(app, 'autool-tasks.json')
        if (fs.existsSync(tasks)) {
          allFiles.push(app)
        }
      })
    }
  })
  return allFiles
}

