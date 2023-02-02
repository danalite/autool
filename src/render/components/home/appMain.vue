<template>
  <n-collapse-transition :show="pageCount > 0">
    <div class="mainCard">
      <SearchBar @refreshApps="refreshApps" />

      <!-- Second block under user information -->
      <n-card class="boxShadow appCard" size="small">
        <n-tabs type="segment" :animated="true" v-model:value="currentTab">
          <n-tab-pane style="padding-top: 3px" name="taskPane" tab="Tasks">
            <TaskPane
              :apps="apps"
              @runTask="runTask($event)"
              @refreshApps="refreshApps"
            />
          </n-tab-pane>

          <n-tab-pane style="padding-top: 8px" name="taskSch" tab="Scheduler">
            <TaskSch
              :taskEvents="taskEvents"
              :tasksStatusTable="tasksStatusTable"
              @runTask="runTask($event)"
              @stopTask="stopTask($event)"
            />
          </n-tab-pane>
        </n-tabs>
        <n-button
          v-show="currentTab == 'taskPane'"
          type="success"
          tertiary
          circle
          @click="addNewApp"
          class="floatRight"
        >
          <n-icon size="23">
            <Plus />
          </n-icon>
        </n-button>
      </n-card>

      <n-modal v-model:show="showModalRef" preset="dialog">
        <template #header>
          <div style="padding-left: 10px">New app</div>
        </template>
        <div>
          <n-space vertical style="padding-left: 5px">
            <n-radio
              :checked="checkedValue === 'template'"
              value="template"
              @change="handleChange"
            >
              Quick task templates
            </n-radio>

            <n-collapse-transition :show="checkedValue == 'template'">
              <n-space vertical>
                <n-space justify="center">
                  <n-input-group
                    style="
                      width: 250px;
                      padding-top: 10px;
                      padding-bottom: 10px;
                    "
                  >
                    <n-button
                      size="small"
                      type="info"
                      secondary
                      style="padding-top: 10px; padding-bottom: 10px"
                      >App
                    </n-button>
                    <n-select
                      placeholder="Select app to import"
                      :default-value="appOptions[0].value"
                      size="small"
                      :options="appOptions"
                      :render-label="renderLabel"
                      :render-tag="renderSingleSelectTag"
                    />
                  </n-input-group>
                </n-space>

                <n-space style="padding-left: 10px">
                  <n-button size="small">
                    Send an iMessage to someone
                  </n-button>

                  <n-button size="small"> Open a website with proxy </n-button>
                </n-space>
              </n-space>
            </n-collapse-transition>

            <n-divider dashed style="margin: 5px" />

            <n-radio
              :checked="checkedValue === 'github-import'"
              value="github-import"
              @change="handleChange"
            >
              Download
            </n-radio>
            <n-collapse-transition :show="checkedValue == 'github-import'">
              <n-space vertical justify="center">
                <n-input
                  size="small"
                  v-model:value="githubFolderLink"
                  placeholder="E.g. https://github.com/danalites/apps/tree/master/macos"
                  :disabled="checkedValue !== 'github-import'"
                />

                <n-space justify="center">
                  <n-button text type="info" size="tiny">
                    <template #icon>
                      <n-icon>
                        <Search />
                      </n-icon>
                    </template>
                    more FREE apps in store!
                  </n-button>
                </n-space>
              </n-space>
            </n-collapse-transition>

            <n-divider dashed style="margin: 5px" />
            <n-radio
              :checked="checkedValue === 'macro-record'"
              value="macro-record"
              @change="handleChange"
            >
              Macro recorder
            </n-radio>
            <n-collapse-transition :show="checkedValue === 'macro-record'">
              <n-space vertical :style="'padding-left: 20px'" justify="center">
                <n-input-group
                  style="width: 250px; padding-top: 5px; padding-bottom: 5px"
                >
                  <n-button
                    size="small"
                    type="info"
                    secondary
                    style="padding-top: 10px; padding-bottom: 10px"
                    >App
                  </n-button>
                  <n-select
                    placeholder="Select app to import"
                    :default-value="appOptions[0].value"
                    size="small"
                    :options="appOptions"
                    :render-label="renderLabel"
                    :render-tag="renderSingleSelectTag"
                  />
                </n-input-group>
                <n-input-group style="width: 250px; padding-bottom: 5px">
                  <n-button
                    size="small"
                    type="info"
                    secondary
                    style="padding-top: 10px; padding-bottom: 10px"
                    >Task
                  </n-button>
                  <n-input size="small" placeholder="E.g., my-record-001" />
                </n-input-group>

                <n-checkbox-group v-model:value="macroRecordOptions">
                  <n-space item-style="display: flex;" vertical>
                    <n-checkbox
                      disabled
                      checked
                      value="mouse-keyboard"
                      label="mouse-click and keyboard"
                    />
                    <n-checkbox
                      disabled
                      value="mouse click by image"
                      label="mouse-click-by-image"
                    />
                    <n-checkbox value="mouse-movement" label="mouse-movement" />
                    <n-checkbox value="delay" label="time" />
                  </n-space>
                </n-checkbox-group>

                <n-space justify="center">
                  <n-tooltip :style="{ maxWidth: '400px' }" trigger="hover">
                    <template #trigger>
                      <n-button text type="info" size="tiny">
                        <template #icon>
                          <n-icon>
                            <Search />
                          </n-icon>
                        </template>
                        how to record macro?
                      </n-button>
                    </template>
                    Start: Shift + Shift
                    <br />
                    Stop&nbsp;: Command + Command
                  </n-tooltip>
                </n-space>
              </n-space>
            </n-collapse-transition>
          </n-space>
        </div>
        <template #action>
          <n-space>
            <n-button @click="closeModal">Cancel</n-button>
            <n-button type="primary" @click="importNewApp">
              {{ checkedValue === "macro-record" ? "Record" : "Import" }}
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </div>
  </n-collapse-transition>
</template>

<script setup>
import { h, ref, onMounted, watch, computed } from "vue";
import { ipcRenderer } from "electron";
import {
  NCard,
  NAvatar,
  NSpace,
  NTag,
  NIcon,
  NPopover,
  NRadio,
  NSelect,
  NDivider,
  NInput,
  NInputGroup,
  NCheckbox,
  NCheckboxGroup,
  NTooltip,
  NModal,
  NText,
  NScrollbar,
  NButton,
  NCollapseTransition,
  useMessage,
  NTabs,
  NTabPane,
  NRate,
} from "naive-ui";

import { PlayerPlay, Plus, Search, ChevronRight } from "@vicons/tabler";

import SearchBar from "./searchBar.vue";
import TaskPane from "./taskPane.vue";
import TaskSch from "./taskSch.vue";

import { appConfig } from "@/utils/main/config";
import { useStore } from "@/render/store";
import { storeToRefs } from "pinia/dist/pinia";

import eventBus from "@/utils/main/eventBus";

const store = useStore();
let { pageCount } = storeToRefs(store);

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
const taskEvents = ref([]);
const tasksStatusTable = ref([]);
const apps = ref([]);

const backendEventHook = (message) => {
  const value = message.value;
  message.time = new Date().toLocaleString();
  taskEvents.value.push({ source: "backend", ...message });

  switch (message.event) {
    case EventType.O_EVENT_TASK_STATUS:
      const taskId = message.uuid;
      // Update task status upon hook invoked
      tasksStatusTable.value = tasksStatusTable.value.map((task) => {
        if (task.id === taskId) {
          task.status = value.type;
        }
        return task;
      });
      break;

    case EventType.O_EVENT_HOOK_REQ:
      // console.log("@@", JSON.stringify(message))
      ipcRenderer.invoke("to-console", {
        action: "uio-event",
        taskId: message.uuid,
        source: message.taskName,
        ...value,
      });
      break;

    default:
      console.log(message.event, message);
      break;
  }
};

let wsConn = null;
const sendMessageToBackend = (message) => {
  try {
    if (wsConn === null) {
      console.log("wsConn is null, trying to reconnect...");
      setupWsConn();
    } else if (wsConn.readyState !== WebSocket.OPEN) {
      wsConn.close();
      console.log("wsConn is closed, trying to reconnect...");
      setupWsConn();
    }
    wsConn.send(JSON.stringify(message));
  } catch (e) {
    console.log(JSON.stringify(e), "Trying to reconnect to backend server...");
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

  // Scheduled task is auto discarded with timer unmounted 
  if (isScheduledTask) {
    return 
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
      time: new Date().toLocaleString(),
    };

    taskEvents.value.push(newEvent);
    sendMessageToBackend(newEvent);
  }
};

ipcRenderer.on("uio-callback", (event, message) => {
  console.log("@@@", message);
  // taskStartEvent.value.stamp = new Date().toLocaleString();
  // taskEvents.value.push(taskStartEvent);
  // sendMessageToBackend(taskStartEvent);
});

const runTask = async (task) => {
  // run task request from console/TaskSch
  const taskId = uuid();
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
    tasksStatusTable.value.push(tasksStatus);
    message.success(`"${task.relTaskPath}"" bind with ${task.hotkey}`);

    // The hotkey remains registered until the task is stopped
    await ipcRenderer.invoke("to-console", {
      action: "uio-event",
      type: "register-hotkey",
      hotkey: task.hotkey,
      source: "console.appMain",
    });
  } else if (task.startTime) {
    // 2. Wait for timer counts down
    let callback = "parse-cron-result";

    ipcRenderer.once(callback, (event, message) => {
      tasksStatus.status = "scheduled";
      tasksStatus.nextDates = message.nextDates;
      tasksStatusTable.value.push(tasksStatus);
      // message.info(
      //   `Task ${task.relTaskPath} is scheduled to start at ${task.startTime}`
      // );
    });

    ipcRenderer.invoke("to-console", {
      action: "task-cron-parse",
      startTime: task.startTime,
      taskName: task.relTaskPath,
      callback: callback,
    });
  } else {
    // Start task right away
    tasksStatus.status = "running";
    tasksStatusTable.value.push(tasksStatus);
    taskEvents.value.push(taskStartEvent);
    sendMessageToBackend(taskStartEvent);
  }
};

eventBus.on("run-task-from-bar", (task) => {
  runTask(task);
});

// Main process invoked tasks
ipcRenderer.on("to-main-win", (event, message) => {
  if (message.action === "run-task") {
    message.tasks.forEach((task) => {
      runTask(task);
    });
  }
});

function setupWsConn() {
  try {
    if (wsConn) {
      wsConn.close();
    }
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
    wsConn.onerror = (e) => {
      message.error("wsConn error", e);
    };
    console.log("Connected to backend server.");
  } catch (e) {
    console.log("Failed. Backend not responding.", e);
    setTimeout(() => {
      setupWsConn();
    }, 5000);
  }
}

const refreshApps = async () => {
  await ipcRenderer.invoke("to-console", { action: "app-reload" });
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
  ipcRenderer.on("to-backend", (event, data) => {
    sendMessageToBackend(data);
  });
});

const currentTab = ref("taskPane");
watch(currentTab, (val) => {
  eventBus.emit("switch-tab", { tab: val });
});

// Add new app modal
const checkedValue = ref("template");
const githubFolderLink = ref("");
const showModalRef = ref(false);

const appOptions = computed(() => {
  return apps.value.map((app) => {
    return {
      label: app.app,
      value: app.author + "/" + app.app,
      path: app.path,
      icon: app.icon,
      description: "© " + app.author,
    };
  });
});

const handleChange = (e) => {
  checkedValue.value = e.target.value;
};

const addNewApp = () => {
  showModalRef.value = true;
};

const downloadAppFromGithub = (link) => {
  if (wsConn === null) {
    message.warning("Backend disconnected. Failed downloading...");
    return;
  }
  let message = {
    event: "I_EVENT_WSS_REQUEST",
    action: "download",
    url: link,
  };
  try {
    wsConn.send(JSON.stringify(message));
  } catch (e) {
    console.log(e);
    message.warning("Failed downloading...");
  }
  showModalRef.value = false;
};

const macroRecordOptions = ref(["mouse-keyboard"]);
const importNewApp = async () => {
  if (checkedValue.value === "github-import") {
    if (
      githubFolderLink.value === "" ||
      !githubFolderLink.value.startsWith("http")
    ) {
      message.warning("Please enter a valid link");
      return;
    }
    downloadAppFromGithub(githubFolderLink.value);
  } else {
    // Send request to console to register Uio event
    await ipcRenderer.invoke("to-console", {
      action: "uio-event",
      type: "macro-record",
      options: [...macroRecordOptions.value],
      source: "console.mainApp",
    });
    showModalRef.value = false;
  }
};

const closeModal = () => {
  showModalRef.value = false;
};

const renderLabel = (option) => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [
      h(NAvatar, {
        src: option.icon,
        size: 25,
        style: {
          borderRadius: "2px",
          backgroundColor: "#ffffff",
        },
        bordered: false,
      }),
      h(
        "div",
        {
          style: {
            marginLeft: "12px",
            padding: "4px 0",
          },
        },
        [
          h("div", null, [option.label]),
          h(
            NText,
            { depth: 3, tag: "div" },
            {
              default: () => option.description,
            }
          ),
        ]
      ),
    ]
  );
};

const renderSingleSelectTag = ({ option }) => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [
      h(NAvatar, {
        src: option.icon,
        round: false,
        size: 24,
        style: {
          marginRight: "12px",
        },
      }),
      option.label,
    ]
  );
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

.floatRight {
  position: fixed;
  bottom: 50px;
  right: 40px;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.2),
    0 5px 12px 4px rgba(0, 0, 0, 0.04);
}
</style>
