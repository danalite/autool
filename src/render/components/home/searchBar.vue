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
      <n-button type="primary" ghost :bordered="false" @click="refreshApps">
        <n-icon size="20">
          <Refresh />
        </n-icon>
      </n-button>
    </n-input-group>

    <n-modal v-model:show="showModalRef" preset="dialog">
      <template #header>
        <div>
          Add new apps
        </div>
      </template>
      <div>
        <n-space vertical>
          <n-radio
            :checked="checkedValue === 'Import app from Github'"
            value="Import app from Github"
            @change="handleChange"
          >
            Import app from Github
          </n-radio>
          <n-input
            v-model:value="githubFolderLink"
            placeholder="E.g. https://github.com/danalites/apps/tree/master/macos"
            :disabled="checkedValue !== 'Import app from Github'"
          />

          <n-divider dashed />
          <n-radio
            :checked="checkedValue === 'Macro record'"
            value="Macro record"
            name="basic-demo"
            @change="handleChange"
          >
            Macro recorder
          </n-radio>

          <!-- stop/(re)start. 
          track (mouse, keyboard, delay)
          capture mouse mode (absPos, relPos, image) -->

          

        </n-space>
      </div>
      <template #action>
        <n-space>
          <n-button @click="onNegativeClick">Cancel</n-button>
          <n-button type="primary" @click="onPositiveClick">
            {{ checkedValue === 'Import app from Github' ? 'Import' : 'Record' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script>
import { h, ref, onMounted } from "vue";
import { Plus, Refresh, Filter } from "@vicons/tabler";

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
  NRadio,
  NDivider,
  NTabPane,
  NRate,
  NIcon,
  NModal,
} from "naive-ui";

export default {
  name: "taskPane",
  components: {
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
    NRadio,
    NDivider,
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
    Plus,
    Filter,
    Refresh,
  },
  emits: ["refreshApps"],
  setup(props, { emit }) {
    const message = useMessage();

    const githubFolderLink = ref("");
    const showModalRef = ref(false);
    const addNewApp = () => {
      showModalRef.value = true;
    };

    const onPositiveClick = () => {
      if (
        githubFolderLink.value === "" ||
        !githubFolderLink.value.startsWith("http")
      ) {
        message.warning("Please enter a valid link");
        return;
      }

      message.success(`Importing "${githubFolderLink.value}"...`);
      let wsConn = new WebSocket("ws://127.0.0.1:5678/");
      wsConn.onmessage = async (event) => {
        emit("refreshApps", {});
        wsConn.close();
      };
      wsConn.onopen = (event) => {
        let msg = {
          event: "I_EVENT_TASK_REQ",
          value: {
            type: "REQUEST",
            worker: "DownloadWorker",
            url: githubFolderLink.value,
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
      showModalRef.value = false;
    };

    const checkedValueRef = ref("Import app from Github");
    return {
      githubFolderLink,
      showModalRef,

      checkedValue: checkedValueRef,
      handleChange(e) {
        checkedValueRef.value = e.target.value;
      },
      refreshApps() {
        emit("refreshApps");
      },
      addNewApp,
      onPositiveClick,
      onNegativeClick,
    };
  },
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
