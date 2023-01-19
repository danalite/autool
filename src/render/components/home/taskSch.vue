<template>
  <div>
    <n-space vertical>
      <n-space justify="center" style="padding-top: 10px">
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
      <n-collapse-transition :show="showType == 'out-events'">
        Events
      </n-collapse-transition>

      <!-- Task action list -->
      <n-list>
        <n-list-item
          v-for="(task, taskIndex) in itemsEventsIn"
          style="padding-top: 6px; padding-bottom: 6px"
          :key="taskIndex"
        >
          {{ task }}
        </n-list-item>
      </n-list>
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
  TransferOut,
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
  NSelect,
  NButton,
  NTag,
  NText,
  NTabs,
  NTabPane,
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
    NTag,
    NIcon,
    NText,
    NTabs,
    NTabPane,
    NCollapseTransition,
    useMessage,
    PlayerStop,
    PlayerPlay,
    Box,
    Clock,
    Keyboard,
    TransferIn,
    TransferOut,
    Cloud,
    DevicesPc,
    BrandAndroid,
  },

  // Tasks and instances
  props: {
    tasksPending: {
      type: Array,
    },
    tasksEnded: {
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
        label: "in-events",
        value: "in-events",
        icon: TransferIn,
        color: "#FFD73B",
        description: "events to executor",
      },
      {
        label: "out-events",
        value: "out-events",
        icon: TransferOut,
        color: "#FFD73B",
        description: "events to frontend",
      },
    ];

    const stopTask = (task) => {
      message.warning(`Stopping task ${task.name}...`);
      emit("stopTask", task);
    };

    const itemsEventsIn = computed(() => {
      let index = 0;
      return props.tasksEnded.map((e) => {
        return e;
      });
    });

    return {
      showType,
      stopTask,
      showTasksOptions,
      renderSingleSelectTag,
      renderLabel,
      itemsEventsIn,
    };
  },
};
</script>
