<template>
  <n-space justify="center">
    <n-input-group>
      <n-dropdown
        trigger="click"
        :options="taskTypeOptions"
        @select="handleTaskTypeSelect"
      >
        <n-button type="primary">
          <n-icon size="20">
            <Search />
          </n-icon>
        </n-button>
      </n-dropdown>

      <n-input :style="{ width: '100%' }" placeholder="Search tasks" />
      <n-button type="primary" @click="addNewApp" ghost>
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
        <div>Add new apps</div>
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
          <n-collapse-transition :show="checkedValue !== 'Import app from Github'">
          <n-space vertical :style="'padding-left: 20px'" justify="center">
          

            <n-checkbox-group
              v-model:value="trackTarget"
              :disabled="checkedValue !== 'Macro record'"
            >
              <n-space item-style="display: flex;">
                <n-checkbox value="mouse-click" label="mouse click" />
                <n-checkbox value="mouse-move" label="mouse move" />
                <n-checkbox value="keyboard" label="key up+down" />
                <n-checkbox value="delay" label="time delay" />
              </n-space>
            </n-checkbox-group>

            <n-input-group>
              <n-tag type="primary" :bordered="false">Start</n-tag>
              <n-input
                size="small"
                style="width: 150px"
                placeholder="Ctrl+Shift+I"
              />
            </n-input-group>
            <n-input-group>
              <n-tag type="primary" :bordered="false">Stop&nbsp;</n-tag>
              <n-input
                size="small"
                style="width: 150px"
                placeholder="Ctrl+Shift+P"
              />
            </n-input-group>

            <!-- Mouse click recording types -->
           
              
              <n-input-group>
                <n-tag size="medium" type="primary" :bordered="false">Mouse click record</n-tag>
                <n-popselect 
          
                v-model:value="mouseClickRecordType" :options="mouseRecordTypes">
    <n-button size="small">{{ mouseClickRecordType }}</n-button>
  </n-popselect>

            </n-input-group>

          
          </n-space>
        </n-collapse-transition>
        </n-space>
      </div>
      <template #action>
        <n-space>
          <n-button @click="onNegativeClick">Cancel</n-button>
          <n-button type="primary" @click="onPositiveClick">
            {{
              checkedValue === "Import app from Github" ? "Import" : "Record"
            }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script>
import { h, ref, onMounted } from "vue";
import {
  Plus,
  Refresh,
  Filter,
  Search,
  BrandAndroid,
  Clock,
  Keyboard,
  Cloud,
  Checkbox,
} from "@vicons/tabler";

import {
  NCard,
  NAvatar,
  NProgress,
  NSpace,
  NTag,
  NPopover,
  NCollapseTransition,
  NDrawer,
  NDrawerContent,
  NInput,
  NInputGroup,
  NList,
  NListItem,
  NScrollbar,
  NCheckboxGroup,
  NCheckbox,
  NDataTable,
  NDropdown,
  NButton,
  useMessage,
  NTabs,
  NRadio,
  NRadioButton,
  NRadioGroup,
  NPopselect,
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
    NCollapseTransition,
    NDrawer,
    NDrawerContent,
    NInput,
    NInputGroup,
    NRadio,
    NPopselect,
    NRadioButton,
    NRadioGroup,
    NDivider,
    NList,
    NListItem,
    NScrollbar,
    NDataTable,
    NDropdown,
    NButton,
    useMessage,
    NTabs,
    NTabPane,
    NRate,
    NIcon,
    NModal,
    NCheckboxGroup,
    NCheckbox,
    Plus,
    Filter,
    Refresh,
    Search,
    BrandAndroid,
    Clock,
    Keyboard,
    Cloud,
    Checkbox,
  },
  emits: ["refreshApps"],
  setup(props, { emit }) {
    const message = useMessage();

    const renderIcon = (icon, attrs) => {
      return () => {
        return h(NIcon, attrs, {
          default: () => h(icon),
        });
      };
    };

    // task type dropdown (i.e. YAMLs)
    const handleTaskTypeSelect = (option) => {
      message.info(String(option));
    };

    const taskTypeOptions = [
      {
        label: "All tasks",
        key: "all",
        icon: renderIcon(Filter, { size: 20 }),
      },
      {
        label: "Selected",
        key: "selected",
        icon: renderIcon(Checkbox, { size: 20, color: "#4caf50" }),
      },
      {
        label: "Auto-start",
        key: "autostart",
        icon: renderIcon(BrandAndroid, { size: 20, color: "#4caf50" }),
      },
      {
        label: "Scheduled",
        key: "scheduled",
        icon: renderIcon(Clock, { color: "#2685c2", size: 20 }),
      },
      {
        label: "Hotkey",
        key: "hotkey",
        icon: renderIcon(Keyboard, { size: 20, color: "grey" }),
      },
      {
        label: "Remote",
        key: "remote",
        icon: renderIcon(Cloud, { size: 20, color: "#2685c2" }),
      },
    ];

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

    const trackTarget = ref(["mouse-click", "delay", "keyboard"]);
    const checkedValueRef = ref("Import app from Github");
    const mouseClickRecordType = ref('position');
    const mouseRecordTypes = [
      {
        value: "position",
        label: "position",
      },
      {
        value: "icon capture",
        label: "icon capture",
      },
    ];
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

      mouseRecordTypes,
      mouseClickRecordType,
      trackTarget,
      taskTypeOptions,
      handleTaskTypeSelect,
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
