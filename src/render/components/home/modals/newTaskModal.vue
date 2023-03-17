<template>
  <n-modal v-model:show="showAddTaskModal" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">
        {{ $t("apps.newTask.title") }} "{{ targetAppName }}"
      </div>
    </template>
    <div>
      <n-space vertical style="padding-top: 10px">
        <n-space>
          <n-input-group
            style="width: 350px; padding-bottom: 10px"
            size="small"
          >
            <n-input-group-label size="small">
              {{ $t("apps.newTask.taskName") }}
            </n-input-group-label>
            <n-input
              v-model:value="newTaskName"
              size="small"
              placeholder="E.g., new-task-name"
            />
          </n-input-group>
        </n-space>
      </n-space>
      <n-input-group>
        <n-input-group-label size="small">
          {{ $t("apps.newTask.taskType") }}
        </n-input-group-label>
        <n-radio
          style="padding-left: 10px"
          :checked="addTaskType === 'template'"
          value="template"
          @change="addTaskType = 'template'"
        >
          {{ $t("apps.newTask.taskTemplate") }}
        </n-radio>
        <n-radio
          :checked="addTaskType === 'macro-record'"
          value="macro-record"
          @change="addTaskType = 'macro-record'"
        >
          {{ $t("apps.newTask.macroRecorder") }}
        </n-radio>
      </n-input-group>

      <n-select
        v-if="addTaskType === 'template'"
        placeholder="Select a template"
        size="small"
        placement="bottom"
        v-model:value="selectedTemplate"
        style="padding-top: 10px; padding-left: 100px; width: 180px"
        :options="templateOptions"
        :render-label="renderLabel"
      />

      <n-checkbox-group
        v-else
        v-model:value="macroRecordOptions"
        style="padding-top: 10px; padding-left: 30px"
      >
        <n-space item-style="display: flex;">
          <n-checkbox
            disabled
            checked
            value="mouse-keys"
            :label="$t('apps.newTask.mouseAndKeyboard')"
          />

          <n-checkbox
            value="mouse-move"
            :label="$t('apps.newTask.mouseMove')"
          />
          <n-checkbox
            disabled
            value="mouse click by image"
            :label="$t('apps.newTask.mouseClickImage')"
          />
          <n-checkbox value="delay" :label="$t('apps.newTask.timeDelay')" />
        </n-space>
      </n-checkbox-group>
    </div>
    <template #action>
      <n-space style="margin: 0px">
        <n-tooltip
          :style="{ maxWidth: '400px' }"
          trigger="hover"
          v-if="addTaskType === 'macro-record'"
        >
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
          Start: Shift + Shift
          <br />
          Stop&nbsp;: Command + Command
        </n-tooltip>
        <n-button size="small" @click="closeAddTaskModal"> Cancel </n-button>
        <n-button size="small" type="primary" @click="addNewTask">
          Add
        </n-button>
      </n-space>
    </template>
  </n-modal>
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
  NInputGroupLabel,
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
import { ipcRenderer } from "electron";
import { ref, h } from "vue";
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

import { taskTemplates } from "@/utils/render/taskTemplates";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const addTaskType = ref("template");
const macroRecordOptions = ref(["mouse-keys"]);
const newTaskName = ref("");
const selectedTemplate = ref("notification");

const showAddTaskModal = ref(false);
const closeAddTaskModal = () => {
  showAddTaskModal.value = false;
};

const targetAppName = ref("");
const targetAppPath = ref("");
const show = (appName, appPath) => {
  showAddTaskModal.value = true;
  targetAppName.value = appName;
  targetAppPath.value = appPath;
};

defineExpose({
  show,
});

const templateOptions = [
  {
    label: "Notification",
    value: "notification",
  },
  {
    label: "Web Search",
    value: "web-search",
  },
  {
    label: "Desktop UI",
    value: "desktop-ui",
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

const addNewTask = async () => {
  if (
    newTaskName.value === "" ||
    newTaskName.value.includes("/") ||
    newTaskName.value.includes("\\") ||
    newTaskName.value.includes(".")
  ) {
    message.error(`Invalid task name \"${newTaskName.value}\"`);
    return;
  }

  if (addTaskType.value === "template") {
    ipcRenderer.invoke("to-console", {
      action: "create-task",
      taskName: newTaskName.value,
      appPath: targetAppPath,
      content: taskTemplates[selectedTemplate.value],
    });
  } else if (addTaskType.value === "macro-record") {
    await ipcRenderer.invoke("to-console", {
      action: "uio-event",
      type: "macroRecord",
      options: [...macroRecordOptions.value],
      source: "console.appLists",
      appPath: targetAppPath,
      taskName: newTaskName.value,
    });
  }

  setTimeout(() => {
    showAddTaskModal.value = false;
  }, 200);
};
</script>

