<template>
  <n-list v-show="props.options.length > 0" hoverable :show-divider="false">
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
          <n-image
            width="35"
            :src="createImgUrl(option.ext)"
            preview-disabled
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
import { NImage, NText, NList, NListItem, NScrollbar } from "naive-ui";

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
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
};
</script>