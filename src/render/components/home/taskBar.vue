<template>
  <header v-mouse-drag="handleDrag" class="headerTitle">
    <n-space class="banner">
      <img
        src="../../assets/icon/logo.png"
        draggable="false"
        width="35"
        @click="handleCollapse"
      />
      <n-text>AuTool</n-text>
      <n-space style="padding-bottom: 2px; width: 340px">
        <!-- reminder if there is no selected tasks -->
        <n-button
          v-if="displayTasks.length == 0 && false"
          :bordered="false"
          secondary
          type="warning"
          size="tiny"
          style="margin-top: 3px;"
        >
          <template #icon>
            <n-icon>
              <Search />
            </n-icon>
          </template>
          check the checkbox to select tasks
        </n-button>

        <n-button
          v-for="(taskName, taskIndex) in displayTasks"
          :key="taskIndex"
          :bordered="false"
          :loading="loadingTask == taskName"
          type="success"
          secondary
          size="tiny"
          style="margin-right: 0px; width: 164px"
          @click="runTargetTask($event, taskName)"
        >
        <n-ellipsis style="max-width: 164px" :tooltip="false">
          {{ taskName }}
        </n-ellipsis>
        </n-button>
      </n-space>

      <n-input-group style="text-align: center" v-show="displayTasks.length > 0">
        <n-button secondary size="tiny" color="black" @click="decreasePage">
          <n-icon size="15">
            <ChevronLeft />
          </n-icon>
        </n-button>
        <n-input
          size="tiny"
          placeholder="1"
          v-model:value="taskPage"
          :allow-input="onlyAllowNumber"
          type="text"
          style="width: 30px"
        />
        <n-button
          secondary
          size="tiny"
          color="black"
          style="margin-right: 0px"
          @click="increasePage"
        >
          <n-icon size="15">
            <ChevronRight />
          </n-icon>
        </n-button>
      </n-input-group>
    </n-space>
  </header>
</template>

<script setup>
import {
  NIcon,
  NSpace,
  NButton,
  NEllipsis,
  NInput,
  NPopover,
  NPopconfirm,
  NScrollbar,
  NInputGroup,
  NCollapseTransition,
  NTag,
  NText,
  NAvatar,
  NPagination,
  useMessage,
} from "naive-ui";

import {
  ChevronsDownRight,
  Settings,
  CircleX,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
} from "@vicons/tabler";

import { ipcRenderer } from "electron";
import { ref, computed, onBeforeUpdate } from "vue";

import { appConfig } from "@/utils/main/config";
import eventBus from "@/utils/main/eventBus";

import { useStore } from "@/render/store";
const store = useStore();

const handleDrag = (pos) => {
  ipcRenderer.send("move-main", {
    x: pos.x,
    y: pos.y,
  });
};

const handleMinimize = () => {
  ipcRenderer.send("main-win-minimize");
};

const handleMin = () => {
  ipcRenderer.send("main-win-min");
};

const handleClose = () => {
  ipcRenderer.send("main-win-close");
};

const handleCollapse = () => {
  let isCollapsed = appConfig.get("mainWindowDimension.isCollapsed");

  let newDim = isCollapsed
    ? { width: 390, height: 650 }
    : { width: 580, height: 45 };
  newDim.isCollapsed = !isCollapsed;

  if (newDim.isCollapsed) {
    store.pageReset(0);
  } else {
    store.pageReset(1);
    document.getElementsByTagName("html")[0].className = "container";
  }
  ipcRenderer.send("main-win-resize", newDim);
  appConfig.set("mainWindowDimension", newDim);
};

const onlyAllowNumber = (value) => {
  if (value === "") return true;
  const number = Number(value);
  const isInteger = Number.isInteger(number);
  const isPositive = number > 0;
  return isInteger && isPositive;
};

const increasePage = () => {
  let newPage = Number(taskPage.value) + 1;
  if (newPage * 2 - 1 > selectedTasks.value.length) return;
  taskPage.value = String(Number(taskPage.value) + 1);
};

const decreasePage = () => {
  let num = Number(taskPage.value);
  if (num <= 1) return;
  taskPage.value = String(Number(taskPage.value) - 1);
};

// reLoad local apps before collapse
const taskPage = ref("1");
const selectedTasks = ref([]);
const selectedTaskNames = computed(() => {
  return selectedTasks.value.map((task) => task.relTaskPath);
});

onBeforeUpdate(async () => {
  let isCollapsed = appConfig.get("mainWindowDimension.isCollapsed");
  if (isCollapsed) {
    await ipcRenderer.invoke("to-console", {
      action: "app-reload",
    });
    let apps = appConfig.get("apps");
    selectedTasks.value = [];

    for (let i = 0; i < apps.length; i++) {
      let app = apps[i];
      for (let j = 0; j < app.tasks.length; j++) {
        let task = app.tasks[j];

        if (task.shortcut) {
          selectedTasks.value.push(task);
        }
      }
    }
  }
});

// Show selected tasks in a drop list
const loadingTask = ref("");
const runTargetTask = (e, taskName) => {
  let task = selectedTasks.value.find((task) => task.relTaskPath == taskName);
  eventBus.emit("run-task-from-bar", task);
  loadingTask.value = taskName;
  setTimeout(() => {
    loadingTask.value = "";
  }, 1500);
};

// total width = 333px. gap = 12px
// per char width = (333 - 12 * 2 - 6 * 6) / 38 = 7.1px
const displayTasks = computed(() => {
  if (selectedTaskNames.value.length == 0) {
    return [];
  }

  let page = Number(taskPage.value);
  let upper =
    page * 2 > selectedTaskNames.value.length
      ? selectedTaskNames.value.length
      : page * 2;
  return selectedTaskNames.value.slice((page - 1) * 2, upper);
});
</script>

<style scoped>
header {
  display: flex;
  height: 35px;
  padding-right: 0px;
  margin: 7px 8px 3px;
}

.rightCorner {
  padding-top: 8px;
  margin-right: 3px;
}

.headerTitle {
  align-items: center;
}

.n-text {
  /* font-weight: 560; */
  font-size: 20px;
  color: darkgray;
  line-height: 0.9em;
}

.banner {
  align-items: center;
  width: 100%;
  flex-wrap: nowrap !important;
}
</style>
