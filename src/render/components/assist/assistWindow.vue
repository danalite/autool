<template>
  <n-notification-provider :placement="promptPosition">
    <div>
      <messagePanel @togglePromptPlacement="togglePromptPlacement" />
      <n-drawer
        v-model:show="showDrawer"
        content-style="height: 95%; padding: 0px;"
        :width="500"
        :placement="'left'"
        :show-mask="false"
        :mask-closable="false"
        style="border-radius: 12px;"
      >
        <n-drawer-content
          :native-scrollbar="false"
          closable
          body-content-style="height: 95%; padding: 0px"
        >
          <template #header>
            <n-popselect v-model:value="selectType" :options="options">
              <n-button>{{ selectType || "Popselect" }}</n-button>
            </n-popselect>
          </template>

          <webview
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
  NButton,
  NPopselect,
} from "naive-ui";
import { PlaylistAdd } from "@vicons/tabler";
import messagePanel from "./messagePanel.vue";
import { ipcRenderer } from "electron";

import { onMounted, ref } from "vue";
import { appConfig } from "@/utils/main/config";

document.title = "Assist";
document.getElementsByTagName("html")[0].style.height = "100%";
document.getElementsByTagName("body")[0].style.height = "100%";

const promptPosition = ref(appConfig.get("promptPosition"));
var isMouseClickThrough = true;

const togglePromptPlacement = async () => {
  const position =
    promptPosition.value == "top-left" ? "top-right" : "top-left";
  promptPosition.value = position;
  appConfig.set("promptPosition", position);
};

const selectType = ref("https://www.google.com/");

// TODO: use options defined by users
const options = [
  {
    label: "ChatGPT Plus",
    value: "https://chat.openai.com/",
  },
  {
    label: "AuTool Documents",
    value: "https://danalites.github.io/autoo/",
  }
];

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

const showDrawer = ref(false);
ipcRenderer.on("toggle-helper-drawer", (event, arg) => {
  showDrawer.value = !showDrawer.value;
});

// document.getElementsByTagName("body")[0].addEventListener("mouseover", (e) => {
//   console.log("@@", "over body", e.path);
//   if (!isMouseClickThrough && e.path.length < 5) {
//     ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
//   } else if (isMouseClickThrough && e.path.length > 8) {
//     ipcRenderer.invoke("assist-ignore-mouse-events", false);
//   }
// });

function refreshElements() {
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
}

// Events to trigger when crossing the boundary of the prompt
setTimeout(() => {
  ipcRenderer.on("mouse-over-assist", async (event, data) => {
    // console.log("@@", "mouse-over-assist", data, isMouseClickThrough);
    if (data.isOverPrompt) {
      refreshElements();
    } else if (isMouseClickThrough && showDrawer.value) {
      isMouseClickThrough = false;
      ipcRenderer.invoke("assist-ignore-mouse-events", false);
    }
  });
  ipcRenderer.on("mouse-leave-assist", async (event, data) => {
    if (!isMouseClickThrough) {
      isMouseClickThrough = true;
      ipcRenderer.invoke("assist-ignore-mouse-events", true, { forward: true });
    }
  });
}, 500);
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
