<template>
  <n-space justify="center">
    <n-input-group>
      <n-input :style="{ width: '100%' }" placeholder="Search Tasks" />
      <n-button type="primary" ghost> Search </n-button>
      <n-button type="primary" @click="addNewApp">
        <n-icon size="20">
          <Plus />
        </n-icon>
      </n-button>
    </n-input-group>

    <n-modal v-model:show="showModalRef" preset="dialog">
      <template #header>
        <div>
          <n-icon size="20">
            <Plus />
          </n-icon>
          Add new apps
        </div>
      </template>
      <div>
        <n-space vertical>
          App (github folder URL)
          <n-input
            v-model:value="githubFolderLink"
            placeholder="Link: https://github.com/danalites/apps/tree/master/nike"
          />
        </n-space>
      </div>
      <template #action>
        <n-space>
          <n-button @click="onNegativeClick">Cancel</n-button>
          <n-button type="primary" @click="onPositiveClick">Import</n-button>
        </n-space>
      </template>
    </n-modal>
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

const githubFolderLink = ref("");
const showModalRef = ref(false);
const addNewApp = () => {
  showModalRef.value = true;
};

const onPositiveClick = () => {
  if (githubFolderLink.value === "" || !githubFolderLink.value.startsWith("http")) {
    message.warning("Please enter a valid link");
    return;
  }
  
  message.success(`Importing "${githubFolderLink.value}"...`);
  let wsConn = new WebSocket("ws://127.0.0.1:5678/");
  wsConn.onmessage = (event) => {
    console.log("@@@", event);
    wsConn.close();
  };
  wsConn.onopen = (event) => {
    let msg = {
      event: "I_EVENT_TASK_REQ",
      value: {
        type: "REQUEST",
        worker: "DownloadWorker",
        url: githubFolderLink.value
      },
    };
    try {
      wsConn.send(JSON.stringify(msg));
    } catch (e) {
      console.log(e);
      message.warning("Failed downloading...");
    }
  };
  showModalRef.value = false;
};

const onNegativeClick = () => {
  message.success("Cancel");
  showModalRef.value = false;
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
