<template>
  <n-tabs default-value="hotkey" size="medium" justify-content="space-evenly" type="segment" animated>
    <n-tab-pane name="scheduled" :tab="$t('scheduler.later.waiting')">
      <n-alert
        type="warning"
        :bordered="false"
        v-if="props.scheduledTasks.length === 0"
        style="margin-top: 10px"
        :title="$t('apps.task.noScheduledTasks')"
      />

      <n-card
        v-for="(task, taskIndex) in props.scheduledTasks"
        size="small"
        :key="taskIndex"
        style="margin-bottom: 10px"
        hoverable
      >
        <n-space :size="[0, 0]" justify="space-between">
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

            <n-button :text="true" size="small">
              <n-ellipsis style="max-width: 155px">
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
          <n-countdown
            :duration="getNextRunTime(task, taskIndex)"
            @finish="() => runTask(task, taskIndex)"
          />
          <n-button
            secondary
            size="tiny"
            type="error"
            @click="() => stopTask(task)"
          >
            Clear
          </n-button>
        </n-space>
      </n-card>
    </n-tab-pane>

    <n-tab-pane name="hotkey" :tab="$t('scheduler.later.hotkeys')">
      <n-alert
        type="warning"
        :bordered="false"
        v-if="props.hotkeyTasks.length === 0"
        style="margin-top: 10px"
        :title="$t('apps.task.noHotkeyTasks')"
      />
      <n-card
        v-for="(task, taskIndex) in props.hotkeyTasks"
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

            <n-button :text="true" size="small">
              <n-ellipsis style="max-width: 155px">
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
          <n-button secondary type="success" size="tiny">
            {{ task.hotkey }}
          </n-button>
          <n-button
            secondary
            size="tiny"
            type="error"
            @click="() => stopTask(task)"
          >
            {{ $t("apps.common.clear") }}
          </n-button>
        </n-space>
      </n-card>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NSpace, NButton, NCard, NIcon, NTabs, NTabPane, NEllipsis, NCountdown, NAlert } from "naive-ui";
import { Cloud, DevicesPc } from "@vicons/tabler";
import { parseCron } from "@/utils/render/components/common";

import eventBus from "@/utils/render/eventBus";

const props = defineProps({
  scheduledTasks: {
    type: Array,
    required: true,
  },
  hotkeyTasks: {
    type: Array,
    required: true,
  },
});
const emits = defineEmits(["runTask"]);

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

const pathSeparator = process.platform === "win32" ? "\\" : "/";

// Need to update scheduledTasks in parent component
const stopTask = (task) => {
  eventBus.emit("stop-task", task);
};

const runTask = (task, index) => {
  const e = {
    task,
    index,
  };
  emits("runTask", e);
};

</script>
