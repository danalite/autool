<template>
  <n-space v-mouse-drag="handleDrag" class="headerTitle" justify="center">
    <n-space class="headerTitle">
      <img
        src="../../assets/icon/logo.png"
        draggable="false"
        alt=""
        width="28"
        style="padding-top: 3px"
        @click="handleCollapse"
      />
      <n-text>AuTool</n-text>
      <!-- <n-tag
        :bordered="false"
        round
        style="padding-bottom: 0px"
        :type="serverLatency > 0 ? 'success' : 'warning'"
        size="small"
      >
        {{ serverLatency > 0 ? serverLatency + "ms" : "down" }}
      </n-tag> -->
    </n-space>
  </n-space>
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

const message = useMessage();

const handleDrag = (pos) => {
  ipcRenderer.send("move-main", {
    x: pos.x,
    y: pos.y,
  });
};

const handleCollapse = () => {
  store.pageReset(0);
  ipcRenderer.send("main-win-collapse", { width: 590, height: 40 });
  appConfig.set("mainWindowDimension.isCollapsed", true);
};

</script>

<style scoped>
header {
  display: flex;
  height: 35px;
  justify-content: space-between;
  margin: 0px;
}

.rightCorner {
  padding-top: 8px;
  margin-right: 8px;
}

.headerTitle {
  padding-top: 2px;
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
