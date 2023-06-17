<template>
  <n-space vertical  style="width:280px">
    <n-list hoverable clickable :show-divider="false" >
      <n-list-item
        v-for="(p, index) in props.array"
        :key="index"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = -1"
        style="margin-top: 2px; margin-bottom: 2px; padding-top: 5px; padding-bottom: 5px;"
      >
      <n-button text>
      <template #icon>
        <n-icon depth=2 color="pink">
          <BrandTelegram />
        </n-icon>
      </template>
      {{ p.label }}
    </n-button>
        <n-collapse-transition :show="index == activeIndex">
          <n-space justify="center">
            {{ p.value }}
          </n-space>
          
        </n-collapse-transition>
      </n-list-item>
    </n-list>
  </n-space>
</template>

<script setup>
import { NSpace, NCollapseTransition, NList, NListItem, NText, NButton, NIcon } from "naive-ui";
import { BrandTelegram } from "@vicons/tabler";
import { ref } from "vue";

const props = defineProps({
  array: {
    type: Array,
    required: true,
  },
});

const activeIndex = ref(-1);
// NB: popover and tooltip won't work with popup window
// So here we use a mouse hovering tracker
</script>
