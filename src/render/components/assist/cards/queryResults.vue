<template>
  <n-list
    v-show="props.options.length > 0"
    hoverable
    style="margin-top: 10px"
    :show-divider="false"
  >
    <n-scrollbar
      :style="{
        maxHeight: props.height,
      }"
    >
      <n-list-item
        v-for="option in props.options"
        :key="option.label"
        :style="{
          paddingTop: '6px',
          paddingBottom: '6px',
          margin: '0px',
          cursor: 'pointer',
        }"
        @click="clickItem(option)"
      >
        <div style="display: flex; align-items: center">
          <n-image
            :width="option.width || 35"
            lazy
            :previewed-img-props="{
              maxHeight: '35px',
              borderRadius: '4px',
              objectFit: 'cover',
              objectPosition: 'top',
            }"
            :src="option.src || createImgUrl(option.ext)"
            preview-disabled
          />
          <n-space
            style="
              margin-left: 12px;
              padding: 4px 0;
              font-size: small;
              line-height: 15px;
              max-width: 230px;
            "
          >
            <n-text>{{ option.label }}</n-text>
          </n-space>
        </div>
        <n-tag
          depth="3"
          size="small"
          type="success"
          :bordered="false"
          style="font-size: small; line-height: 15px; margin-top: 7px"
        >
          {{ option.description || "description" }}
        </n-tag>
      </n-list-item>
    </n-scrollbar>
  </n-list>
  <n-alert
    type="info"
    v-show="!props.searchState && props.options.length == 0"
    :bordered="false"
    style="margin-top: 10px"
  >
    No results
  </n-alert>
  <n-spin v-show="props.searchState" style="margin-top: 20px" size="small" />
</template>

<script setup>
import { h } from "vue";
import {
  NImage,
  NText,
  NSpace,
  NList,
  NListItem,
  NScrollbar,
  NButton,
  NIcon,
  NTag,
  NResult,
  NSpin,
  NAlert,
} from "naive-ui";
import { shell } from "electron";
import { PlayerPlay, Trash } from "@vicons/tabler";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: "360px",
  },
  searchState: {
    type: Boolean,
    default: false,
  },
});

const createImgUrl = (ext) => {
  // console.log(ext);
  switch (ext) {
    case ".doc":
    case ".docx":
      return require("../../../assets/icon/icon-word-48px.png");
    case ".xls":
    case ".xlsx":
      return require("../../../assets/icon/icon-excel-48px.png");
    case ".pdf":
      return require("../../../assets/icon/icon-pdf-48px.png");
    case ".ppt":
    case ".pptx":
      return require("../../../assets/icon/icon-pptx-48px.png");
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
    case ".gif":
    case ".bmp":
    case ".svg":
      return require("../../../assets/icon/icon-image-48px.png");
    case "":
      return require("../../../assets/icon/icon-folder-48px.png");
    default:
      return require("../../../assets/icon/icon-google-doc-48px.png");
  }
};

const emits = defineEmits(["customEvent"]);
const clickItem = (option) => {
  emits("customEvent", option);
  if (option.link) {
    shell.openExternal(option.link);
  }
};
</script>
