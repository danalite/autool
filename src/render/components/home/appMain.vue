<template>
  <div class="mainCard">
    <SearchBar @refreshApps="refreshApps" />

    <!-- Second block under user information -->
    <n-card class="boxShadow appCard" size="small">
      <n-tabs type="segment" :animated="true">
        <n-tab-pane style="padding-top: 3px" name="chap1" tab="Tasks">
          <TaskPane
            :apps="apps"
            @runTask="runTask($event)"
            @refreshApps="refreshApps"
          />
        </n-tab-pane>

        <n-tab-pane style="padding-top: 8px" name="chap2" tab="Scheduler">
          <TaskSch
            :apps="apps" 
            :taskEvents="taskEvents"
            :tasksStatusTable="tasksStatusTable"
            @stopTask="stopTask($event)"
          />
        </n-tab-pane>

      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { h, ref, onMounted } from "vue";
import { ipcRenderer } from "electron";
import {
  NCard,
  NAvatar,
  NProgress,
  NSpace,
  NTag,
  NPopover,
  NDrawer,
  NDrawerContent,
  NList,
  NListItem,
  NScrollbar,
  NButton,
  useMessage,
  useNotification,
  NTabs,
  NTabPane,
  NRate,
  NIcon,
} from "naive-ui";

import { PlayerPlay } from "@vicons/tabler";

import SearchBar from "./searchBar.vue";
import TaskPane from "./taskPane.vue";
import TaskSch from "./taskSch.vue";
import { appConfig } from "@/utils/main/config";

const EventType = {
  O_EVENT_TASK_STATUS: "O_EVENT_TASK_STATUS",
  O_EVENT_REG_EVENT_ON: "O_EVENT_REG_EVENT_ON",
  O_EVENT_REG_EVENT_REMOVE: "O_EVENT_REG_EVENT_REMOVE",
  O_EVENT_REG_EVENT_INVOKE: "O_EVENT_REG_EVENT_INVOKE",
  O_EVENT_HOOK_REQ: "O_EVENT_HOOK_REQ",

  I_EVENT_TASK_REQ: "I_EVENT_TASK_REQ",
  I_EVENT_USER_INPUT: "I_EVENT_USER_INPUT",
};

const message = useMessage();
const notification = useNotification();

const taskEvents = ref([]);
const tasksStatusTable = ref([]);

// local apps/tasks list
let apps = ref([]);

const backendEventHook = (data) => {
  const value = data.value;
  data.time = new Date().toLocaleString();
  taskEvents.value.push({'source': 'backend', ...data});

  switch (data.event) {

    // 1. Task finish or failure
    case EventType.O_EVENT_TASK_STATUS:
      const taskId = data.uuid;

      tasksStatusTable.value = tasksStatusTable.value.map((task) => {
        if (task.id === taskId) {
          task.status = value.type;
        }
        return task;
      });
      break;

    case EventType.O_EVENT_HOOK_REQ:
      message.info(`IO hook request: ${data.value.type}`);
      ipcRenderer.send("io-hook-request", data);
      break;

    default:
      break;
  }
};

let wsConn = null;
const sendMessageToBackend = (msg) => {
  try {
    wsConn.send(JSON.stringify(msg));
  } catch (e) {
    message.warning("Trying to reconnect to backend server...");
    setupWsConn();
  }
};

function uuid() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

const stopTask = (task) => {
  tasksStatusTable.value = tasksStatusTable.value.map((t) => {
    if (t.id === task.id) {
      t.status = "stopped";
    }
    return t;
  }
  );

  let newEvent = {
    event: EventType.I_EVENT_TASK_REQ,
    uuid: task.id,
    taskName: task.relTaskPath,
    source: "console",
    value: {
      type: "cancelTask",
    },
    time: new Date().toLocaleString(),
  };

  taskEvents.value.push(newEvent);
  sendMessageToBackend(newEvent);
};

const runTask = (task) => {
  // run task request from console/TaskSch
  const taskId = uuid();
  let tasksStatus = {
    id: taskId,
    taskName: task.relTaskPath,
    hotkey: task.hotkey,
    options: task.options,
    status: "",
    startTime: new Date().toLocaleString(),
  }

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
      time: new Date().toLocaleString(),
    };

  // 1. Stall task until hotkey is triggered. 
  if (task.hotkey) {

    let isKeyRegistered = tasksStatusTable.value.find((t) => t.hotkey === task.hotkey && t.status === "queued");

    if (isKeyRegistered) {
      message.warning(`Hotkey ${task.hotkey} is already registered for task ${isKeyRegistered.name}`);
      return;
    }
    
    tasksStatus.status = "queued";
    tasksStatusTable.value.push(tasksStatus);
    message.info(`Task ${task.relTaskPath} is waiting for hotkey ${task.hotkey}`);

    ipcRenderer.send("register-task-hotkey", {
      hotkey: task.hotkey,
      taskId: taskId,
    });

    ipcRenderer.on("task-hotkey-invoked", (event, data) => {
      if (data.taskId === taskId) {
        taskStartEvent.value.startTime = new Date().toLocaleString();
        taskEvents.value.push(taskStartEvent);
        sendMessageToBackend(taskStartEvent);
      }
    }
    );
  
  // 2. Wait for timer counts down
  } else if (task.startTime) {
    message.info(`Task ${task.relTaskPath} is scheduled to start at ${task.startTime}`);

  } else {
    // Start task right away
    tasksStatus.status = "running";
    tasksStatusTable.value.push(tasksStatus);
    taskEvents.value.push(taskStartEvent);
    sendMessageToBackend(taskStartEvent);
  }
};

// Main process invoked tasks
ipcRenderer.on("run-task-from-main", (event, data) => {
  if (!data.is_autostart) {
    data.tasks.forEach((task) => {
      runTask(task);
    });
    return;
  }

  let count = 12;
  let taskNames = data.tasks.map((t) => t.relTaskPath);
  let autoRun = true;

  const renderTaskList = (taskNames) => {
    return h(
      NList,
      { style: { 'margin-top': '-15px', 'margin-bottom': '-15px' } },
      {
        default: () =>
          taskNames.map((name) =>
            h(
              NListItem,
              { key: name, style: {} },
              {
                default: () =>
                  h(
                    NTag,
                    { closable: true, style: {}, type: "info" },
                    { default: () => name }
                  ),
              }
            )
          ),
      }
    );
  };

  const nRef = notification.create({
    title: "Auto run tasks?",
    content: () => renderTaskList(taskNames),
    duration: 12000,
    meta: "start in 12 seconds...",
    avatar: () =>
      h(
        NIcon,
        { color: "green" },
        {
          default: () => h(PlayerPlay),
        }
      ),
    action: () =>
      h(
        NButton,
        {
          type: "error",
          secondary: true,
          onClick: () => {
            autoRun = false;
            nRef.destroy();
          },
        },
        {
          default: () => h("span", { style: {} }, "Stop"),
        }
      ),
    onAfterEnter: () => {
      const minusCount = () => {
        count--;
        nRef.meta = `start in ${count} seconds...`;
        if (count > 0) {
          window.setTimeout(minusCount, 1e3);
        }
      };
      window.setTimeout(minusCount, 1e3);
    },
    onAfterLeave: () => {
      if (autoRun) {
        message.info("Starting autostart tasks...");
        data.tasks.forEach((task) => {
          runTask(task);
        });
      }
    },
  });
});

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
    };
    message.success("Connected to backend server.");
  } catch (e) {
    message.error("Failed. Backend not responding.", e);
    setTimeout(() => {
      setupWsConn();
    }, 5000);
  }
}


const refreshApps = async () => {
  await ipcRenderer.invoke("reload-apps", {});
  apps.value = appConfig.get("apps");
};

onMounted(async () => {
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

  // Event from user to backend (IO hook request/response)
  ipcRenderer.on("io-hook-resp", (event, data) => {
    sendMessageToBackend(data);
  });
});

const queryMatch = () => {
  ipcRenderer.send("show-query-match");
};

const getImaUrl = (imgUrl) => {
  return require(`../../assets/statstones/${imgUrl.toLowerCase()}`);
};
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);

.mainCard {
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

.n-card {
  border-radius: 10px;
  padding: 5px;
}

.n-avatar {
  float: left;
  margin-right: 15px;
  margin-top: 1px;
}

.appCard {
  margin-top: 15px;
  height: 500px;
}

.alignCenter {
  align-items: center;
}

.tagWidth {
  width: 85px;
  justify-content: center;
}

/* .fade-leave-active */
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.rightCorner {
  padding-top: 8px;
  margin-right: 3px;
}
</style>
