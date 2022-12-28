<template>
  <div>
    <n-space vertical>
      <n-tabs
        default-value="frontend"
        justify-content="space-evenly"
        type="line"
      >
        <n-tab-pane name="backend" tab="To Backends">
          <n-scrollbar style="max-height: 370px">
        <n-timeline
          size="large"
          :style="{ 'padding-top': '5px' }"
        >
          <n-timeline-item
            v-for="e in itemsEventsIn.slice().reverse()"
            :key="e.key"
            :type="e.type"
            :title="e.title"
            :content="e.content"
            :time="e.time"
          />
          <n-timeline-item content="Starting..." />
        </n-timeline>
        </n-scrollbar>

        </n-tab-pane>
        <n-tab-pane name="frontend" tab="To User">
          <n-scrollbar style="max-height: 370px">
            <n-timeline
          size="large"
          :style="{ 'padding-top': '5px' }"
        >
          <n-timeline-item
            v-for="e in itemsEventsOut.slice().reverse()"
            :key="e.key"
            :type="e.type"
            :title="e.title"
            :content="e.content"
            :time="e.time"
          />
          <n-timeline-item content="Starting..." />
        </n-timeline>
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>

    </n-space>
  </div>
</template>
  
<script>
import {
  NSpace,
  NScrollbar,
  NRadioGroup,
  NRadio,
  NCollapse,
  NCollapseItem,
  NTag,
  NTabs,
  NTabPane,
  NTimeline,
  NTimelineItem,
} from "naive-ui";

import { h, ref, computed } from "vue";

export default {
  name: "taskEvents",
  components: {
    NSpace,
    NScrollbar,
    NCollapse,
    NRadioGroup,
    NRadio,
    NCollapseItem,
    NTag,
    NTabs,
    NTabPane,
    NTimeline,
    NTimelineItem,
  },
  props: {
    taskEventsIn: {
      type: Array,
    },
    taskEventsOut: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const showType = ref("1");
    const columns = [
      {
        type: "expand",
        expandable: (rowData) => true,
        renderExpand: (rowData) => {
          return rowData.value.type === "loadTasks"
            ? h(NTag, { type: "success", bordered: false }, () => "loadTasks")
            : h(NSpace, { vertical: false }, () => [
                h(NTag, { type: "success", bordered: false }, () => {
                  rowData.value.type;
                }),
                h("p", null, () => {
                  rowData.value.taskName;
                }),
              ]);
        },
      },
      {
        title: "Event",
        key: "event",
      },
      {
        title: "ID",
        key: "uuid",
      },
    ];

    const genType = (item) => {
      if (item.type === "taskError") {
        return "error";
      } else {
        return "success";
      }
    };

    const genContent = (item) => {
      switch (item.type) {
        // Outward events
        case "loadTasks":
          let taskNum = 0;
          const appNum = item.tasks.length;
          for (let i = 0; i < appNum; i++) {
            taskNum += item.tasks[i].tasks.length;
          }
          return `loadTasks (${item.tasks.length} apps. ${taskNum} tasks)`;

        case "taskFinish":
          return item.message;

        case "taskError":
          return item.message;

        // Inward events
        case "runTask":
          return `enqueue "${item.path}"`;

        default:
          return item.type;
      }
    };

    const itemsEventsIn = computed(() => {
      let index = 0;
      return props.taskEventsIn.map((e) => {
        return {
          title:
            e.event +
            " (" +
            (e.uuid == "NULL" ? "NULL" : e.uuid.slice(0, 8)) +
            ")",
          content: genContent(e.value),
          key: index++,
          type: genType(e.value),
          time: e.time,
        };
      });
    });

    const itemsEventsOut = computed(() => {
      let index = 0;
      return props.taskEventsOut.map((e) => {
        return {
          title:
            e.event +
            " (" +
            (e.uuid == "NULL" ? "NULL" : e.uuid.slice(0, 8)) +
            ")",
          content: genContent(e.value),
          key: index++,
          type: genType(e.value),
          time: e.time,
        };
      });
    });

    return {
      columns,
      showType,
      itemsEventsIn,
      itemsEventsOut,
    };
  },
};
</script>
  