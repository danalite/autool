<template>
  <div>
    <n-space justify="center" style="padding-bottom: 5px">
      <n-button :bordered="false" @click="switchTaskSchTab(-1)">
        <n-icon size="25">
          <ChevronLeft />
        </n-icon>
      </n-button>
      <n-button style="width:120px" :bordered="false">
        <n-icon v-show="showType == 'running'" size="18">
          <Run/>
        </n-icon>
        <n-icon v-show="showType == 'scheduled'" size="18">
          <Clock/>
        </n-icon>
        <n-icon v-show="showType == 'hotkey'" size="18">
          <Keyboard/>
        </n-icon>
        <n-icon v-show="showType == 'stopped'" size="18">
          <DropletOff/>
        </n-icon>
        <n-icon v-show="showType == 'events'" size="18">
          <TransferIn/>
        </n-icon>
        <n-text  style="padding-left: 5px">
          {{ showType.charAt(0).toUpperCase() + showType.slice(1)}}
        </n-text>
        
      </n-button>
      <n-button :bordered="false" @click="switchTaskSchTab(1)">
        <n-icon size="25">
          <ChevronRight />
        </n-icon>
      </n-button>
    </n-space>

    <n-space vertical>
      <n-scrollbar style="max-height: 370px">
        <!-- Event in and outs -->
        <n-space v-if="showType == 'events'" justify="center">
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

        <n-space v-if="showType == 'running'" justify="center">
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

        <n-space v-if="showType == 'scheduled'" justify="center">
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

        <n-space v-if="showType == 'hotkey'" justify="center">
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

        <n-space v-if="showType == 'stopped'" justify="center">
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
      </n-scrollbar>
    </n-space>
    <n-empty
      description="Empty"
      style="padding-top: 50px"
      v-show="isTargetEmpty"
    >
      <template #icon>
        <n-icon>
          <PlaneInflight />
        </n-icon>
      </template>
    </n-empty>
  </div>
</template>

<script>
import {
  PlayerStop,
  PlayerPlay,
  Cloud,
  DevicesPc,
  BrandAndroid,
  DropletOff,
  TransferIn,
  Clock,
  Keyboard,
  PlaneInflight,
  ChevronRight,
  ChevronLeft,
  Run,
} from "@vicons/tabler";

import {
  NSpace,
  NList,
  NIcon,
  NCard,
  NCountdown,
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
  NTooltip,
  NTabPane,
  NSwitch,
  NCollapseTransition,
  useMessage,
} from "naive-ui";

import { h, ref, computed, onUnmounted } from "vue";
import eventBus from "@/utils/main/eventBus";
import { appConfig } from "@/utils/main/config";

export default {
  name: "taskSch",
  components: {
    NSpace,
    NList,
    NCard,
    NListItem,
    NScrollbar,
    NDataTable,
    NSelect,
    NButton,
    NCountdown,
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
    NTooltip,
    NCollapseTransition,
    useMessage,
    PlayerStop,
    PlayerPlay,
    Run,
    DropletOff,
    Clock,
    Keyboard,
    TransferIn,
    Cloud,
    DevicesPc,
    BrandAndroid,
    PlaneInflight,
    ChevronLeft,
    ChevronRight,
  },

  // Tasks and instances
  props: {
    taskEvents: {
      type: Array,
    },
    tasksStatusTable: {
      type: Array,
    },
  },

  emits: ["stopTask", "runTask"],
  setup(props, { emit }) {
    // const message = useMessage();
    const showType = ref(appConfig.get("taskSch.showType"));

    const stopTask = (task) => {
      // message.warning(`Stopping task ${task.taskName}...`);
      emit("stopTask", task);
    };

    // When a scheduled task is ready to run
    const runTask = (task) => {
      let newTask = { ...task, startTime: null };
      emit("runTask", newTask);
    };

    const openLog = (task) => {
      // console.log("open log", task);
    };

    // Save the previously checked task type
    onUnmounted(() => {
      appConfig.set("taskSch.showType", showType.value);
    });

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
          time: e.stamp,
        };
      });
    });

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

    // Filter task instances by keyword
    // eventBus.on("get-search-keywords", (keyword) => {
    //   let filters = keyword.split("+");
    //   let types = filters.filter((e) => e.startsWith("type:"));
    //   if (types.length > 0) {
    //     showType.value = types[0].replace("type:", "");
    //     // console.log(showType.value, "@@");
    //   }
    // });

    const tabs = ["running", "scheduled", "stopped", "hotkey", "events"];
    const isTargetEmpty = computed(() => {
      if (showType.value === "events") {
        return eventItems.value.length === 0;
      } else if (showType.value === "running") {
        return runningTasks.value.length === 0;
      } else if (showType.value === "scheduled") {
        return scheduledTasks.value.length === 0;
      } else if (showType.value === "stopped") {
        return stoppedTasks.value.length === 0;
      } else if (showType.value === "hotkey") {
        return hotkeyTasks.value.length === 0;
      } else {
        return true;
      }
    });

    const switchTaskSchTab = (offset) => {
      let shift = tabs.indexOf(showType.value) + offset;
      let index = shift < 0 ? tabs.length - 1 : shift % tabs.length;
      showType.value = tabs[index]
    };

    return {
      showType,
      isTargetEmpty,
      switchTaskSchTab,
      runTask,
      stopTask,
      openLog,

      eventItems,
      runningTasks,
      stoppedTasks,
      scheduledTasks,
      hotkeyTasks,
    };
  },
};
</script>

<style scoped>
.n-card {
  border-radius: 5px;
  padding: 5px;
}
</style>
