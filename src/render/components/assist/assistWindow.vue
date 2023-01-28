<template>
  <n-notification-provider :placement="'top'">
    <messagePanel class="slide-in-bottom"></messagePanel>
  </n-notification-provider>
</template>

<script setup>
import { NTabs, NTabPane, NNotificationProvider } from "naive-ui";
import messagePanel from "./messagePanel.vue";

import { onMounted, ref } from "vue";
import { ipcRenderer } from "electron";

import { appConfig } from "@/utils/main/config";
import { useStore } from "@/render/store";
import { storeToRefs } from "pinia/dist/pinia";

document.title = "Assist";
document.getElementsByTagName("html")[0].style.height = "100%";
document.getElementsByTagName("body")[0].style.height = "100%";
let isClickThrough = false

document.addEventListener(
  "mouseover",
  function (e) {
    if (e.target.tagName == "BODY" && !isClickThrough) {
      // console.log("mouse enter BODY", e.target.tagName);
      ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
      isClickThrough = true

    } else if (e.target.tagName !== "BODY" && isClickThrough) {
      // console.log("mouse enter ", e.target.tagName);
      ipcRenderer.invoke("assist-ignore-mouse-events", false);
      isClickThrough = false
    }
  }
);
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
