<template>
  <n-space justify="center">
    <n-input-group>
      <n-input :style="{ width: '100%' }" placeholder="Find tasks of interests"/>
      <n-button type="primary" ghost> Search </n-button>
      <n-button type="primary" @click="openTaskEditor">
        <n-icon size="20">
          <Plus />
        </n-icon>
      </n-button>
    </n-input-group>
  </n-space>
</template>

<script setup>
import { h, ref, onMounted } from "vue";
import { ipcRenderer } from "electron";
import { Plus } from "@vicons/tabler";

import {
  NCard,
  NAvatar,
  NProgress,
  NSpace,
  NTag,
  NPopover,
  NDrawer,
  NDrawerContent,
  NInput,
  NInputGroup,
  NList,
  NListItem,
  NScrollbar,
  NDataTable,
  NButton,
  useMessage,
  NTabs,
  NTabPane,
  NRate,
  NIcon,
  NModal,
} from "naive-ui";

const message = useMessage();
const openTaskEditor = () => {
  message.info("Opening Task Editor to create new app...");
  let app = {
    "type": "app",
    "app": "app-name",
    "author": "your-name",
    "path": "",
    "tasks": []
  }
  ipcRenderer.send("show-editor-window", JSON.stringify(app));
};

</script>

<style scoped>
.n-card {
  border-radius: 10px;
  padding: 5px;
}

.n-avatar {
  float: left;
  margin-right: 15px;
  margin-top: 1px;
}
</style>
