<template>
  <n-transfer
    ref="transfer"
    disabled
    source-filterable
    source-filter-placeholder="搜索"
    v-model:value="value"
    :options="options"
    :render-target-label="renderLabel"
  />
</template>
  
<script setup>
import { NSpace, NTransfer, NAvatar, NPopselect, useMessage } from "naive-ui";

import { ref, h } from "vue";
import { ipcRenderer } from "electron";
import { appConfig } from "@/utils/main/config";
import { Refresh, Check } from "@vicons/tabler";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const options = [
  {
    label: "07akioni",
    value: "https://avatars.githubusercontent.com/u/18677354?s=60&v=4",
  },
  {
    label: "amadeus711",
    value: "https://avatars.githubusercontent.com/u/46394163?s=60&v=4",
  },
  {
    label: "Talljack",
    value: "https://avatars.githubusercontent.com/u/34439652?s=60&v=4",
  },
  {
    label: "JiwenBai",
    value: "https://avatars.githubusercontent.com/u/43430022?s=60&v=4",
  },
  {
    label: "songjianet",
    value: "https://avatars.githubusercontent.com/u/19239641?s=60&v=4",
  },
];

const value = ref([options[0].value]);
const renderLabel = function ({ option }) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        margin: "6px 0",
      },
    },
    {
      default: () => [
        h(NAvatar, {
          round: true,
          src: option.value,
          size: "small",
          fallbackSrc:
            "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg",
        }),
        h(
          "div",
          {
            style: {
              display: "flex",
              marginLeft: "6px",
              alignSelf: "center",
            },
          },
          { default: () => option.label }
        ),
      ],
    }
  );
};
</script>
  