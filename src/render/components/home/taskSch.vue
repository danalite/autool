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
        <task-history v-if="taskSchTab == 'events'" :taskEvents="props.taskEvents" :stoppedTasks="stoppedTasks" />
        
        <task-queued v-if="taskSchTab == 'scheduled'" :hotkeyTasks="hotkeyTasks" :scheduledTasks="scheduledTasks" @runTask="runTask($event)" />

        <task-active v-if="taskSchTab == 'running'" :runningTasks="runningTasks" />

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

import { ref, h, computed, onBeforeUnmount } from "vue";
import {
  Alarm,
  PlayerPlay,
  History,
} from "@vicons/tabler";

import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";

import taskHistory from "./schedulerTabs/taskHistory.vue"
import taskQueued from "./schedulerTabs/taskQueued.vue"
import taskActive from "./schedulerTabs/taskActive.vue"
import eventBus from "@/utils/render/eventBus";

const { t } = useI18n();
const props = defineProps({
  taskEvents: {
    type: Array,
  },
  tasksStatusTable: {
    type: Array,
  },
});

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
    label: () => t("scheduler.active.title"),
    key: "running",
    icon: renderIcon(PlayerPlay, "#409eff"),
  },
  {
    label: () => t("scheduler.later.title"),
    key: "scheduled",
    icon: renderIcon(Alarm),
  },
  {
    label: () => t("scheduler.events.title"),
    key: "events",
    icon: renderIcon(History, "#ffa700"),
  },
];


const runningTasks = computed(() => {
  let running = props.tasksStatusTable.filter((t) => t.status === "running");
  running.sort(function (a, b) {
    return b.stamp - a.stamp;
  });
  return running;
});

const hotkeyTasks = computed(() => {
  let hotkeys = props.tasksStatusTable.filter((t) => t.status === "listening");
  if (hotkeys.length > 20) {
    hotkeys = hotkeys.slice(0, 20);
  }
  appConfig.set("hotkeyTasksCache", hotkeys);
  return hotkeys;
});

const scheduledTasks = computed(() => {
  let scheduled = props.tasksStatusTable.filter(
    (t) => t.status === "scheduled"
  );
  scheduled.sort(function (a, b) {
    return b.stamp - a.stamp;
  });
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
  stopped.sort(function (a, b) {
    return b.stamp - a.stamp;
  });
  if (stopped.length > 30) {
    stopped = stopped.slice(0, 30);
  }
  // console.log("stoppedTasks", stopped, history);
  appConfig.set("stoppedTasksCache", stopped);
  return stopped;
});


// When a scheduled task is ready to run
const runTask = (e) => {
  const task = e.task;
  if (task.startTime) {
    scheduledTasks.value[e.index].nextDates.shift();
  }
  let newTask = { ...task, startTime: null, hotkey: null };
  eventBus.emit("run-task", newTask);
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
  
  