<template>
  <div>
    <task-bar v-if="pageCount == 0" />
    <n-layout position="absolute" v-show="pageCount > 0">
      <n-layout has-sider position="absolute" style="bottom: 0px">
        <n-layout-sider
          bordered
          :width="68"
          :native-scrollbar="false"
          style="background-color: #ccdcd0"
        >
          <n-menu
            v-model:value="activeMenuItem"
            :collapsed="true"
            :collapsed-width="68"
            :collapsed-icon-size="30"
            :options="menuOptions"
            :inverted="true"
            style="padding-top: 30px"
          />
        </n-layout-sider>

        <n-layout>
          <n-layout-header
            style="height: 40px; padding-left: 10px"
            bordered
            position="absolute"
          >
            <dashboard></dashboard>
          </n-layout-header>
          <AppLists
            v-if="activeMenuItem == 'apps'"
            :apps="apps"
            @runTask="runTask($event)"
          ></AppLists>

          <TaskSch
            v-show="activeMenuItem == 'scheduler'"
            :tasksStatusTable="tasksStatusTable"
            :taskEvents="taskEvents"
          ></TaskSch>

          <settings-index v-show="activeMenuItem == 'settings'" />

          <!-- <n-layout-footer
            bordered
            position="absolute"
            style="height: 25px; padding: 0px; background-color: #f5f5f5"
          >
          </n-layout-footer> -->
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup>
import Dashboard from "./dashboard.vue";
import SettingsIndex from "./settingsIndex.vue";

import TaskBar from "./taskBar.vue";
import AppLists from "./appLists.vue";
import TaskSch from "./taskSch.vue";

import {
  NLayout,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NSpace,
  NIcon,
  NButton,
  NMenu,
  useMessage,
} from "naive-ui";

import { Apps, HeartRateMonitor, Settings } from "@vicons/tabler";

import { useStore } from "@/render/store";
import { storeToRefs } from "pinia";

import { h, onMounted, ref } from "vue";
import { appConfig } from "@/utils/main/config";
import { EventType } from "@/utils/render/eventTypes";
import { ipcRenderer } from "electron";
import { genUUID, parseCron } from "@/utils/render/components/common";

import eventBus from "@/utils/render/eventBus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

document.title = "AuTool";
document.getElementsByTagName("html")[0].className = "container";

const store = useStore();
let { pageCount } = storeToRefs(store);
const message = useMessage();

let wsConn = null;
function setupWsConn() {
  try {
    wsConn = new WebSocket("ws://127.0.0.1:5678/");
    wsConn.onmessage = (event) => {
      const data = JSON.parse(event.data);
      backendEventHook(data);
    };
    wsConn.onopen = (event) => {
      sendMessageToBackend({
        event: EventType.I_EVENT_WSS_REQ,
        value: "__MAIN__",
      });
      console.log("Connected to backend server.");
    };

    wsConn.onerror = (e) => {
      console.log("wsConn error", JSON.stringify(e));
    };
  } catch (e) {
    console.log("wsConn error in setup", JSON.stringify(e));
  }
}

// On startup load apps
const apps = ref([]);
let dim = appConfig.get("mainWindowDimension");
let openPage = dim.isCollapsed ? 0 : 1;
store.pageReset(openPage);

let appsLocal = appConfig.get("apps");
if (appsLocal) {
  apps.value = appsLocal;
}

onMounted(async () => {
  setTimeout(() => {
    if (wsConn === null) {
      setupWsConn();
    }
  }, 800);

  setInterval(() => {
    let status = false;
    if (wsConn !== null) {
      if (wsConn.readyState === WebSocket.OPEN) {
        status = true;
      }
    }
    appConfig.set("isLocalServerActive", status);
    if (status === false) {
      setupWsConn();
    }
  }, 1000);

  ipcRenderer.on("to-backend", (event, data) => {
    sendMessageToBackend(data);
  });

  // Load cached tasks and re-register hotkeys
  let scheduledTasksCache = appConfig.get("scheduledTasksCache");
  let hotkeyTasksCache = appConfig.get("hotkeyTasksCache");
  tasksStatusTable.value = scheduledTasksCache.map((task) => {
    task.nextDates = parseCron(task.startTime);
    return task;
  });

  tasksStatusTable.value = tasksStatusTable.value.concat(
    appConfig.get("stoppedTasksCache")
  );

  // Reload hotkeys (long-living until removed manually by users)
  setTimeout(async () => {
    await Promise.all(
      hotkeyTasksCache.map(async (task) => {
        tasksStatusTable.value.push(task);
        ipcRenderer.send("to-console", {
          action: "uio-event",
          type: "hotkeyWait",
          source: task.taskName,
          taskId: task.id,
          hotkey: task.hotkey,
        });
      })
    );
  }, 2000);
});

const sendMessageToBackend = (msg) => {
  try {
    wsConn.send(JSON.stringify(msg));
    return true;

  } catch (e) {
    wsConn = null;
    console.log(
      "wsConn error in sendMessageToBackend",
      JSON.stringify(msg),
      JSON.stringify(e)
    );
    return false;
  }
};

// Task management constructs
const taskEvents = ref([]);
const tasksStatusTable = ref([]);

const backendEventHook = (msg) => {
  const value = msg.value;
  msg.stamp = new Date().getTime();
  if (msg.event != "__EXIT__") {
    taskEvents.value.push({ source: "backend", ...msg });
  }

  const taskId = msg.uuid;
  switch (msg.event) {
    case EventType.O_EVENT_TASK_STATUS:
      tasksStatusTable.value = tasksStatusTable.value.map((task) => {
        if (task.id === taskId) {
          task.status = value.type;
        }
        return task;
      });
      if (value.type === "taskError") {
        if (!appConfig.get("mainWindowDimension.isCollapsed")) {
          message.error(
            `Error: ${msg.taskName}. Check "Scheduler > Events for details"`,
            { duration: 3000 }
          );
        }
      }
      break;

    // Non-blocking: send to assist window
    case EventType.O_EVENT_WINDOW_REQ:
      ipcRenderer.send("to-assist-window", {
        source: msg.taskName,
        ...value,
      });
      break;

    case EventType.O_EVENT_USER_INPUT:
      let callback = `callback-${taskId}`;
      // resumeTask from assist window
      ipcRenderer.once(callback, (event, data) => {
        sendMessageToBackend({
          event: EventType.I_EVENT_TASK_REQ,
          uuid: taskId,
          taskName: msg.taskName,
          value: {
            type: "resumeTask",
            selected: JSON.parse(data),
          },
        });
      });

      // Start pop-up window and wait for callback
      ipcRenderer.send("to-assist-window", {
        source: msg.taskName,
        callback: callback,
        ...value,
      });
      break;

    case EventType.O_EVENT_BUS_REQ:
      if (
        value.eventName == "__KEY_PRESSED__" ||
        value.eventName == "__MOUSE_CLICKED__"
      ) {
        // Register key/mouse events and wait for callback
        if (value.type === "event-register") {
          ipcRenderer.send("to-console", {
            taskId: taskId,
            action: "uio-event",
            type: value.eventName,
            source: msg.taskName,
            params: value.params,
            argsName: value.argsName,
          });
        }
        // console.log("O_EVENT_BUS_REQ", JSON.stringify(value));
      }
      break;

    case "__EXIT__":
      ipcRenderer.send("to-console", {
        taskId: taskId,
        action: "uio-event",
        type: "eventRemoval",
        source: msg.taskName,
      });
      break;

    default:
      console.log(msg.event, msg);
      break;
  }
};

const runTask = async (task) => {
  const taskId = genUUID();
  let tasksStatus = {
    id: taskId,
    taskName: task.relTaskPath,
    taskPath: task.absTaskPath,
    hotkey: task.hotkey,
    options: task.options,
    status: "",
    startTime: task.startTime,
    stamp: new Date().getTime(),
  };

  // Events tracing between console and backend
  let taskStartEvent = {
    event: EventType.I_EVENT_TASK_REQ,
    source: "console",
    uuid: taskId,
    taskName: task.relTaskPath,
    value: {
      type: "runTask",
      appPath: task.appPath,
      absTaskPath: task.absTaskPath,
      startTime: task.startTime,
      inputs: task.inputs,
      options: task.options,
      content: task.content,
    },
    stamp: new Date().getTime(),
  };

  if (task.hotkey) {
    // 1. Stall task until hotkey is triggered.
    let isKeyRegistered = tasksStatusTable.value.find(
      (t) => t.hotkey === task.hotkey && t.status === "listening"
    );
    if (isKeyRegistered) {
      message.error(
        `"${task.hotkey}" occupied by "${isKeyRegistered.taskName}"`,
        { duration: 5e3 }
      );
      return;
    }

    tasksStatus.status = "listening";
    // Dummy task: it has UID but not registered in backend
    tasksStatusTable.value.push(tasksStatus);
    message.success(`"${task.relTaskPath}"" bind with ${task.hotkey}`);

    // runTask: register a hotkey uio event
    ipcRenderer.send("to-console", {
      action: "uio-event",
      type: "hotkeyWait",
      source: task.relTaskPath,
      taskId: taskId,
      hotkey: task.hotkey,
    });
    
  } else if (task.startTime) {
    tasksStatus.status = "scheduled";
    tasksStatus.nextDates = parseCron(task.startTime);
    tasksStatusTable.value.push(tasksStatus);
    
  } else {
    let success = sendMessageToBackend(taskStartEvent);
    if (success) {
      tasksStatus.status = "running";
      tasksStatusTable.value.push(tasksStatus);
      taskEvents.value.push(taskStartEvent);
    }
  }
};

const stopTask = (task) => {
  var isHotkeyTask = false;
  var isScheduledTask = false;
  tasksStatusTable.value = tasksStatusTable.value.map((t) => {
    if (t.id === task.id) {
      if (t.status == "listening") {
        isHotkeyTask = true;
      }
      if (t.status == "scheduled") {
        isScheduledTask = true;
      }
      t.status = "stopped";
    }
    return t;
  });

  // Scheduled task is auto discarded with status reset
  if (isScheduledTask) {
    return;
  }

  if (isHotkeyTask) {
    // stopTask: unregister hotkey bind with the task
    ipcRenderer.send("to-console", {
      action: "uio-event",
      type: "hotkeyRemove",
      taskId: task.id,
      source: task.relTaskPath,
    });
  } else {
    // stopTask: let backend cancel if the task is running
    const taskName = task.taskName || task.relTaskPath;
    let newEvent = {
      event: EventType.I_EVENT_TASK_REQ,
      uuid: task.id,
      taskName: taskName,
      source: "console",
      value: {
        type: "cancelTask",
      },
      stamp: new Date().getTime(),
    };

    taskEvents.value.push(newEvent);
    sendMessageToBackend(newEvent);
  }
};

eventBus.on("run-task", (task) => {
  // console.log("run-task", task);
  runTask(task);
});

eventBus.on("stop-task", (task) => {
  // console.log("stop-task", task);
  stopTask(task);
});

ipcRenderer.on("to-main-win", (event, message) => {
  if (message.action === "run-task") {
    message.tasks.forEach((task) => {
      runTask(task);
    });
  }
});

ipcRenderer.on("uio-callback", (event, message) => {
  if (message.type === "hotkeyWait") {
    let task = tasksStatusTable.value.find((t) => t.id === message.taskId);
    runTask({
      relTaskPath: task.taskName,
      absTaskPath: task.taskPath,
    });
  } else {
    // resumeTask from uio-hook (main process)
    let newEvent = {
      event: EventType.I_EVENT_TASK_REQ,
      uuid: message.taskId,
      taskName: message.source,
      source: "main",
      value: {
        type: "resumeTask",
        return: message.return,
      },
      stamp: new Date().getTime(),
    };
    taskEvents.value.push(newEvent);
    sendMessageToBackend(newEvent);
  }
});

const renderIcon = (icon, attrs = {}) => {
  return () => h(NIcon, null, { default: () => h(icon) });
};

const activeMenuItem = ref("apps");
const menuOptions = [
  {
    label: () => t("apps.title"),
    key: "apps",
    icon: renderIcon(Apps),
  },
  {
    label: () => t("scheduler.title"),
    key: "scheduler",
    icon: renderIcon(HeartRateMonitor),
  },
  {
    label: t("settings.title"),
    key: "settings",
    icon: renderIcon(Settings),
  },
];

ipcRenderer.on("apps-loaded", (event, message) => {
  apps.value = appConfig.get("apps");
});
</script>

<style>
@import url(../../assets/css/animationCommon.css);

/* https://dev.to/tolentinoel/frosted-glass-on-css-37bg */
.container-div {
  -webkit-backdrop-filter: blur(8px); /* Safari 9+ */
  backdrop-filter: blur(2px); /* Chrome and Opera */
  box-shadow: 0px 10px 15px 10px rgba(228, 228, 228, 0.903);
  background-color: rgba(228, 228, 228, 0.903);
}
</style>
