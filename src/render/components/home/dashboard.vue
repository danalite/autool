<template>
  <header v-mouse-drag="handleDrag" class="headerTitle">
    <n-space class="headerTitle">
      <img
        src="../../assets/icon/logo.png"
        draggable="false"
        alt=""
        width="35"
        @click="handleCollapse"
      />
      <n-text>AuTool</n-text>
      <n-space>
        <n-input-group>
          <n-tag
            :bordered="false"
            round
            :type="serverLatency > 0 ? 'success' : 'warning'"
            size="small"
          >
            {{ serverLatency > 0 ? serverLatency + "ms" : "down" }}
          </n-tag>
          <!-- <n-tag :bordered="false" round size="small" type="warning">80%</n-tag> -->
        </n-input-group>
      </n-space>
    </n-space>

    <n-space class="rightCorner" v-show="pageCount > 0">
      <n-popover :show-arrow="false" trigger="hover" :delay="200">
        <template #trigger>
          <n-button text @click="toSettingPage">
            <n-icon v-if="pageCount == 1" size="25">
              <Settings />
            </n-icon>
            <n-icon v-else-if="pageCount == 2" size="25" color="#ff69b4">
              <ArrowLeft />
            </n-icon>
          </n-button>
        </template>
        {{ pageCount == 1 ? "Settings" : "Back" }}
      </n-popover>

      <n-popover :show-arrow="false" trigger="hover" :delay="1000">
        <template #trigger>
          <n-button text @click="handleMin" color="black">
            <n-icon size="25">
              <chevrons-down-right />
            </n-icon>
          </n-button>
        </template>
        Minimize
      </n-popover>

      <n-popconfirm
        positive-text="Yes"
        negative-text="Cancel"
        @positive-click="handleClose"
      >
        <template #trigger>
          <n-button text circle color="black">
            <n-icon size="24">
              <X />
            </n-icon>
          </n-button>
        </template>
        Sure to exit app?
      </n-popconfirm>
    </n-space>
  </header>
</template>

<script setup>
import {
  NIcon,
  NSpace,
  NButton,
  NPopover,
  NPopconfirm,
  NScrollbar,
  NInputGroup,
  NCollapseTransition,
  NTag,
  NText,
  NAvatar,
  useMessage,
} from "naive-ui";

import {
  ChevronsDownRight,
  Settings,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "@vicons/tabler";

import { useStore } from "@/render/store";
import { ipcRenderer } from "electron";
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { appConfig } from "@/utils/main/config";
import { request } from "@/utils/render/request";

const store = useStore();
let { pageCount } = storeToRefs(store);

const message = useMessage();
let connFailureCount = 0;
let serverLatency = ref(0);

const toSettingPage = () => {
  store.pageIncrease();
};

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
  }
  ipcRenderer.send("main-win-resize", newDim);
  appConfig.set("mainWindowDimension", newDim);
};

function testLatency() {
  var start = new Date().getTime();
  request({
    url: "http://173.82.48.51:8080/ping",
    method: "GET",
  })
    .then((res) => {
      var lat = new Date().getTime() - start;
      serverLatency.value = lat;
      connFailureCount = 0;
    })
    .catch((err) => {
      serverLatency.value = 0;
      if (connFailureCount === 0) {
        connFailureCount++;
        message.error(
          "Cannot reach remote server. Please check internet connection"
        );
      }
    });
}

onMounted(() => {
  testLatency();
  let timer = setInterval(() => {
    testLatency();
    if (connFailureCount > 5) {
      clearInterval(timer);
    }
  }, 5000);
});
</script>

<style scoped>
header {
  display: flex;
  height: 50px;
  justify-content: space-between;
  margin: 10px 16px 10px;
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

.n-pagination > .n-pagination-quick-jumper > .n-input {
  width: 25px;
}
</style>
