<template>
  <n-layout-content
    position="absolute"
    content-style="padding: 0px;"
    style="top: 40px; bottom: 0px"
    :native-scrollbar="false"
  >
    <n-layout has-sider position="absolute">
      <n-layout-sider
        bordered
        :width="220"
        :native-scrollbar="false"
        style="background-color: #f5f5f5"
      >
        <n-space justify="end">
          <n-button quaternary size="small" @click="$refs.myNewAppModal.show()">
            <template #icon>
              <n-icon size="18"><Plus /></n-icon>
            </template>
          </n-button>
        </n-space>

        <n-list>
          <n-list-item
            v-for="(app, index) in props.apps"
            :key="index"
            style="padding-top: 8px; padding-bottom: 8px"
            @mouseover="hoverAppIndex = index"
            @mouseleave="hoverAppIndex = -1"
            @click="activateApp(index)"
            :class="{
              hover: hoverAppIndex === index,
              active: activeAppIndex === index,
            }"
          >
            <div
              :style="{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '12px',
              }"
            >
              <n-avatar
                :src="app.icon"
                size="medium"
                style="
                  margin-right: 0px;
                  border-radius: 6px;
                  background-color: #ffffff;
                "
              />
              <n-space
                vertical
                :size="[0, 0]"
                :style="{
                  marginLeft: '12px',
                  padding: '0px',
                  width: '125px',
                  maxWidth: '125px',
                }"
              >
                <n-space justify="space-between">
                  {{ app.app }}
                </n-space>
                <n-space :size="[4, 2]">
                  <n-icon size="18" :depth="4" style="padding-top: 2px">
                    <Box />
                  </n-icon>
                  {{ app.author }}
                </n-space>
              </n-space>

              <n-dropdown
                v-if="activeAppIndex === index"
                trigger="hover"
                :options="appOptions"
                @select="handleAppAction($event, app)"
              >
                <n-icon size="25" depth="3">
                  <PlaylistAdd />
                </n-icon>
              </n-dropdown>
            </div>
          </n-list-item>
        </n-list>
      </n-layout-sider>

      <n-layout content-style="padding: 8px 8px 5px;">
        <div>
          <n-list
            :show-divider="false"
            style="padding-top: 2px; padding-bottom: 0px"
          >
            <n-list-item
              v-for="(task, taskIndex) in displayTasks"
              style="padding-top: 4px; padding-bottom: 4px"
              @mouseover="hoverTaskIndex = taskIndex"
              @mouseleave="hoverTaskIndex = -1"
              @contextmenu="handleContextMenu($event, task)"
              item-style="width: 100%; max-width: 100%; display: flex;"
              :key="taskIndex"
            >
              <n-space style="padding-left: 6px; width:100%" :size="[6, 6]">
                <n-checkbox
                  style="padding-top: 3px"
                  @click.stop
                  v-model:checked="task.shortcut"
                  @update:checked="
                    handleTaskChecked(
                      $event,
                      props.apps[activeAppIndex].tasks[taskIndex]
                    )
                  "
                />

                <n-space style="gap: 8px 2px">
                  <n-button
                    secondary
                    :bordered="false"
                    :loading="loadingTaskIndex == taskIndex"
                    size="small"
                    @click="runTask(task, taskIndex)"
                    style="text-align: left"
                  >
                    <n-ellipsis style="width: 100%; max-width: 100%">
                      {{
                        task.relTaskPath.includes("/")
                          ? task.relTaskPath.split("/")[1]
                          : task.relTaskPath
                      }}
                    </n-ellipsis>
                  </n-button>

                  <n-input-group
                    style="padding-top: 1px; padding-left: 5px; max-width: 40px"
                  >
                    <n-icon
                      :class="{
                        invisible: !(
                          task.options?.includes('autostart') ||
                          hoverTaskIndex == taskIndex
                        ),
                      }"
                      size="18"
                      :color="
                        task.options?.includes('autostart') ? '#0e7a0d' : 'grey'
                      "
                      depth="2"
                      style="padding-left: 0px"
                      @click="handleToggleProperty(task, 'autostart')"
                    >
                      <BrandAndroid />
                    </n-icon>

                    <n-icon
                      size="18"
                      :color="task.startTime ? '#0e7a0d' : 'grey'"
                      depth="2"
                      style="padding-left: 1px"
                      :class="{
                        invisible: !(
                          task.startTime || hoverTaskIndex == taskIndex
                        ),
                      }"
                      @click="handleToggleProperty(task, 'startTime')"
                    >
                      <Clock />
                    </n-icon>

                    <n-icon
                      :class="{
                        invisible: !(
                          task.hotkey || hoverTaskIndex == taskIndex
                        ),
                      }"
                      size="18"
                      style="padding-left: 1px"
                      :color="task.hotkey ? 'green' : 'grey'"
                      @click="handleToggleProperty(task, 'hotkey')"
                      depth="2"
                    >
                      <Keyboard />
                    </n-icon>
                    <n-icon
                      size="18"
                      :color="
                        task.options?.includes('remote') ? '#0e7a0d' : 'grey'
                      "
                      depth="2"
                      style="padding-left: 1px"
                      :class="{
                        invisible: !(
                          task.options?.includes('remote') ||
                          hoverTaskIndex == taskIndex
                        ),
                      }"
                      @click="handleToggleProperty(task, 'remote')"
                    >
                      <Cloud />
                    </n-icon>
                  </n-input-group>
                </n-space>
              </n-space>
            </n-list-item>
            <n-dropdown
              placement="bottom-start"
              trigger="manual"
              :x="xRef"
              :y="yRef"
              :options="taskItemOptions"
              :show="showDropdownRef"
              :on-clickoutside="onClickOutside"
              @select="handleTaskAction"
            />
          </n-list>
        </div>
      </n-layout>
    </n-layout>
  </n-layout-content>

  <n-modal v-model:show="showSetupModal" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">
        Setup {{ quickSetupTarget == "startTime" ? "start time" : "hotkey" }}
      </div>
    </template>

    <n-space vertical>
      <n-space v-if="quickSetupTarget == 'startTime'" justify="center">
        <n-input-group>
          <n-button secondary size="small">Time</n-button>
          <n-input
            size="small"
            v-model:value="updateSetupValue"
            placeholder="select a cron template"
            style="width: 220px"
          >
          </n-input>
          <n-button
            secondary
            size="small"
            type="warning"
            @click="updateSetupValue = ''"
          >
            {{ $t("apps.common.clear") }}
          </n-button>
        </n-input-group>

        <n-select
          placeholder="Select a template"
          size="small"
          v-model:value="updateSetupValue"
          style="padding-top: 5px; padding-left: 30px; width: 260px"
          :options="cronTemplates"
          :render-label="renderLabel"
        />
      </n-space>

      <n-space v-else>
        <n-input-group>
          <n-button secondary size="small">Hotkey</n-button>
          <n-input
            size="small"
            v-model:value="updateSetupValue"
            placeholder="Enter hotkey"
            style="width: 220px"
          >
          </n-input>
          <n-button
            secondary
            size="small"
            type="warning"
            @click="updateSetupValue = ''"
          >
            {{ $t("apps.common.clear") }}
          </n-button>
        </n-input-group>
      </n-space>
    </n-space>
    <template #action>
      <n-space style="margin: 0px">
        <n-button
          text
          type="info"
          size="tiny"
          v-if="quickSetupTarget == 'startTime'"
        >
          <template #icon>
            <n-icon>
              <Alarm />
            </n-icon>
          </template>
          More cron samples
        </n-button>
        <n-button size="small" @click="showSetupModal = false">Cancel</n-button>
        <n-button size="small" type="primary" @click="saveSetupsToFile">
          Save
        </n-button>
      </n-space>
    </template>
  </n-modal>

  <newTaskModal ref="myNewTaskModal" />
  <newAppModal ref="myNewAppModal"/>

</template>

<script setup>
import {
  NCard,
  NInputGroup,
  NLayout,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NDropdown,
  NCheckbox,
  NEllipsis,
  NSpace,
  NSelect,
  NIcon,
  NInput,
  NButton,
  NMenu,
  NTag,
  NBadge,
  NAvatar,
  NText,
  NList,
  NListItem,
  NTooltip,
  NCheckboxGroup,
  useMessage,
  NModal,
  NRadio,
} from "naive-ui";

import { ref, nextTick, h, computed, onMounted } from "vue";
import {
  Copyright,
  BrandAndroid,
  Keyboard,
  Clock,
  Cloud,
  Alarm,
  Pencil,
  CloudDownload,
  Plus,
  Trash,
  FileReport,
  Search,
  Box,
  PlaylistAdd,
} from "@vicons/tabler";

import { ipcRenderer, shell } from "electron";

import newAppModal from "./modals/newAppModal";
import newTaskModal from "./modals/newTaskModal";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  apps: {
    type: Array,
  },
});

const emits = defineEmits(["runTask"]);
const message = useMessage();

const loadingTaskIndex = ref(-1);
const runTask = (task, index) => {
  if (task.startTime) {
    message.info(`"${task.relTaskPath}" scheduled.`);

    // TODO: allow scheduled hotkey
    if (task.hotkey) {
      message.error("task cannot have both hotkey and scheduled time");
      return;
    }
  } else if (!task.hotkey) {
    // message.success(`Task "${task.relTaskPath}" started`);
    loadingTaskIndex.value = index;
    setTimeout(() => {
      loadingTaskIndex.value = -1;
    }, 1000);
  }
  emits("runTask", task);
};

const activeAppIndex = ref(0);
const hoverAppIndex = ref(-1);
const hoverTaskIndex = ref(-1);

const displayTasks = computed(() => {
  if (activeAppIndex.value == -1 || props.apps.length == 0) {
    return [];
  }
  return props.apps[activeAppIndex.value].tasks;
});

onMounted(() => {
  setTimeout(() => {
    ipcRenderer.send("to-console", { action: "reload-apps" });
  }, 1200);
});

const activateApp = (index) => {
  activeAppIndex.value = index;
  ipcRenderer.send("to-console", { action: "reload-apps" });
};

const showDropdownRef = ref(false);
const xRef = ref(0);
const yRef = ref(0);

const renderIcon = (icon, attrs) => {
  return () => {
    return h(NIcon, attrs, {
      default: () => h(icon),
    });
  };
};

const appOptions = [
  {
    label: () => t('apps.app.edit'),
    key: "edit",
    icon: renderIcon(Pencil, { color: "#2685c2" }),
  },
  {
    label: () => t('apps.app.newTask'),
    key: "new",
    icon: renderIcon(Plus, { color: "#2685c2" }),
  },
  {
    label: () => t('apps.app.update'),
    key: "update",
    icon: renderIcon(CloudDownload, { color: "green" }),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: () => t('apps.app.delete'),
    key: "delete",
    icon: renderIcon(Trash, { color: "#db2544" }),
  },
];

const myNewTaskModal = ref(null);
const handleAppAction = async (key, app) => {
  if (key === "delete") {
    ipcRenderer.send("to-console", {
      action: "delete-app",
      appPath: app.path,
    });
    ipcRenderer.send("to-console", { action: "reload-apps" });
    message.warning(`App ${app.author}/${app.app} is deleted.`);
  
  } else if (key === "edit") {
    shell.openPath(app.path);
    // shell.openExternal(`vscode://file/${app.path}`);

  } else if (key == "new") {
    let appName = props.apps[activeAppIndex.value].app
    let appPath = props.apps[activeAppIndex.value].path
    myNewTaskModal.value.show(appName, appPath);
  }
};

const taskItemOptions = [
  {
    label: () => t('apps.task.edit'),
    key: "edit",
    icon: renderIcon(Pencil, { color: "#2685c2" }),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: () => t('apps.task.debug'),
    key: "showLog",
    icon: renderIcon(FileReport, { color: "#FAD02C" }),
  },
  {
    label: () => t('apps.task.delete'),
    key: "delete",
    icon: renderIcon(Trash, { color: "#db2544" }),
  },
];

const onClickOutside = () => {
  showDropdownRef.value = false;
};

const activeSelectedTask = ref(null);
const handleTaskAction = async (key) => {
  showDropdownRef.value = false;
  if (key === "run") {
    runTask(activeSelectedTask.value, -1);
  } else if (key === "edit") {
    shell.openExternal(`vscode://file/${activeSelectedTask.value.absTaskPath}`);
  } else if (key === "delete") {
    ipcRenderer.send("to-console", {
      action: "delete-task",
      appPath: activeSelectedTask.value.appPath,
      taskPath: activeSelectedTask.value.absTaskPath,
      taskName: activeSelectedTask.value.relTaskPath,
    });

    ipcRenderer.send("to-console", { action: "reload-apps" });
    // message.info(`delete task ${activeSelectedTask.value.relTaskPath}`);
  } else if (key === "showLog") {
    // message.info("Show log");
  }
};

const handleContextMenu = (e, task) => {
  activeSelectedTask.value = task;
  e.preventDefault();
  showDropdownRef.value = false;
  nextTick().then(() => {
    showDropdownRef.value = true;
    xRef.value = e.clientX;
    yRef.value = e.clientY;
  });
};

const handleTaskChecked = async (isChecked, task) => {
  // Update local task config
  ipcRenderer.send("to-console", {
    action: "update-task-configs",
    taskPath: task.absTaskPath,
    key: "shortcut",
    update: isChecked,
  });
  ipcRenderer.send("to-console", { action: "reload-apps" });
};

// Toggle autostart, remote, time, hotkey
const showSetupModal = ref(false);
const quickSetupTarget = ref("startTime");  
const updateSetupValue = ref("");

const handleToggleProperty = async (task, property) => {
  if (property === "autostart" || property === "remote") {
    ipcRenderer.send("to-console", {
      action: "update-task-configs",
      taskPath: task.absTaskPath,
      key: property,
      update: !task.options?.includes(property),
    });
  } else {
    activeSelectedTask.value = task;
    updateSetupValue.value = task[property] || "";
    // Show dialog to quick config time or hot key
    showSetupModal.value = true;
    quickSetupTarget.value = property;
  }
  ipcRenderer.send("to-console", { action: "reload-apps" });
};

const saveSetupsToFile = async () => {
  showSetupModal.value = false;
  ipcRenderer.send("to-console", {
    action: "update-task-configs",
    taskPath: activeSelectedTask.value.absTaskPath,
    key: quickSetupTarget.value,
    update: updateSetupValue.value,
  });
  ipcRenderer.send("to-console", { action: "reload-apps" });
};

// Create dialog for new tasks
const showAddTaskModal = ref(false);

const cronTemplates = [
  {
    label: "9:15am on Weekdays",
    value: "15 9 * * mon-fri",
  },
  {
    label: "Every 6 hours",
    value: "0 */6 * * *",
  },
  {
    label: "7am, 5pm daily",
    value: "0 7,17 * * *",
  },
  {
    label: "8am in Feb's first week",
    value: "0 8 1-7 feb *",
  },
];

const renderLabel = (option) => {
  if (option.type === "group") return option.label + "(Cool!)";
  return [
    h(
      NIcon,
      {
        style: {
          verticalAlign: "-0.15em",
          marginRight: "4px",
        },
      },
      {
        default: () => h(FileReport),
      }
    ),
    option.label,
  ];
};
</script>

<style scoped>
.active {
  background-color: #e3f5f1 !important;
  /* color: #f5f5f5; */
}

.hover {
  background-color: #f5f5f5;
  /* color: rgb(200, 92, 92); */
}

.invisible {
  visibility: hidden;
}

.boxShadow {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08),
    0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
}
</style>

