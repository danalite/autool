<template>
  <div>
    <n-space vertical>
      <n-scrollbar style="max-height: 370px">
        
        <!-- Event in and outs -->
        <n-collapse-transition :show="showType == 'events'">
          <n-timeline size="large" :style="{ 'padding-top': '5px' }">
            <n-timeline-item
              v-for="e in eventItems.slice().reverse()"
              :key="e.key"
              :type="e.type"
              :title="e.title"
              :content="e.content"
              :time="e.time"
            />
          </n-timeline>
        </n-collapse-transition>

        <n-collapse-transition :show="showType == 'running'">
          <n-list size="large" style="padding-top: 2px; padding-bottom: 0px">
            <n-list-item
              v-for="(task, taskIndex) in runningTasks"
              style="padding-top: 6px; padding-bottom: 6px"
              :key="taskIndex"
            >
              <n-space justify="space-between">
                <n-button :text="true" size="small" @click="">
                  <n-icon
                    size="18"
                    v-if="task.options.includes('remote')"
                    style="padding-right: 3px"
                  >
                    <Cloud color="#409eff" />
                  </n-icon>
                  <n-icon size="18" v-else style="padding-right: 3px">
                    <DevicesPc style="color: #409eff" />
                  </n-icon>

                  <n-ellipsis style="max-width: 220px">
                    {{ task.taskName }} ({{ task.id.slice(0, 8) }})
                  </n-ellipsis>
                </n-button>
                <n-switch size="small" />
                <n-button
                  size="tiny"
                  type="error"
                  @click="() => stopTask(task)"
                >
                  Stop
                </n-button>
              </n-space>
            </n-list-item>
          </n-list>
        </n-collapse-transition>
      
      </n-scrollbar>
    </n-space>
  </div>
</template>

<script>
import {
  PlayerStop,
  PlayerPlay,
  Cloud,
  DevicesPc,
  BrandAndroid,
  Box,
  TransferIn,
  Clock,
  Keyboard,
} from "@vicons/tabler";

import {
  NSpace,
  NList,
  NIcon,
  NListItem,
  NDataTable,
  NScrollbar,
  NAvatar,
  NEmpty,
  NEllipsis,
  NSelect,
  NButton,
  NTag,
  NText,
  NTabs,
  NTimeline,
  NTimelineItem,
  NTabPane,
  NSwitch,
  NCollapseTransition,
  useMessage,
} from "naive-ui";

import { h, ref, computed } from "vue";

export default {
  name: "taskSch",
  components: {
    NSpace,
    NList,
    NListItem,
    NScrollbar,
    NDataTable,
    NSelect,
    NButton,
    NAvatar,
    NEmpty,
    NEllipsis,
    NTag,
    NIcon,
    NText,

    NSwitch,
    NTabs,
    NTabPane,
    NTimeline,
    NTimelineItem,
    NCollapseTransition,
    useMessage,
    PlayerStop,
    PlayerPlay,
    Box,
    Clock,
    Keyboard,
    TransferIn,
    Cloud,
    DevicesPc,
    BrandAndroid,
  },

  // Tasks and instances
  props: {
    apps: {
      type: Array,
    },
    taskEvents: {
      type: Array,
    },
    tasksStatusTable: {
      type: Array,
    },
  },

  emits: ["stopTask"],
  setup(props, { emit }) {
    const message = useMessage();
    const showType = ref("running");

    const stopTask = (task) => {
      message.warning(`Stopping task ${task.taskName}...`);
      emit("stopTask", task);
    };

    const genType = (item, source) => {
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

    const genContent = (item, taskName) => {
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
          content: genContent(e.value, e.taskName),
          key: index++,
          type: genType(e.value, e.source),
          time: e.time,
        };
      });
    });

    const runningTasks = computed(() => {
      return props.tasksStatusTable.filter(
        (t) => t.status === "running" || t.status === "queued"
      );
    });

    const stoppedTasks = computed(() => {
      return props.tasksStatusTable.filter(
        (t) =>
          t.status === "taskError" ||
          t.status === "taskFinish" ||
          t.status === "stopped"
      );
    });

    const autoStartTasks = computed(() => {
      let tasks = []
      props.apps.forEach((app) => {
        app.tasks.forEach((task) => {
          if (task.options.includes("autostart")) {
            tasks.push(task)
          }
        })
      })
      return tasks
    });

    return {
      showType,
      stopTask,
      eventItems,
      runningTasks,
      stoppedTasks,
      autoStartTasks
    };
  },
};
</script>
