<template>
  <n-notification-provider placement="top-right">
    <div>
      <canvas-content />
      <n-drawer
        v-model:show="showDrawer"
        content-style="height: 95%; padding: 0px;"
        :width="drawerWidth"
        placement="left"
        @mouseenter="enterWindow"
        @mouseleave="leaveWindow"
        :show-mask="false"
        :mask-closable="false"
        style="border-radius: 12px"
      >
        <n-drawer-content
          :native-scrollbar="false"
          closable
          body-content-style="height: 95%; padding: 0px"
        >
          <template #header>
            <n-button-group>
              <n-popover trigger="hover">
                <template #trigger>
                  <n-button
                    @click="showDrawer = false"
                    size="small"
                    style="margin-right: 10px"
                  >
                    <n-icon size="25" depth="3">
                      <PlaylistAdd />
                    </n-icon>
                  </n-button>
                </template>
                <n-slider
                  v-model:value="drawerWidth"
                  :min="500"
                  :max="canvasWidth"
                  :step="50"
                  style="width: 200px"
                />
              </n-popover>
              <n-popselect v-model:value="selectType" :options="options">
                <n-button
                  :style="{ width: `${drawerWidth * 0.8}px` }"
                  size="small"
                >
                  <n-ellipsis style="max-width: 500px">
                    {{ selectType || "Popselect" }}
                  </n-ellipsis>
                </n-button>
              </n-popselect>
            </n-button-group>
          </template>

          <webview
            id="my-webview"
            :src="selectType"
            style="width: 100%; height: 100%; border: none"
          ></webview>
        </n-drawer-content>
      </n-drawer>
    </div>
  </n-notification-provider>
</template>

<script setup>
import {
  NNotificationProvider,
  NDrawer,
  NDrawerContent,
  NEllipsis,
  NButton,
  NButtonGroup,
  NPopselect,
  NSlider,
  NIcon,
  NPopover,
} from "naive-ui";

import canvasContent from "./canvasContent.vue";
import { ipcRenderer } from "electron";
import { PlaylistAdd } from "@vicons/tabler";

import { onMounted, ref } from "vue";
import { appConfig } from "@/utils/main/config";

document.title = "Canvas";
document.getElementsByTagName("html")[0].style.height = "100%";
document.getElementsByTagName("body")[0].style.height = "100%";

let assistWinSize = appConfig.get("assistWinSize");
const canvasWidth = ref(assistWinSize.width);

const options = ref([]);
const selectType = ref("https://www.google.com/");

onMounted(() => {
  setTimeout(() => {
    window.addEventListener("DOMContentLoaded", () => {
      // console.log("@@", "DOMContentLoaded");
      refreshElements();
    });

    window.addEventListener("DOMNodeInserted", () => {
      refreshElements();
    });
  }, 3000);
});

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const showDrawer = ref(false);
ipcRenderer.on("toggle-helper-drawer", (event, arg) => {
  if (showDrawer.value) {
    waitForElm("#my-webview").then((elm) => {
      selectType.value = elm.src;
      showDrawer.value = false;
    });
  } else {
    options.value = appConfig
      .get("helperWindowsList")
      .filter((item) => item.isCheck);
    showDrawer.value = true;
  }
});

function refreshElements() {
  const listeningAttr = "listeningForMouse";
  var elements = document.getElementsByClassName("n-notification");
  if (elements.length == 0 && !showDrawer.value) {
    ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
    return;
  }

  for (const ele of elements) {
    if (ele.getAttribute(listeningAttr)) {
      continue;
    }
    ele.addEventListener("mouseenter", () => {
      // console.log("@@", "in notification. block");
      ipcRenderer.invoke("assist-ignore-mouse-events", false);
    });
    ele.addEventListener("mouseleave", () => {
      // console.log("@@", "leave notification. pass");
      ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
    });
    ele.setAttribute(listeningAttr, true);
  }
}

const enterWindow = () => {
  // console.log("@@", "enter window. block");
  ipcRenderer.invoke("assist-ignore-mouse-events", false);
};

const leaveWindow = () => {
  // console.log("@@", "leave window. pass");
  ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
};

const drawerWidth = ref(500);
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
