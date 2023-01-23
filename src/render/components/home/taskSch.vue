<template>
  <div>
    <n-space vertical>
      <n-space justify="center" style="padding: 10px">
        <n-select
          size="medium"
          v-model:value="showType"
          :style="{ width: '250px' }"
          :options="showTasksOptions"
          :render-label="renderLabel"
          :render-tag="renderSingleSelectTag"
        />
      </n-space>

      <!-- Event in and outs -->
      <n-scrollbar style="max-height: 370px">
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
          <n-empty
            v-if="runningTasks.length === 0"
            description="No running tasks"
          >
          </n-empty>
          <n-list size="large" style="padding-top: 2px; padding-bottom: 0px" v-else>
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

        <n-collapse-transition :show="showType == 'stopped'">
          <n-empty
            v-if="stoppedTasks.length === 0"
            description="No finished or stopped tasks"
          >
          </n-empty>

          <n-list size="large" style="padding-top: 2px; padding-bottom: 0px" v-else>
            <n-list-item
              v-for="task in stoppedTasks"
              :key="task.id"
              style="padding-top: 6px; padding-bottom: 6px"
            >
              <n-space style="padding-top: 2px" justify="center">
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

                  {{ task.taskName }} ({{ task.id.slice(0, 8) }})
                </n-button>
              </n-space>
            </n-list-item>
          </n-list>
        </n-collapse-transition>

        <n-collapse-transition :show="showType == 'auto-start'">
          {{ autoStartTasks }}
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

    const renderTaskSelectIcon = (icon, color, hasMargin) => {
      return h(
        NIcon,
        {
          round: false,
          size: 24,
          style: {
            marginRight: hasMargin ? "12px" : "0px",
          },
          color: color,
        },
        {
          default: () => h(icon),
        }
      );
    };

    const renderSingleSelectTag = ({ option }) => {
      return h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
          },
        },
        [renderTaskSelectIcon(option.icon, option.color, true), option.label]
      );
    };

    const renderLabel = (option) => {
      return h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
          },
        },
        [
          renderTaskSelectIcon(option.icon, option.color, false),
          h(
            "div",
            {
              style: {
                marginLeft: "12px",
                padding: "4px 0",
              },
            },
            [
              h("div", null, [option.label]),
              h(
                NText,
                { depth: 3, tag: "div" },
                {
                  default: () => option.description,
                }
              ),
            ]
          ),
        ]
      );
    };

    const showTasksOptions = [
    {
        label: "running",
        value: "running",
        icon: Box,
        color: "#4caf50",
        description: "running tasks",
      },
      {
        label: "stopped",
        value: "stopped",
        icon: Box,
        color: "#DB2544",
        description: "stopped tasks",
      },
      {
        label: "auto-start",
        value: "auto-start",
        icon: BrandAndroid,
        color: "#4caf50",
        description: "autorun on startup",
      },
      {
        label: "hotkey",
        value: "hotkey",
        icon: Keyboard,
        color: "grey",
        description: "hotkey invoked",
      },
      {
        label: "timed",
        value: "timed",
        icon: Clock,
        color: "#2685c2",
        description: "tasks scheduled",
      },
      {
        label: "remote",
        value: "remote",
        icon: Cloud,
        color: "#2685c2",
        description: "tasks on cloud",
      },
      {
        label: "events",
        value: "events",
        icon: TransferIn,
        color: "#FFD73B",
        description: "events",
      },
    ];

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
      showTasksOptions,
      renderSingleSelectTag,
      renderLabel,
      eventItems,
      runningTasks,
      stoppedTasks,
      autoStartTasks
    };
  },
};
</script>
