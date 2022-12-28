<template>
  <div>
    <header v-mouse-drag="handleChangePosition" class="frankTitle">
      <n-space :style="{ 'padding-left': '35px' }">
        <n-menu
          v-model:value="activeKey"
          mode="horizontal"
          :options="menuOptions"
        />
      </n-space>
      <div class="rightCorner">
        <n-space>
          <n-button text @click="handleMin" color="black">
            <n-icon size="25">
              <ChevronsDownRight />
            </n-icon>
          </n-button>

          <n-button text circle color="black" @click="closeWindow">
            <n-icon size="24">
              <circle-x />
            </n-icon>
          </n-button>
        </n-space>
      </div>
    </header>
    <n-space>
      <n-card class="boxShadow mainCard">
        <div>
          <n-space
            v-if="activeKey === 'app-editor'"
            vertical
            style="padding-bottom: 6px"
          >
            <n-space style="padding-bottom: 6px">
              <n-input-group>
                <n-button secondary size="small" type="info"> Author </n-button>
                <n-input
                  size="small"
                  :style="{ width: '220px' }"
                  v-model:value="appAuthor"
                />
              </n-input-group>
              <n-input-group>
                <n-button secondary size="small" type="info"> App </n-button>
                <n-input
                  size="small"
                  :style="{ width: '220px' }"
                  v-model:value="appName"
                />
              </n-input-group>
            </n-space>

            <n-space style="padding-bottom: 6px">
              <n-input-group>
                <n-button secondary size="small" type="info"> Path </n-button>
                <n-input
                  size="small"
                  disabled
                  :style="{ width: '620px' }"
                  v-model:value="newAppPath"
                />
              </n-input-group>
            </n-space>

            <n-space style="padding-bottom: 6px">
              <n-input-group>
                <n-button secondary size="small" type="info"> Icon </n-button>
                <n-input
                  size="small"
                  :style="{ width: '520px' }"
                  v-model:value="appIcon"
                />
                <n-avatar
                  size="small"
                  :src="appIcon"
                  :style="{ 'background-color': 'white' }"
                />
              </n-input-group>
            </n-space>

            <!-- Task lists -->
            <n-space vertical>
              <n-input-group>
                <n-button secondary size="small" type="info">
                  New tasks
                </n-button>
                <n-input
                  size="small"
                  placeholder="Input new task name"
                  :style="{ width: '220px' }"
                  v-model:value="newTask"
                />
                <n-button
                  size="small"
                  type="success"
                  @click="addTask"
                  :style="{ 'margin-left': '10px' }"
                >
                  <n-icon size="20">
                    <Plus />
                  </n-icon>
                </n-button>
              </n-input-group>

              <n-card
                class="boxShadow"
                :style="{ 'margin-top': '10px', 'border-radius': '10px' }"
              >
                <n-empty
                  description="No tasks in current app."
                  v-if="appTasks.length === 0"
                >
                </n-empty>
                <n-scrollbar style="max-height: 200px">
                  <n-space :style="{ width: '900px' }">
                    <n-space
                      justify="space-between"
                      v-for="task in appTasks"
                      :style="{ 'padding-left': '12px' }"
                    >
                      <n-button
                        text
                        :style="{ 'padding-top': '10px' }"
                        @click="switchToTaskEditor(task)"
                      >
                        {{ task }}
                      </n-button>

                      <n-button @click="deleteTask(task)">
                        <n-icon color="#db2544">
                          <Trash />
                        </n-icon>
                      </n-button>
                    </n-space>
                  </n-space>
                </n-scrollbar>
              </n-card>

              <n-space justify="end" :style="{ 'padding-top': '6px' }">
                <n-popconfirm
                  v-if="appEditMode === 'Save'"
                  @positive-click="deleteApp"
                  positive-text="Sure"
                  negative-text="Cancel"
                  :show-icon="false"
                >
                  <template #trigger>
                    <n-button
                      round
                      secondary
                      size="medium"
                      type="error"
                      :style="{ 'margin-right': '10px' }"
                    >
                      Delete
                    </n-button>
                  </template>
                  Confirm to delete the app?
                </n-popconfirm>

                <n-button
                  round
                  secondary
                  size="medium"
                  @click="saveApp"
                  :type="appEditMode === 'Save' ? 'primary' : 'info'"
                >
                  {{ appEditMode }}
                </n-button>
              </n-space>
            </n-space>
          </n-space>

          <n-space
            v-else-if="activeKey === 'task-editor'"
            vertical
            style="padding-bottom: 6px"
          >
            <div>
              <n-space style="padding-bottom: 6px">
                <n-input-group>
                  <n-button secondary size="small" type="info"> App </n-button>
                  <n-input
                    size="small"
                    :style="{ width: '180px' }"
                    v-model:value="appName"
                  />
                </n-input-group>
                <n-input-group>
                  <n-button secondary size="small" type="info"> Task </n-button>
                  <n-input
                    size="small"
                    :style="{ width: '220px' }"
                    v-model:value="taskName"
                  />
                  <n-button size="small" @click="renameTask">
                    <n-icon size="20">
                      <Pencil />
                    </n-icon>
                  </n-button>
                </n-input-group>
                <n-dropdown
                  trigger="hover"
                  :options="dropdownOptions"
                  @select="loadTemplate"
                >
                  <n-button color="#8a2be2" size="small">
                    <template #icon>
                      <n-icon>
                        <WorldDownload />
                      </n-icon>
                    </template>
                    Templates
                  </n-button>
                </n-dropdown>
              </n-space>
              <n-space>
                <n-input-group>
                  <n-button secondary size="small" type="info"> Path </n-button>
                  <n-input
                    disabled
                    size="small"
                    :style="{ width: '620px' }"
                    v-model:value="taskPath"
                  />
                </n-input-group>
              </n-space>
            </div>

            <codemirror
              v-model="taskCode"
              placeholder="Code goes here..."
              :style="{ height: '350px' }"
              :extensions="extensions"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
            />
            <n-space style="display: flex; justify-content: flex-end">
              <n-button
                secondary
                round
                size="small"
                type="primary"
                @click="runTask"
              >
                Run
              </n-button>
              <n-button
                secondary
                round
                size="small"
                type="primary"
                @click="saveTask"
              >
                Save
              </n-button>
            </n-space>
          </n-space>

          <n-space v-else vertical style="padding-bottom: 6px">
            <n-result
              status="404"
              title="Coming soon"
              description="Explore more open-sourced Aba scripts"
              style="padding-top: 50px"
            >
              <template #footer>
                <n-button>Join our community</n-button>
              </template>
            </n-result>
          </n-space>
        </div>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import {
  NCard,
  NSpace,
  NTag,
  NIcon,
  NInput,
  NInputGroup,
  NDropdown,
  NButton,
  NColorPicker,
  NPopover,
  NPopconfirm,
  NMenu,
  NEmpty,
  NResult,
  NAvatar,
  NScrollbar,
  useMessage,
} from "naive-ui";

import { onMounted, ref, watch, h, computed } from "vue";
import { appConfig } from "@/utils/main/config";
import {
  ChevronsDownRight,
  CircleX,
  WorldDownload,
  BrandAppstore,
  Edit,
  Plus,
  Apps,
  Pencil,
  Trash,
  Crosshair,
} from "@vicons/tabler";

import { ipcRenderer } from "electron";
import { useStore } from "@/render/store";
import { storeToRefs } from "pinia/dist/pinia";
import { codingTemplates } from "@/utils/main/templates";

import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import { StreamLanguage } from "@codemirror/language";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";

const myTheme = EditorView.theme({
  "&": {
    fontSize: "10pt",
    border: "0.5px solid #c0c0c0",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
});

const message = useMessage();
const extensions = [
  EditorView.lineWrapping,
  StreamLanguage.define(yaml),
  myTheme,
];

const appIcon = ref(
  "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
);

const appEditMode = ref("Save");
const appName = ref("");
const appTasks = ref([]);

const appAuthor = ref("");
const appPath = ref("");

const taskName = ref("");
const taskPath = ref("");
const taskCode = ref("");
const newTask = ref("");

const newAppPath = computed(() => {
  return appEditMode.value === "Save"
    ? appPath.value
    : appPath.value
        .replace("example-Author", appAuthor.value)
        .replace("example-App", appName.value);
});

ipcRenderer.on("render-task-code", (event, arg) => {
  taskCode.value = arg;
});

ipcRenderer.on("render-app", (event, arg) => {
  appTasks.value = arg.tasks;
  appIcon.value = arg.icon;
});

ipcRenderer.on("open-task-editor", (event, data) => {
  if (data.type === "task") {
    appName.value = data.app;
    appAuthor.value = data.author;
    appPath.value = data.appPath;

    taskPath.value = data.absTaskPath;
    taskCode.value = data.content;
    taskName.value = data.relTaskPath;
    activeKey.value = "task-editor";

    if (appTasks.value.length === 0) {
      ipcRenderer.send("load-app", { appPath: appPath.value });
    }
  } else {
    appName.value = data.app;
    appAuthor.value = data.author;
    appPath.value = data.appPath;
    appIcon.value = data.icon;
    appTasks.value = data.tasks;
    activeKey.value = "app-editor";

    if (data.tasks.length === 0) {
      appEditMode.value = "Create";
    } else {
      appEditMode.value = "Save";
    }
  }
});

onMounted(() => {
  let colorTitle = document.querySelectorAll(".n-color-picker-trigger__value");
  for (const colorTitleElement of colorTitle) {
    colorTitleElement.remove();
  }
});

const handleChangePosition = (pos) => {
  ipcRenderer.send("move-editor-window", {
    x: pos.x,
    y: pos.y,
  });
};

const closeWindow = () => {
  ipcRenderer.send("close-task-editor-window");
};

const handleMin = () => {
  ipcRenderer.send("min-task-editor-window");
};

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const activeKey = ref("task-editor");
const menuOptions = [
  {
    label: "App",
    key: "app-editor",
    icon: renderIcon(Apps),
  },
  {
    label: "Task",
    key: "task-editor",
    icon: renderIcon(Edit),
  },
  {
    label: "Stores",
    key: "app-stores",
    icon: renderIcon(BrandAppstore),
  },
];

const dropdownOptions = [
  {
    label: "Use a template to start quick",
    key: "title",
    disabled: true,
  },
  {
    label: "1. Macro record and replay",
    key: "macro-recording",
  },
  {
    label: "2. Screen image/text recognition",
    key: "screen-image-text-recognition",
  },
  {
    label: "3. Task configuration",
    key: "task-configuration",
  },
];

const loadTemplate = (key) => {
  taskCode.value = codingTemplates(String(key));
};

// Task actions from code editor window
const runTask = () => {
  message.info("Start running task (unsaved)");
  ipcRenderer.send("run-task", {
    name: taskName.value,
    appPath: appPath.value,
    content: taskCode.value,
  });
};

const renameTask = () => {
  ipcRenderer.send("rename-task", {
    name: taskName.value,
    oldPath: taskPath.value,
    appPath: appPath.value,
  });
  message.info(`Task ${taskName.value} renamed`);
};

const deleteTask = (targetTask) => {
  appTasks.value = appTasks.value.filter((task) => task !== targetTask);
  ipcRenderer.send("delete-task", {
    name: targetTask,
    appPath: appPath.value,
  });
  message.warning(`Task ${taskName.value} deleted`);
};

const saveTask = () => {
  let taskMsg = {
    task: taskName.value,
    taskPath: taskPath.value,
    content: taskCode.value,
    appPath: appPath.value,
  };
  ipcRenderer.send("save-task", JSON.stringify(taskMsg));
  message.success(`${taskName.value} saved`);
};

const addTask = () => {
  if (appTasks.value.includes(newTask.value)) {
    message.warning(`Task name ${newTask.value} duplicates.`);
  } else if (newTask.value === "") {
    message.warning(`Task name cannot be empty.`);
  } else {
    let newTaskName = newTask.value.replace(' ', '-')
    appTasks.value.push(newTaskName);
    newTask.value = "";
  }
};

const saveApp = () => {};

const deleteApp = () => {
  ipcRenderer.send("delete-app", { appPath: appPath.value });
  closeWindow();
};

const switchToTaskEditor = (task) => {
  activeKey.value = "task-editor";
  appEditMode.value = "Save";

  taskName.value = task;
  taskPath.value = appPath.value + task + ".yaml";

  // load or create an empty yaml if task not exists
  ipcRenderer.send("load-task", {
    name: task,
    path: taskPath.value,
    appPath: appPath.value,
  });
};
</script>

<style scoped>
.mainCard {
  margin-top: -12px;
  margin-left: 18px;
  margin-right: 18px;
  border-radius: 10px;
  height: 496px;
  width: 984px;
}

.suspension {
  position: absolute;
  top: 15px;
  right: 20px;
}

header {
  display: flex;
  width: 984px;
  height: 50px;
  justify-content: space-between;
  margin-top: 10px;
  margin-right: 16px;
  margin-left: 16px;
  margin-bottom: 10px;
}

.rightCorner {
  padding-top: 8px;
  margin-right: 3px;
}

.frankTitle {
  align-items: center;
}
</style>
