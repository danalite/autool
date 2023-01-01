<template>
  <div>
    <n-space vertical>
      <n-tabs
        v-model:value="showType"
        default-value="pending"
        justify-content="space-evenly"
        type="line"
      >
      <n-tab-pane name="autostart" tab="Autostart">
          <n-scrollbar style="max-height: auto">
            <n-data-table
              :columns="columns"
              :data="tasksEnded"
              :pagination="{ pageSize: 4 }"
            />
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="pending" tab="Running">
          <n-scrollbar style="max-height: auto">
            <n-data-table
              :columns="columns"
              :data="tasksPending"
              :pagination="{ pageSize: 4 }"
            />
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="finished" tab="Ended">
          <n-scrollbar style="max-height: auto">
            <n-data-table
              :columns="columns"
              :data="tasksEnded"
              :pagination="{ pageSize: 4 }"
            />
          </n-scrollbar>
        </n-tab-pane>

      </n-tabs>
    </n-space>
  </div>
</template>

<script>
import { PlayerStop, PlayerPlay, Cloud, DevicesPc } from "@vicons/tabler";

import {
  NSpace,
  NList,
  NIcon,
  NListItem,
  NDataTable,
  NScrollbar,
  NAvatar,
  NTag,
  NText,
  NTabs,
  NTabPane,
  useMessage,
} from "naive-ui";

import { h, ref } from "vue";

export default {
  name: "taskSch",
  components: {
    NSpace,
    NList,
    NListItem,
    NScrollbar,
    NDataTable,
    NAvatar,
    NTag,
    NIcon,
    NText,
    NTabs,
    NTabPane,
    useMessage,
    PlayerStop,
    PlayerPlay,
    Cloud,
    DevicesPc,
  },
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
    const columns = [
      {
        title: "",
        key: "icon",
        width: 20,
        render: (row) => {
          return h(NIcon, { size: 20, style: { "padding-top": "6px" } }, () =>
            row.options?.includes("remote")
              ? h(Cloud, { color: "#2685c2" }, {})
              : h(DevicesPc, { color: "#2685c2" }, {})
          );
        },
      },
      {
        title: "Task",
        key: "name",
        render: (row, index) => {
          return h(
            NText,
            { bordered: false },
            () => row.name + " (" + row.id.slice(0, 8) + ")"
          );
        },
      },
      {
        title: "",
        render(row) {
          return showType.value === "pending"
            ? h(
                NIcon,
                {
                  size: 20,
                  style: { "padding-right": "3px" },
                  onClick: () => stopTask(row),
                },
                {
                  default: () =>
                    h(PlayerStop, {
                      style: {
                        "margin-bottom": "-4px",
                        color: "#ba0f30",
                      },
                    }),
                }
              )
            : h("p", {}, {});
        },
      },
    ];

    const message = useMessage();
    const showType = ref("pending");
    const stopTask = (task) => {
      message.warning(`Stopping task ${task.name}...`);
      emit("stopTask", task);
    };

    return {
      columns,
      showType,
      stopTask,
    };
  },
};
</script>
