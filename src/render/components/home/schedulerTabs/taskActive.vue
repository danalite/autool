<template>
  <n-alert
    :title="$t('scheduler.active.emptyText')"
    type="warning"
    :bordered="false"
    v-if="props.runningTasks.length == 0"
    style="margin-top: 20px"
  >
    Try starting a new tasks
  </n-alert>

  <n-card
    v-for="(task, taskIndex) in props.runningTasks"
    size="small"
    hoverable
    style="margin-bottom: 10px"
    :key="taskIndex"
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

        <n-button :text="true" size="small" @click="openTask(task.taskPath)">
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
      <n-ellipsis style="max-width: 185px">
        {{ new Date(task.stamp).toLocaleString() }}
      </n-ellipsis>
      <n-button size="tiny" type="error" @click="() => stopTask(task)">
        {{ $t("apps.common.stop") }}
      </n-button>
    </n-space>
  </n-card>
</template>

<script setup>
import { NSpace, NButton, NCard, NIcon, NAlert, NEllipsis } from "naive-ui";
import { Cloud, DevicesPc } from "@vicons/tabler";

import eventBus from "@/utils/render/eventBus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  runningTasks: {
    type: Array,
    required: true,
  },
});

const pathSeparator = process.platform == "win32" ? "\\" : "/";

const stopTask = (task) => {
  eventBus.emit("stop-task", task);
};
</script>
