<template>
  <n-tabs
    default-value="events"
    size="medium"
    justify-content="space-evenly"
    type="segment"
    animated
  >
    <n-tab-pane name="events" :tab="$t('scheduler.events.trace')">
      <n-space
        v-if="eventItems.length == 0"
        style="margin-top: 80px"
        justify="center"
      >
        <n-empty />
      </n-space>

      <n-space justify="center">
        <n-timeline size="large">
          <n-timeline-item
            v-for="(e, index) in eventItems"
            :key="index"
            :type="e.type"
            :title="e.title"
            :content="e.content"
            :time="new Date(e.time).toLocaleString()"
          />
        </n-timeline>
      </n-space>
    </n-tab-pane>

    <n-tab-pane name="stopped" :tab="$t('scheduler.events.finished')">
      <n-card
        v-for="(task, taskIndex) in props.stoppedTasks"
        size="small"
        :key="taskIndex"
        hoverable
        style="margin-bottom: 10px"
      >
        <n-space :size="[4, 2]" justify="space-between">
          <n-space>
            <n-icon
              size="20"
              v-if="task.options?.includes('remote')"
              style="padding-right: 3px"
            >
              <Cloud color="#409eff" />
            </n-icon>
            <n-icon size="20" v-else style="padding-right: 3px">
              <DevicesPc style="color: #409eff" />
            </n-icon>

            <n-button
              :text="true"
              size="small"
              @click="openTask(task.taskPath)"
            >
              <n-ellipsis style="max-width: 155px; width: 155px">
                {{ task.taskName.split(pathSeparator).slice(-1)[0] }}
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
          <n-text>
            {{ new Date(task.stamp).toLocaleString() }}
          </n-text>

          <n-button
            v-if="task.status == 'taskFinish' || task.status == 'stopped'"
            size="tiny"
            :type="task.status == 'stopped' ? 'warning' : 'success'"
            @click="() => runTask(task)"
          >
            {{ $t("apps.task.rerun") }}
          </n-button>
          <n-button
            v-else
            size="tiny"
            type="error"
            @click="() => debugTask(task)"
          >
            {{ $t("apps.task.debug") }}
          </n-button>
        </n-space>
      </n-card>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { appConfig } from "@/utils/main/config";
import {
  NSpace,
  NText,
  NEllipsis,
  NIcon,
  NTimeline,
  NTimelineItem,
  NEmpty,
  NTabs,
  NTabPane,
  NCard,
  NButton,
} from "naive-ui";

import { Cloud, DevicesPc } from "@vicons/tabler";
import { computed } from "vue";
import { shell } from "electron";

import { useI18n } from "vue-i18n";
import eventBus from "@/utils/render/eventBus";
const { t } = useI18n();

const props = defineProps({
  taskEvents: {
    type: Array,
  },
  stoppedTasks: {
    type: Array,
  },
});

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
  const itemType = item?.type || "NULL";
  switch (itemType) {
    case "taskFinish":
      return item.message;

    case "taskError":
      return item.message;

    case "runTask":
      return `enqueue "${taskName}"`;
    
    case "cancelTask":
      return `cancel "${taskName}"`;

    default:
      return itemType;
  }
};

let eventsCache = appConfig.get("eventsCache");
const eventItems = computed(() => {
  let events = props.taskEvents.map((e) => {
    // if (e.taskName == undefined) {
    //   console.log("@@@ Undefined event value: ", JSON.stringify(e));
    //   console.log("@@@ Undefined event value: ", JSON.stringify(props.taskEvents));
    // }
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

const pathSeparator = process.platform === "win32" ? "\\" : "/";
const openTask = (taskPath) => {
  shell.openExternal(`vscode://file/${taskPath}`);
};

const debugTask = (task) => {
  // let shortName = task.taskName.split(pathSeparator).slice(-1)[0];
  let logPath = appConfig.get("appHome") + pathSeparator + "background.log";
  shell.openExternal(`vscode://file/${logPath}`);
};

const runTask = (task) => {
  let newTask = { relTaskPath: task.taskName, absTaskPath: task.taskPath };
  eventBus.emit("run-task", newTask);
};
</script>
