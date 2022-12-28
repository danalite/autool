<template>
  <header v-mouse-drag="handleDrag" class="frankTitle">
    <n-space class="frankTitle">
      <img
        src="../../assets/icon/app.png"
        draggable="false"
        alt=""
        width="40"
        @click="handleMin"
        v-if="isConnectSuccess != ''"
      />
      <img
        src="../../assets/icon/app-icon-bw.png"
        draggable="false"
        alt=""
        width="40"
        @click="handleMin"
        v-else
      />
      AuTool
      <!-- <img src="../../assets/icon/Frank.png" style="margin-top: 4px" /> -->
      <n-tag
        :bordered="false"
        round
        v-if="serverLatency > 0"
        type="success"
        size="small"
      >
        {{ serverLatency }}ms
      </n-tag>
      <n-tag :bordered="false" round v-else type="warning" size="small">
        offline
      </n-tag>
    </n-space>

    <n-space class="rightCorner">
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

      <!-- <n-button text circle color="black" @click="toSettingPage">
        <n-icon size="24">
          <settings />
        </n-icon>
      </n-button> -->

      <n-popconfirm
        @positive-click="handleClose"
        :show-icon="false"
        negative-text="cancel"
        positive-text="yes"
      >
        <template #trigger>
          <n-button text circle color="black">
            <n-icon size="24">
              <circle-x />
            </n-icon>
          </n-button>
        </template>
        Confirm to Exit?
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
  NTag,
  useMessage,
} from "naive-ui";
import {
  ChevronsDownRight,
  Settings,
  CircleX,
  ArrowLeft,
} from "@vicons/tabler";

import { useStore } from "@/render/store";
import { ipcRenderer } from "electron";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { appConfig } from "@/utils/main/config";
import { request } from "@/utils/render/request";

const store = useStore();
let { pageCount } = storeToRefs(store);

const message = useMessage();
let connFailureCount = 0

// let isConnectSuccess = ref(appConfig.get("credentials.port"));
let isConnectSuccess = ref(true);
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

ipcRenderer.once("client-connect-success", () => {
  isConnectSuccess.value = true;
});

function testLatency() {
  var start = new Date().getTime();
  request({
    url: "http://173.82.48.51:8080/ping",
    method: "GET",
  })
    .then((res) => {
      var lat = new Date().getTime() - start;
      serverLatency.value = lat;
      connFailureCount = 0
    })
    .catch((err) => {
      serverLatency.value = 0;
      if (connFailureCount === 0) {
        message.error("Cannot reach remote server. Please check internet connection");
      }
      connFailureCount++
    });
}

onMounted(() => {
  testLatency();
  let timer = setInterval(() => {
    testLatency();
    if (connFailureCount > 5) {
      clearInterval(timer)
    }
  }, 5000);
});
</script>

<style scoped>
header {
  display: flex;
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
