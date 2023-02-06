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
        collapse-mode="width"
        :collapsed-width="55"
        :width="160"
        :collapsed="collapsed"
        @collapse="collapsed = true"
        @expand="collapsed = false"
        :native-scrollbar="false"
        style="background-color: #f5f5f5; color: #409eff"
      >
        <n-menu
          :indent="22"
          v-model:value="taskSchTab"
          :collapsed="collapsed"
          :collapsed-width="55"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
      </n-layout-sider>

      <n-layout content-style="padding: 15px 25px 5px;">
        <n-space v-if="taskSchTab == 'events'" justify="center">
          <n-timeline size="large">
            <n-timeline-item
              v-for="e in eventItems.slice().reverse()"
              :key="e.key"
              :type="e.type"
              :title="e.title"
              :content="e.content"
              :time="e.time"
            />
          </n-timeline>
        </n-space>

        <n-space v-if="taskSchTab == 'running'">
          <n-card
            v-for="(task, taskIndex) in runningTasks"
            size="small"
            style="width: 300px"
            :key="taskIndex"
          >
            <n-space :size="[4, 2]" justify="space-between">
              <n-space>
                <n-icon
                  size="20"
                  v-if="task.options.includes('remote')"
                  style="padding-right: 3px"
                >
                  <Cloud color="#409eff" />
                </n-icon>
                <n-icon size="20" v-else style="padding-right: 3px">
                  <DevicesPc style="color: #409eff" />
                </n-icon>

                <n-button :text="true" size="small" @click="openLog(task)">
                  <n-ellipsis style="max-width: 155px">
                    {{ task.taskName }}
                  </n-ellipsis>
                </n-button>
              </n-space>
              <n-button
                :text="true"
                :bordered="false"
                type="success"
                style="margin-left: 0px"
                size="tiny"
              >
                {{ task.id.slice(0, 8) }}
              </n-button>
            </n-space>

            <n-space justify="space-between">
              <n-ellipsis style="max-width: 180px">
                {{ task.stamp }}
              </n-ellipsis>
              <n-button size="tiny" type="error" @click="() => stopTask(task)">
                Stop
              </n-button>
            </n-space>
          </n-card>
        </n-space>

        <n-space v-if="taskSchTab == 'scheduled'">
          <n-card
            v-for="(task, taskIndex) in scheduledTasks"
            size="small"
            style="width: 300px"
            :key="taskIndex"
          >
            <n-space :size="[0, 0]" justify="space-between">
              <n-space>
                <n-icon
                  size="20"
                  v-if="task.options.includes('remote')"
                  style="padding-right: 3px"
                >
                  <Cloud color="#409eff" />
                </n-icon>
                <n-icon size="20" v-else style="padding-right: 3px">
                  <DevicesPc style="color: #409eff" />
                </n-icon>

                <n-button :text="true" size="small">
                  <n-ellipsis style="max-width: 155px">
                    {{ task.taskName }}
                  </n-ellipsis>
                </n-button>
              </n-space>
              <n-button
                :text="true"
                :bordered="false"
                type="success"
                style="margin-left: 0px"
                size="tiny"
              >
                {{ task.id.slice(0, 8) }}
              </n-button>
            </n-space>

            <n-space justify="space-between">
              <n-countdown
                :duration="task.nextDates[0].diff"
                @finish="() => runTask(task)"
              />
              <n-button size="tiny" type="error" @click="() => stopTask(task)">
                Clear
              </n-button>
            </n-space>
          </n-card>
        </n-space>

        <n-space v-if="taskSchTab == 'hotkeys'">
          <n-card
            v-for="(task, taskIndex) in hotkeyTasks"
            size="small"
            style="width: 300px"
            :key="taskIndex"
          >
            <n-space :size="[4, 2]" justify="space-between">
              <n-space>
                <n-icon
                  size="20"
                  v-if="task.options.includes('remote')"
                  style="padding-right: 3px"
                >
                  <Cloud color="#409eff" />
                </n-icon>
                <n-icon size="20" v-else style="padding-right: 3px">
                  <DevicesPc style="color: #409eff" />
                </n-icon>

                <n-button :text="true" size="small">
                  <n-ellipsis style="max-width: 155px">
                    {{ task.taskName }}
                  </n-ellipsis>
                </n-button>
              </n-space>

              <n-button
                :text="true"
                :bordered="false"
                type="success"
                style="margin-left: 0px"
                size="tiny"
              >
                {{ task.id.slice(0, 8) }}
              </n-button>
            </n-space>

            <n-space justify="center">
              <n-button type="success" size="tiny">
                {{ task.hotkey }}
              </n-button>
              <n-button size="tiny" type="error" @click="() => stopTask(task)">
                Clear
              </n-button>
            </n-space>
          </n-card>
        </n-space>

        <n-space v-if="taskSchTab == 'stopped'">
          <n-card
            v-for="(task, taskIndex) in stoppedTasks"
            size="small"
            :key="taskIndex"
          >
            <n-space :size="[4, 2]" justify="space-between">
              <n-space>
                <n-icon
                  size="20"
                  v-if="task.options.includes('remote')"
                  style="padding-right: 3px"
                >
                  <Cloud color="#409eff" />
                </n-icon>
                <n-icon size="20" v-else style="padding-right: 3px">
                  <DevicesPc style="color: #409eff" />
                </n-icon>

                <n-button :text="true" size="small" @click="openLog(task)">
                  <n-ellipsis style="max-width: 155px">
                    {{ task.taskName }}
                  </n-ellipsis>
                </n-button>
                <n-button
                  :text="true"
                  :bordered="false"
                  type="success"
                  style="margin-left: 0px"
                  size="tiny"
                >
                  {{ task.id.slice(0, 8) }}
                </n-button>
              </n-space>
            </n-space>

            <n-space justify="space-between">
              <n-text>
                {{ task.stamp }}
              </n-text>
              <n-button size="tiny" type="success" @click="() => openLog(task)">
                Debug
              </n-button>
            </n-space>
          </n-card>
        </n-space>
      </n-layout>
    </n-layout>
  </n-layout-content>
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
  NIcon,
  NCountdown,
  NTimeline,
  NTimelineItem,
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
  Pencil,
  CloudDownload,
  DevicesPc,
  Plus,
  Trash,
  FileReport,
  Search,
  Box,
  Run,
  Alarm,
  PlayerPlay,
  PlayerStop,
  MailForward
} from "@vicons/tabler";

import { ipcRenderer, shell } from "electron";

const props = defineProps({
  taskEvents: {
    type: Array,
  },
  tasksStatusTable: {
    type: Array,
  },
});

const emits = defineEmits(["runTask", "stopTask"]);
const message = useMessage();

const activeAppIndex = ref(-1);

const genEventType = (item, source) => {
  if (item.type === "taskError") {
    return "error";
  } else {
    if (source === "console") {
      return "success";
    } else {
      return "info";
    }
  }
};

const genEventContent = (item, taskName) => {
  switch (item.type) {
    case "taskFinish":
      return item.message;

    case "taskError":
      return item.message;

    // Inward events
    case "runTask":
      return `enqueue "${taskName}"`;

    default:
      return item.type;
  }
};

const eventItems = computed(() => {
  let index = 0;
  return props.taskEvents.map((e) => {
    return {
      title: `${e.event} (${e.uuid.slice(0, 8)})`,
      content: genEventContent(e.value, e.taskName),
      key: index++,
      type: genEventType(e.value, e.source),
      time: e.stamp,
    };
  });
});

const collapsed = ref(false);
const taskSchTab = ref("running");

function renderIcon(icon) {
  return () => h(NIcon, { depth: 4 }, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: "Running",
    key: "running",
    icon: renderIcon(PlayerPlay),
  },
  {
    label: "Scheduled",
    key: "scheduled",
    icon: renderIcon(Alarm),
  },
  {
    label: "Hotkeys",
    key: "hotkeys",
    icon: renderIcon(Keyboard),
  },
  {
    label: "Stopped",
    key: "stopped",
    icon: renderIcon(PlayerStop),
  },
  {
    label: "Events",
    key: "events",
    icon: renderIcon(MailForward),
  },
];

const runningTasks = computed(() => {
  return props.tasksStatusTable.filter((t) => t.status === "running");
});

// (active) tasks listening for hotkey
const hotkeyTasks = computed(() => {
  return props.tasksStatusTable.filter((t) => t.status === "listening");
});

// (active) tasks scheduled ahead of time
const scheduledTasks = computed(() => {
  return props.tasksStatusTable.filter((t) => t.status === "scheduled");
});

const stoppedTasks = computed(() => {
  return props.tasksStatusTable.filter(
    (t) =>
      t.status === "taskError" ||
      t.status === "taskFinish" ||
      t.status === "stopped"
  );
});

const stopTask = (task) => {
  // message.warning(`Stopping task ${task.taskName}...`);
  emits("stopTask", task);
};

// When a scheduled task is ready to run
const runTask = (task) => {
  let newTask = { ...task, startTime: null, hotkey: null };
  emits("runTask", newTask);
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
</style>
  
  