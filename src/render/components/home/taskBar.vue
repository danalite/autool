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
      <n-space style="padding-bottom: 2px; width: 330px">
        <n-button
          v-for="(task, taskIndex) in displayTasks"
          :key="taskIndex"
          :bordered="false"
          type="success"
          secondary
          size="tiny"
          style="margin-right: 0px; width: 154px"
          @click="runTargetTask($event)"
        >
          {{ task }}
        </n-button>
      </n-space>
      <n-input-group style="text-align: center">
        <n-button
          secondary
          size="tiny"
          color="black"
          style="margin-right: 0px"
          @click="decreasePage"
        >
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
} from "@vicons/tabler";

import { ipcRenderer } from "electron";
import { ref, onMounted, watch, computed } from "vue";
import { appConfig } from "@/utils/main/config";

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
const selectedTasks = ref([
  "keep-screen-alive",
  "auto-logout",
  "auto-login-admin",
]);

// Show selected tasks in a drop list
const runTargetTask = (e) => {
  console.log("selectedTasks", selectedTasks.value);
};

// total width = 333px. gap = 12px
// per char width = (333 - 12 * 2 - 6 * 6) / 38 = 7.1px
const displayTasks = computed(() => {
  if (selectedTasks.value.length == 0) {
    return [];
  }

  let page = Number(taskPage.value);
  let upper =
    page * 2 > selectedTasks.value.length
      ? selectedTasks.value.length
      : page * 2;
  return selectedTasks.value.slice((page - 1) * 2, upper);
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
