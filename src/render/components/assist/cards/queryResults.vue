<template>
  <n-list hoverable :show-divider="false" style="width: 280px">
    <n-scrollbar style="max-height: 280px">
      <n-list-item
        v-for="option in props.options"
        :key="option.value"
        :style="{
          padding: '0px',
          margin: '0px',
          cursor: 'pointer',
        }"
        @click="clickItem(option)"
      >
        <div style="display: flex; align-items: center">
          <n-avatar
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
            size="small"
          />
          <div style="margin-left: 12px; padding: 4px 0">
            <div>{{ option.label }}</div>
            <n-text depth="3" tag="div">description</n-text>
          </div>
        </div>
      </n-list-item>
    </n-scrollbar>
  </n-list>
</template>

<script setup>
import { h } from "vue";
import { NAvatar, NText, NList, NListItem, NScrollbar } from "naive-ui";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["customEvent"]);
const clickItem = (option) => {
  emits("customEvent", option);
};
</script>
