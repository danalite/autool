<template>
  <div>
    <task-bar v-if="pageCount == 0"></task-bar>
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
            @refreshApps="refreshApps"
          ></AppLists>

          <TaskSch
            v-show="activeMenuItem == 'scheduler'"
            @runTask="runTask($event)"
            @stopTask="stopTask($event)"
            :tasksStatusTable="tasksStatusTable"
            :taskEvents="taskEvents"
          ></TaskSch>

          <SettingsPage
            v-show="activeMenuItem == 'settings'"
          />

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
import SettingsPage from "./settingsPage.vue";

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
  NTag,
  NBadge,
  NAvatar,
  useMessage,
} from "naive-ui";

import { PlayerPlay, Apps, HeartRateMonitor, Settings } from "@vicons/tabler";

import { useStore } from "../../store";
import { storeToRefs } from "pinia";

import { h, onMounted, ref } from "vue";
import { appConfig } from "@/utils/main/config";
import { EventType } from "@/utils/render/eventTypes";
import { ipcRenderer } from "electron";
import { genUUID } from "@/utils/render/taskUtils";
import { parseCron } from "@/utils/render/parseCron";

import eventBus from "@/utils/render/eventBus";

document.title = "AuTool";
document.getElementsByTagName("html")[0].className = "container";

const store = useStore();
let { pageCount } = storeToRefs(store);
const message = useMessage();

function setupWsConn() {
  try {
    wsConn = new WebSocket("ws://127.0.0.1:5678/");
    wsConn.onmessage = (event) => {
      const data = JSON.parse(event.data);
      backendEventHook(data);
    };
    wsConn.onopen = (event) => {
      sendMessageToBackend({
        event: EventType.I_EVENT_TASK_REQ,
        value: {
          type: "REGISTRATION",
          worker: "Main",
        },
      });
      console.log("Connected to backend server.");
    };

    wsConn.onerror = (e) => {
      message.error("wsConn error", e);
    };
  } catch (e) {
    console.log("Failed. Backend not responding.", e);
    ipcRenderer.send("restart-wss-server", {});
    setTimeout(() => {
      setupWsConn();
    }, 5000);
  }
}

// On startup load apps
const apps = ref([]);
onMounted(() => {
  let dim = appConfig.get("mainWindowDimension");
  let openPage = dim.isCollapsed ? 0 : 1;
  store.pageReset(openPage);

  let appsLocal = appConfig.get("apps");
  if (appsLocal) {
    apps.value = appsLocal;
  }

  ipcRenderer.once("start-wss-backend", () => {
    setTimeout(() => {
      if (wsConn === null) {
        setupWsConn();
      }
    }, 600);
  });

  ipcRenderer.on("to-backend", (event, data) => {
    sendMessageToBackend(data);
  });
});

// Websocket connection to backend
let wsConn = null;
const sendMessageToBackend = (message) => {
  try {
    if (wsConn.readyState !== WebSocket.OPEN) {
      wsConn.close();
      console.log("wsConn is closed, trying to reconnect...");

      ipcRenderer.send("restart-wss-server");
      setTimeout(() => {
        setupWsConn();
        wsConn.send(JSON.stringify(message));
      }, 1000);
    } else {
      wsConn.send(JSON.stringify(message));
    }
  } catch (e) {
    console.log(JSON.stringify(e), "Backend not responding...");
  }
};

// Task management constructs
const taskEvents = ref([]);
const tasksStatusTable = ref([]);
const backendEventHook = (message) => {
  const value = message.value;
  message.time = new Date().toLocaleString();
  taskEvents.value.push({ source: "backend", ...message });

  switch (message.event) {
    case EventType.O_EVENT_TASK_STATUS:
      const taskId = message.uuid;
      tasksStatusTable.value = tasksStatusTable.value.map((task) => {
        if (task.id === taskId) {
          task.status = value.type;
        }
        return task;
      });
      break;

    case EventType.O_EVENT_HOOK_REQ:
      ipcRenderer.invoke("to-console", {
        action: "uio-event",
        type: value.type,
        source: message.taskName,
        taskId: message.uuid,
        options: [value.key],
      });
      break;

    default:
      console.log(message.event, message);
      break;
  }
};

// Actions: start tasks
const runTask = async (task) => {
  const taskId = genUUID();
  let tasksStatus = {
    id: taskId,
    taskName: task.relTaskPath,
    hotkey: task.hotkey,
    options: task.options,
    status: "",
    startTime: task.startTime,
    stamp: new Date().toLocaleString(),
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
    stamp: new Date().toLocaleString(),
  };

  if (task.hotkey) {
    // 1. Stall task until hotkey is triggered.
    let isKeyRegistered = tasksStatusTable.value.find(
      (t) => t.hotkey === task.hotkey && t.status === "listening"
    );
    if (isKeyRegistered) {
      ipcRenderer.send("to-assist-window", {
        type: "push-notification",
        title: `WARNING: "${task.relTaskPath}" hotkey occupied`,
        content: `"${task.hotkey}" used by "${isKeyRegistered.taskName}"`,
        source: "console.appMain",
      });
      return;
    }

    tasksStatus.status = "listening";
    // Dummy task: it has UID but not registered in backend
    tasksStatusTable.value.push(tasksStatus);
    message.success(`"${task.relTaskPath}"" bind with ${task.hotkey}`);

    // The hotkey remains registered until the task is stopped
    await ipcRenderer.invoke("to-console", {
      action: "uio-event",
      type: "registerHotkey",
      hotkey: task.hotkey,
      source: "console.appMain",
      taskId: taskId,
    });

  } else if (task.startTime) {

    tasksStatus.status = "scheduled";
    tasksStatus.nextDates = parseCron(task.startTime);
    tasksStatusTable.value.push(tasksStatus);

  } else {
    tasksStatus.status = "running";
    tasksStatusTable.value.push(tasksStatus);
    taskEvents.value.push(taskStartEvent);
    sendMessageToBackend(taskStartEvent);
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
    // Unregister hotkey bind with the task
    ipcRenderer.invoke("to-console", {
      action: "remove-hotkey-task",
      taskId: task.id,
      source: task.relTaskPath,
    });
  } else {
    // Cancel task running in the backend
    let newEvent = {
      event: EventType.I_EVENT_TASK_REQ,
      uuid: task.id,
      taskName: task.relTaskPath,
      source: "console",
      value: {
        type: "cancelTask",
      },
      stamp: new Date().toLocaleString(),
    };

    taskEvents.value.push(newEvent);
    sendMessageToBackend(newEvent);
  }
};

// Handle events from node process and task bar
eventBus.on("run-task-from-bar", (task) => {
  runTask(task);
});

ipcRenderer.on("to-main-win", (event, message) => {
  if (message.action === "run-task") {
    message.tasks.forEach((task) => {
      runTask(task);
    });
  }
});

ipcRenderer.on("uio-callback", (event, message) => {
  if (message.type === "keyWait") {
    let newEvent = {
      event: EventType.I_EVENT_TASK_REQ,
      uuid: message.taskId,
      taskName: message.source,
      source: "console.uio-hook",
      value: {
        type: "resumeTask",
        return: message.return,
      },
      stamp: new Date().toLocaleString(),
    };
    taskEvents.value.push(newEvent);
    sendMessageToBackend(newEvent);
    return;
  } else if (message.type === "hotkey") {
    // Run a new task with hotkey attribute disabled
    console.message("hotkey", message);
  }
});

const renderIcon = (icon, attrs = {}) => {
  return () => h(NIcon, null, { default: () => h(icon) });
};

const activeMenuItem = ref("apps");
const menuOptions = [
  {
    label: "Apps",
    key: "apps",
    icon: renderIcon(Apps),
  },
  {
    label: "Scheduler",
    key: "scheduler",
    icon: renderIcon(HeartRateMonitor),
  },
  {
    label: "Settings",
    key: "settings",
    icon: renderIcon(Settings),
  },
];

const refreshApps = async () => {
  await ipcRenderer.invoke("to-console", { action: "app-reload" });
  apps.value = appConfig.get("apps");
};
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
