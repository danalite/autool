<template>
  <n-space justify="center">
    <n-input-group>
      <n-dropdown
        trigger="click"
        :options="isTaskPaneTab ? taskTypeOptions : instancesTypeOptions"
        @select="handleTaskTypeSelect"
      >
        <n-button type="primary">
          <n-icon size="20">
            <Search />
          </n-icon>
        </n-button>
      </n-dropdown>

      <n-input
        :style="{ width: '100%' }"
        placeholder="search keywords"
        v-model:value="searchKeyword"
      />
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
          <n-collapse-transition
            :show="checkedValue == 'Import app from Github'"
          >
            <n-space vertical justify="center">
              <n-input
                size="small"
                v-model:value="githubFolderLink"
                placeholder="E.g. https://github.com/danalites/apps/tree/master/macos"
                :disabled="checkedValue !== 'Import app from Github'"
              />

              <n-space justify="center">
                <n-button text type="info" size="tiny">
                  <template #icon>
                    <n-icon>
                      <Search />
                    </n-icon>
                  </template>
                  more FREE apps in store!
                </n-button>
              </n-space>
            </n-space>
          </n-collapse-transition>

          <n-divider dashed />
          <n-radio
            :checked="checkedValue === 'Macro record'"
            value="Macro record"
            @change="handleChange"
          >
            Macro recorder
          </n-radio>
          <n-collapse-transition
            :show="checkedValue !== 'Import app from Github'"
          >
            <n-space vertical :style="'padding-left: 20px'" justify="center">
              <n-input
                size="small"
                placeholder="E.g., action-record-feb-2021"
              />
              <n-space item-style="display: flex;" vertical>
                <n-checkbox
                  disabled
                  checked
                  value="mouse-keyboard"
                  label="mouse-click and keyboard"
                />
                <n-checkbox
                  value="mouse click by image"
                  label="mouse-click-by-image"
                />
                <n-checkbox value="mouse-movement" label="mouse-movement" />
                <n-checkbox value="delay" label="time delay" />
              </n-space>
              <n-space justify="center">
                <n-tooltip :style="{ maxWidth: '400px' }" trigger="hover">
                  <template #trigger>
                    <n-button text type="info" size="tiny">
                      <template #icon>
                        <n-icon>
                          <Search />
                        </n-icon>
                      </template>
                      how to record macro?
                    </n-button>
                  </template>
                  Start: Ctrl + 1
                  <br />
                  Stop&nbsp;: Ctrl + 2
                  <br />
                  Pause: Ctrl + 3
                </n-tooltip>
              </n-space>
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
import { h, ref, onMounted, watch } from "vue";
import eventBus from "@/utils/main/eventBus";
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
  PlayerPause,
} from "@vicons/tabler";

import {
  NCard,
  NSpace,
  NTag,
  NPopover,
  NCollapseTransition,
  NDrawer,
  NDrawerContent,
  NInput,
  NInputGroup,
  NScrollbar,
  NCheckboxGroup,
  NCheckbox,
  NDropdown,
  NButton,
  useMessage,
  NTabs,
  NRadio,
  NRadioButton,
  NRadioGroup,
  NPopselect,
  NDivider,
  NTooltip,
  NTabPane,
  NIcon,
  NModal,
} from "naive-ui";

export default {
  name: "taskPane",
  components: {
    NCard,
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
    NScrollbar,
    NDropdown,
    NButton,
    useMessage,
    NTabs,
    NTabPane,
    NTooltip,
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
    PlayerPause,
    eventBus,
  },
  emits: ["refreshApps"],
  setup(props, { emit }) {
    const searchKeyword = ref("");
    const message = useMessage();

    const trackTarget = ref(["mouse-click", "delay", "keyboard"]);
    const checkedValueRef = ref("Import app from Github");

    const renderIcon = (icon, attrs) => {
      return () => {
        return h(NIcon, attrs, {
          default: () => h(icon),
        });
      };
    };

    // task type dropdown (i.e. YAMLs)
    const handleTaskTypeSelect = (option) => {
      if (searchKeyword.value == "") {
        searchKeyword.value = `type:${option}`;
      } else if (searchKeyword.value.startsWith("type:")) {
        if (!searchKeyword.value.includes(option)) {
          searchKeyword.value += `+${option}`;
        }
      } else {
        searchKeyword.value = `type:${option}`;
      }
    };

    // Filter tasks by keyword
    watch(searchKeyword, (newValue, oldValue) => {
      // emit("refreshFilter", { keyword: newValue });
    });

    const isTaskPaneTab = ref(true);
    eventBus.on("switchTab", (tab) => {
      if (tab == "taskPane") {
        isTaskPaneTab.value = true;
      } else {
        isTaskPaneTab.value = false;
      }
    });

    const instancesTypeOptions = [
    {
        type: "group",
        label: "Show task instances",
        key: "main",
        children: [
          {
            label: "Running",
            key: "running",
            icon: renderIcon(Checkbox, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Queued",
            key: "queued",
            icon: renderIcon(Checkbox, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Stopped",
            key: "stopped",
            icon: renderIcon(BrandAndroid, { size: 20, color: "#4caf50" }),
          },

          {
            label: "Events",
            key: "events",
            icon: renderIcon(Keyboard, { size: 20, color: "grey" }),
          }
        ],
      },
    ]
    const taskTypeOptions = [
      {
        type: "group",
        label: "Show tasks of types",
        key: "main",
        children: [
          {
            label: "Shortcut",
            key: "shortcut",
            icon: renderIcon(Checkbox, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Auto-start",
            key: "autostart",
            icon: renderIcon(BrandAndroid, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Timed",
            key: "scheduled",
            icon: renderIcon(Clock, { color: "#2685c2", size: 20 }),
          },
          {
            label: "Hotkey",
            key: "hotkey",
            icon: renderIcon(Keyboard, { size: 20, color: "grey" }),
            // children: [
            //   {
            //     label: "queued",
            //     key: "hotkey-queued",
            //   },
            //   {
            //     label: "unqueued",
            //     key: "hotkey-unqueued",
            //   },
            // ],
          },
          {
            label: "Remote",
            key: "remote",
            icon: renderIcon(Cloud, { size: 20, color: "#2685c2" }),
          },
        ],
      },
    ];

    const githubFolderLink = ref("");
    const showModalRef = ref(false);
    const addNewApp = () => {
      showModalRef.value = true;
    };

    const downloadAppFromGithub = (link) => {
      message.success(`Importing "${link}"...`);
      let wsConn = new WebSocket("ws://127.0.0.1:5678/");
      wsConn.onmessage = async (event) => {
        emit("refreshApps", {});
        wsConn.close();
      };
      wsConn.onopen = (event) => {
        let message = {
          event: "I_EVENT_TASK_REQ",
          value: {
            type: "REQUEST",
            worker: "DownloadWorker",
            url: link,
          },
        };
        try {
          wsConn.send(JSON.stringify(message));
        } catch (e) {
          console.log(e);
          message.warning("Failed downloading...");
        }
      };
      showModalRef.value = false;
    };

    const onPositiveClick = () => {
      if (checkedValueRef.value === "Import app from Github") {
        if (
          githubFolderLink.value === "" ||
          !githubFolderLink.value.startsWith("http")
        ) {
          message.warning("Please enter a valid link");
          return;
        }
        downloadAppFromGithub(githubFolderLink.value);
      } else {
        recordMacro();
      }
    };

    const onNegativeClick = () => {
      showModalRef.value = false;
    };

    return {
      searchKeyword,
      githubFolderLink,
      showModalRef,

      checkedValue: checkedValueRef,
      handleChange(e) {
        checkedValueRef.value = e.target.value;
      },
      refreshApps() {
        emit("refreshApps", {});
      },
      addNewApp,
      onPositiveClick,
      onNegativeClick,

      trackTarget,
      isTaskPaneTab,
      taskTypeOptions,
      instancesTypeOptions,
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
