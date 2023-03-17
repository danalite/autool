<template>
  <n-space vertical>
    <n-dynamic-input v-model:value="customValue" :on-create="onCreate">
      <template #create-button-default> Add whatever you want </template>
      <template #default="{ value }">
        <div style="display: flex; align-items: center; width: 100%">
          <n-checkbox
            v-model:checked="value.isCheck"
            style="margin-right: 12px"
          />
          <n-input
            size="small"
            v-model:value="value.label"
            style="margin-right: 12px; width: 160px"
          />
          <n-input size="small" v-model:value="value.value" type="text" />
        </div>
      </template>
    </n-dynamic-input>
  </n-space>
</template>

<script setup>
import {
  NSpace,
    NDynamicInput,
    NCheckbox,
    NInput,
    NButton
} from "naive-ui";
import { ref } from "vue";
import { appConfig } from "@/utils/main/config";

const customValue = ref([
  {
    isCheck: true,
    label: "Google",
    value: "https://www.google.com",
  },
]);

const onCreate = () => {
  return {
    isCheck: false,
    label: "Google",
    value: "https://www.google.com",
  };
};

</script>
