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
    tasks: {
      type: Array,
    }
  },
  setup(props, { emit }) {
    const showType = ref("1");

    return {
      showType
    };
  },
};
</script>
  