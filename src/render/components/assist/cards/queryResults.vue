<template>
  <n-list hoverable :show-divider="false">
    <n-list-item v-for="option in props.options" :key="option.value" :style="{
        padding: '0px',
        margin: '0px',
        cursor: 'pointer',
        }">
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
  </n-list>
</template>

<script setup>
import { h } from "vue";
import { NAvatar, NText, NList, NListItem } from "naive-ui";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
});
</script>
