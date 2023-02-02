<template>
  <n-notification-provider :placement="'top'">
    <messagePanel></messagePanel>
  </n-notification-provider>
</template>

<script setup>
import { NNotificationProvider } from "naive-ui";
import messagePanel from "./messagePanel.vue";
import { ipcRenderer } from "electron";

document.title = "Assist";
document.getElementsByTagName("html")[0].style.height = "100%";
document.getElementsByTagName("body")[0].style.height = "100%";

var isMouseClickThrough = false;

document.getElementsByTagName("body")[0].addEventListener("mouseover", (e) => {
  // console.log("@@", "over body", e.path);
  if (!isMouseClickThrough && e.path.length < 5) {
    ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
  } else if (isMouseClickThrough && e.path.length > 8) {
    ipcRenderer.invoke("assist-ignore-mouse-events", false);
  }
});

ipcRenderer.on("mouse-over-assist", async (event) => {
  const listeningAttr = "listeningForMouse";

  var elements = document.getElementsByClassName("n-notification");
  if (elements.length == 0) {
    isMouseClickThrough = true;
    ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
    return;
  }

  for (const ele of elements) {
    if (ele.getAttribute(listeningAttr)) {
      continue;
    }
    ele.addEventListener("mouseenter", () => {
      // console.log("@@", "in notification. block");
      isMouseClickThrough = false;
      ipcRenderer.invoke("assist-ignore-mouse-events", false);
    });
    ele.addEventListener("mouseleave", () => {
      // console.log("@@", "leave notification. pass");
      isMouseClickThrough = true;
      ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
    });
    ele.setAttribute(listeningAttr, true);
  }

  // console.log("@@", elements);
});
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
