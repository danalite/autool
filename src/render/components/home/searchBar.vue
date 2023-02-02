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
        :style="{ width: '220px' }"
        placeholder="search keywords"
        v-model:value="searchKeyword"
      />
    </n-input-group>
  </n-space>
</template>

<script>
import { appConfig } from "@/utils/main/config";
import { ipcRenderer } from "electron";
import { h, ref, watch } from "vue";
import eventBus from "@/utils/main/eventBus";
import {
  Plus,
  Search,
  BrandAndroid,
  Clock,
  Keyboard,
  Cloud,
  Checkbox,
  PlayerPause,
  Run,
} from "@vicons/tabler";

import {
  NCard,
  NSpace,
  NTag,
  NSelect,
  NAvatar,
  NText,
  NPopover,
  NCollapseTransition,
  NDrawer,
  NDrawerContent,
  NInput,
  NInputGroup,
  NScrollbar,
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
    NAvatar,
    NPopover,
    NCollapseTransition,
    NDrawer,
    NDrawerContent,
    NInput,
    NInputGroup,
    NRadio,
    NSelect,
    NText,
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
    Plus,
    Search,
    BrandAndroid,
    Clock,
    Keyboard,
    Run,
    Cloud,
    Checkbox,
    PlayerPause,
    eventBus,
  },
  emits: ["refreshApps"],
  setup(props, { emit }) {
    const searchKeyword = ref("");

    const renderIcon = (icon, attrs) => {
      return () => {
        return h(NIcon, attrs, {
          default: () => h(icon),
        });
      };
    };

    // task type dropdown (i.e. YAMLs)
    const handleTaskTypeSelect = (option) => {
      searchKeyword.value = `type:${option}`;
    };

    // Filter tasks by keyword
    const isTaskPaneTab = ref(true);
    watch(searchKeyword, (newValue, oldValue) => {
      eventBus.emit(
        isTaskPaneTab.value ? "search-task-pane" : "search-task-sch",
        newValue
      );
    });

    eventBus.on("switch-tab", (message) => {
      searchKeyword.value = "";
      isTaskPaneTab.value = (message.tab == "taskPane")
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
            icon: renderIcon(Run, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Hotkey",
            key: "hotkey",
            icon: renderIcon(Keyboard, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Scheduled",
            key: "scheduled",
            icon: renderIcon(Clock, { size: 20, color: "#4caf50" }),
          },
          {
            label: "Stopped",
            key: "stopped",
            icon: renderIcon(PlayerPause, { size: 20, color: "#4caf50" }),
          },

          {
            label: "Events",
            key: "events",
            icon: renderIcon(Keyboard, { size: 20, color: "grey" }),
          },
        ],
      },
    ];
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
            label: "Remote",
            key: "remote",
            icon: renderIcon(Cloud, { size: 20, color: "#2685c2" }),
          },
        ],
      },
    ];

    return {
      searchKeyword,
      refreshApps() {
        emit("refreshApps", {});
      },

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
