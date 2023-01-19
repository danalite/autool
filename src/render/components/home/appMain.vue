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
            :tasksPending="tasksPending"
            :tasksEnded="tasksEnded"
            @stopTask="stopTask($event)"
          />
        </n-tab-pane>

        <!-- <n-tab-pane style="padding-top: 5px" name="chap3" tab="Events">
          <TaskEvents
            :taskEventsIn="taskEventsIn"
            :taskEventsOut="taskEventsOut"
          />
        </n-tab-pane> -->
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
import TaskEvents from "./taskEvents.vue";
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

const taskEventsIn = ref([]);
const taskEventsOut = ref([]);
const tasksPending = ref([]);
const tasksEnded = ref([]);
let apps = ref([]);

const backendEventHandle = (data) => {
  const value = data.value;
  data.time = new Date().toLocaleString();
  taskEventsOut.value.push(data);

  switch (data.event) {
    case EventType.O_EVENT_TASK_STATUS:
      // Task status updates (e.g., finish, failed)
      const taskId = data.uuid;
      const task = tasksPending.value.find((t) => t.id === taskId);
      tasksPending.value = tasksPending.value.filter(
        (task) => task.id !== taskId
      );
      tasksEnded.value.push({
        id: taskId,
        name: value.name,
        options: task.options,
        status: value.type,
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
  tasksPending.value = tasksPending.value.filter((t) => t.id !== task.id);
  tasksEnded.value.push({
    id: task.id,
    name: task.name,
    options: task.options,
    status: "stopped",
  });

  let newEvent = {
    event: EventType.I_EVENT_TASK_REQ,
    uuid: task.id,
    value: {
      type: "cancelTask",
    },
    time: new Date().toLocaleString(),
  };

  taskEventsIn.value.push(newEvent);
  sendMessageToBackend(newEvent);
};

const runTask = (task) => {
  const taskId = uuid();
  // Track pending tasks
  const taskStatus = {
    id: taskId,
    name: task.relTaskPath,
    options: task.options,
    status: "running",
    startTime: new Date().toLocaleString(),
  };
  tasksPending.value.push(taskStatus);

  // Start task immediately or stall depending on hotkey
  if (task.hotkey) {
  } else {
    // console.log("@@", task)
    const newEvent = {
      event: EventType.I_EVENT_TASK_REQ,
      uuid: taskId,
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
    taskEventsIn.value.push(newEvent);
    sendMessageToBackend(newEvent);
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
      backendEventHandle(data);
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
