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
        show-trigger
        :collapsed="collapsed"
        @collapse="onMenuCollapse"
        @expand="onMenuCollapse"
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
        <n-space
          v-if="showEmptyIcon"
          style="margin-top: 80px"
          justify="center"
        >
          <n-empty :description="`No ${taskSchTab} tasks`"> </n-empty>
        </n-space>

        <n-space v-if="taskSchTab == 'events'" justify="center">
          <n-timeline size="large">
            <n-timeline-item
              v-for="e in eventItems"
              :key="e.key"
              :type="e.type"
              :title="e.title"
              :content="e.content"
              :time="new Date(e.time).toLocaleString()"
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
              <n-ellipsis style="max-width: 185px">
                {{ new Date(task.stamp).toLocaleString() }}
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
                :duration="getNextRunTime(task, taskIndex)"
                @finish="() => runTask(task, taskIndex)"
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
                  <n-ellipsis style="max-width: 155px; width: 155px">
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
                {{ new Date(task.stamp).toLocaleString() }}
              </n-text>
              <n-button
                size="tiny"
                :type="
                  task.status == 'taskFinish'
                    ? 'success'
                    : task.status == 'stopped'
                    ? 'warning'
                    : 'error'
                "
                @click="() => openLog(task)"
              >
                {{
                  task.status == "taskFinish" || task.status == "stopped"
                    ? "rerun"
                    : "debug"
                }}
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
  NEmpty,
  NCheckboxGroup,
  useMessage,
  NModal,
  NRadio,
} from "naive-ui";

import { ref, nextTick, h, computed, onMounted, onBeforeUnmount } from "vue";
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
  MailForward,
} from "@vicons/tabler";

import { app, ipcRenderer, shell } from "electron";

import { appConfig } from "@/utils/main/config";
import { parseCron } from "@/utils/render/parseCron";

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

const collapsed = ref(appConfig.get("isTaskSchMenuCollapsed"));
const taskSchTab = ref("running");

const onMenuCollapse = () => {
  collapsed.value = !collapsed.value;
  appConfig.set("isTaskSchMenuCollapsed", collapsed.value);
};

function renderIcon(icon, color = "red") {
  return () => h(NIcon, { depth: 4, color: color }, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: "Active",
    key: "running",
    icon: renderIcon(PlayerPlay, "#409eff"),
  },
  {
    label: "Later",
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

const getNextRunTime = (task, index) => {
  let nextRunTime = task.nextDates;
  let now = new Date().getTime();
  for (let i = 0; i < nextRunTime.length; i++) {
    if (nextRunTime[i].stamp - now > 0) {
      return nextRunTime[i].stamp - now;
    }
  }

  let nextDates = parseCron(task.startTime);
  scheduledTasks.value[index].nextDates = nextDates;
  return nextDates[0].stamp - now;
};

let eventsCache = appConfig.get("eventsCache");
const eventItems = computed(() => {
  let events = props.taskEvents.map((e) => {
    return {
      title: `${e.event} (${e.uuid.slice(0, 8)})`,
      content: genEventContent(e.value, e.taskName),
      key: e.stamp,
      type: genEventType(e.value, e.source),
      time: e.stamp,
    };
  });

  events = eventsCache.concat(events);
  events.sort((a, b) => b.time - a.time);
  if (events.length > 50) {
    events = events.slice(0, 50);
  }
  appConfig.set("eventsCache", events);
  return events;
});


const showEmptyIcon = computed(() => {
  if (taskSchTab.value === "running") {
    return runningTasks.value.length === 0;
  } else if (taskSchTab.value === "scheduled") {
    return scheduledTasks.value.length === 0;
  } else if (taskSchTab.value === "hotkeys") {
    return hotkeyTasks.value.length === 0;
  } else if (taskSchTab.value === "stopped") {
    return stoppedTasks.value.length === 0;
  } else {
    return eventItems.value.length === 0;
  }
});

const runningTasks = computed(() => {
  let running = props.tasksStatusTable.filter((t) => t.status === "running");
  running.sort(function (a, b) { return b.stamp - a.stamp })
  return running;
});

// (active) tasks listening for hotkey
const hotkeyTasks = computed(() => {
  let hotkeys = props.tasksStatusTable.filter((t) => t.status === "listening");
  if (hotkeys.length > 20) {
    hotkeys = hotkeys.slice(0, 20);
  }
  appConfig.set("hotkeyTasksCache", hotkeys);
  return hotkeys;
});

// (active) tasks scheduled ahead of time
const scheduledTasks = computed(() => {
  let scheduled = props.tasksStatusTable.filter(
    (t) => t.status === "scheduled"
  );
  scheduled.sort(function (a, b) { return b.stamp - a.stamp })
  if (scheduled.length > 20) {
    scheduled = scheduled.slice(0, 20);
  }
  // Save the scheduled tasks every time updated
  appConfig.set("scheduledTasksCache", scheduled);
  return scheduled;
});

const stoppedTasks = computed(() => {
  let stopped = props.tasksStatusTable.filter(
    (t) =>
      t.status === "taskError" ||
      t.status === "taskFinish" ||
      t.status === "stopped"
  );
  stopped.sort(function (a, b) { return b.stamp - a.stamp })
  if (stopped.length > 30) {
    stopped = stopped.slice(0, 30);
  }
  // console.log("stoppedTasks", stopped, history);
  appConfig.set("stoppedTasksCache", stopped);
  return stopped;
});

// Send a stop signal to the background task
const stopTask = (task) => {
  // message.warning(`Stopping task ${task.taskName}...`);
  emits("stopTask", task);
};

// When a scheduled task is ready to run
const runTask = (task, index) => {
  if (task.startTime) {
    scheduledTasks.value[index].nextDates.shift()
  }
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
  
  