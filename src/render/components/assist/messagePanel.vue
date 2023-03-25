<template>
  <div :width="canvasWidth" :height="canvasHeight">
    <n-tooltip
      v-for="(marker, index) in activeAnnotationsShow"
      :key="index"
      trigger="hover"
    >
      <template #trigger>
        <div
          v-if="marker.kind === 'rect'"
          :style="{
            border: `2px solid #D9554F`,
            width: String(marker.width) + 'px',
            height: String(marker.height) + 'px',
            position: 'absolute',
            left: String(marker.absX) + 'px',
            top: String(marker.absY) + 'px',
          }"
        >
          <n-button
            @mouseover="closeMarker(marker.label)"
            @mouseleave="leaveMarker(marker.label)"
            @mouseenter="overMarker(marker.label)"
            size="small"
            text
          >
            <img
              src="../../assets/icon/logo.png"
              draggable="false"
              alt=""
              width="20"
              style="padding-left: 3px; padding-top: 3px"
            />
          </n-button>
        </div>
        <div
          v-else
          :style="{
            position: 'absolute',
            left: String(marker.absX) + 'px',
            top: String(marker.absY) + 'px',
          }"
        >
          <n-space>
            <n-button
              @mouseover="closeMarker(marker.label)"
              @mouseleave="leaveMarker(marker.label)"
              @mouseenter="overMarker(marker.label)"
              size="small"
              text
            >
              <img
                src="../../assets/icon/logo.png"
                draggable="false"
                alt=""
                width="20"
                style="padding-left: 3px; padding-top: 3px"
              />
            </n-button>
            <n-text
              style="
                font-size: 22px;
                background-color: rgba(255, 255, 255, 0.6);
                border-radius: 5px;
                padding: 5px 10px 5px 10px;
              "
            >
              {{ marker.content }} {{ marker.absX }} {{ marker.absY }}
            </n-text>
          </n-space>
        </div>
      </template>
      {{ marker.kind === "rect" ? marker.content : marker.label }}
    </n-tooltip>

    <card-upload-files ref="cardFileUploadRef" />
    <card-tabs ref="cardTabsRef" />
    <card-select-carousel ref="cardSelectCarouselRef" />
    <card-select-checkbox ref="cardSelectCheckboxRef" />
  </div>
</template>

<script setup>
import { shell, ipcRenderer } from "electron";

import {
  NCarousel,
  NCarouselItem,
  NCard,
  NAvatar,
  NSpace,
  NTag,
  NIcon,
  NImage,
  NDivider,
  NText,
  NTooltip,
  NInput,
  NInputGroup,
  NBadge,
  NSwitch,
  NButton,
  NList,
  NListItem,
  NPopconfirm,
  useNotification,
  NCheckboxGroup,
  NCheckbox,
} from "naive-ui";

import { Select, Mail, FileImport, ExternalLink, Copy } from "@vicons/tabler";

import { h, ref, computed, reactive } from "vue";
import { appConfig } from "@/utils/main/config";

import cardUploadFiles from "./cards/cardUploadFiles.vue";
import cardTabs from "./cards/cardTabs.vue";
import cardSelectCarousel from "./cards/cardSelectCarousel.vue";
import cardSelectCheckbox from "./cards/cardSelectCheckbox.vue";

const notification = useNotification();

let assistWinSize = appConfig.get("assistWinSize");
const canvasWidth = ref(assistWinSize.width);
const canvasHeight = ref(assistWinSize.height);

const activeAnnotationsShow = computed(() => {
  return activeAnnotations.value
    .filter((item) => item.show)
    .map((item) => {
      if (item.scope !== null) {
        item.absX = item.x + activeWin.bounds.x;
        item.absY = item.y + activeWin.bounds.y;
      } else {
        item.absX = item.x;
        item.absY = item.y;
      }
      // console.log(item.absX, item.absY);
      return item;
    });
});

// Input-text request
const inputText = ref([]);
const renderInputText = (command) => {
  inputText.value = Array(command.options.length).fill("");
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () =>
        command.options.map((key) =>
          h(
            NSpace,
            { style: {}, vertical: true },
            {
              default: () => [
                h(NButton, { text: true }, { default: () => key }),
                h(NInput, {
                  size: "small",
                  onInput: (e) => {
                    inputText.value[command.options.indexOf(key)] = e;
                  },
                  placeholder:
                    command.placeholders[command.options.indexOf(key)],
                }),
              ],
            }
          )
        ),
    }
  );
};

const createTextInput = (command) => {
  let title = command.title ? command.title : "Input required";
  let nRef = notification.create({
    title: title,
    content: () => renderInputText(command),
    meta: `task (${command.source})`,
    avatar: () =>
      h(
        NIcon,
        { color: "green" },
        {
          default: () => h(Select),
        }
      ),
    action: () =>
      h(
        NButton,
        {
          size: "small",
          type: "success",
          tertiary: true,
          onClick: () => {
            nRef.destroy();
          },
        },
        {
          default: () => h("span", { style: {} }, "Submit"),
        }
      ),
    onAfterLeave: () => {
      ipcRenderer.send("event-to-main-win", {
        callback: command.callback,
        data: JSON.stringify(inputText.value),
      });
    },
  });
};

// Ref handles to sub-components
const cardFileUploadRef = ref(null);
const cardTabsRef = ref(null);
const cardSelectCarouselRef = ref(null);
const cardSelectCheckboxRef = ref(null);

let activeWin = reactive({
  processId: null,
  name: null,
  bounds: { x: 0, y: 0, width: 0, height: 0 },
});

ipcRenderer.on("window-change", (event, win) => {
  activeWin.processId = win.processId;
  activeWin.name = win.name;
  activeWin.bounds = win.bounds;
  activeAnnotations.value = activeAnnotations.value.map((item) => {
    if (item.scope !== null) {
      item.show = item.scope.owner === activeWin.name;
    } else {
      item.show = true;
    }
    return item;
  });
});

const activeAnnotations = ref([]);


const drawWinAnnotations = (msg) => {
  msg.show = true;
  console.log(msg, "annotation");

  // Annotations attached to a specific window
  if (msg.scope.window !== null) {
    activeAnnotations.value.push(msg);
  } else {
    // clear annotations in msg.scope
  }

  if (msg.duration) {
    setTimeout(() => {
      activeAnnotations.value = activeAnnotations.value.filter(
        (item) => item.label !== msg.label
      );
    }, msg.duration * 1000);
  }
};

ipcRenderer.on("assist-win-push", (event, message) => {
  let messageType = message.type;
  switch (messageType) {
    case "window-annotate":
      drawWinAnnotations(message);
      break;

    case "select":
      cardSelectCheckboxRef.value.enqueue(message);
      break;

    case "text":
      break;

    case "push-notification":
      break;

    case "upload":
      cardFileUploadRef.value.enqueue(message);
      break;

    default:
      console.log("[ ERROR ] unknown message type", message);
      break;
  }
});

var activeMarkerLabel = "";
const overMarker = (label) => {
  activeMarkerLabel = label;
};

const closeMarker = (label) => {
  setTimeout(() => {
    if (activeMarkerLabel === label) {
      activeAnnotations.value = activeAnnotations.value.filter(
        (item) => item.label !== label
      );
      activeMarkerLabel = "";
    }
  }, 800);
};

const leaveMarker = (index) => {
  activeMarkerLabel = "";
};
</script>

<style scoped>
.n-notification-container
  .n-notification
  .n-notification-main
  .n-notification-main__content {
  margin: 2px, 0px, 0px;
}
.n-card {
  margin: 15px;
  border-radius: 10px;
  width: auto;
}

.n-space {
  align-items: center;
}

.n-card > .n-card__content > .runeCard {
  padding: 0 !important;
}

.buttonSwitch {
  margin-top: 5px;
  margin-left: -5px;
}
</style>
