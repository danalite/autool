<template>
  <div :width="canvasWidth" :height="canvasHeight">
    <n-popover
      v-for="(marker, index) in activeAnnotationsShow"
      :key="index"
      trigger="hover"
      placement="left"
      :delay="800"
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
            // display: 'flex'
          }"
        >
          <n-button
            @mouseover.stop="closeMarker(marker.label)"
            @mouseleave.stop="leaveMarker(marker.label)"
            @mouseenter.stop="overMarker(marker.label)"
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

      <!-- More helper icons: report -->
      <div class="btn-list">
        <n-button text size="small">
          <img
            src="../../assets/icon/logo.png"
            draggable="false"
            alt=""
            width="20"
            style="padding-left: 3px; padding-top: 3px"
          />
        </n-button>
        <n-button text size="small">
          <img
            src="../../assets/icon/logo.png"
            draggable="false"
            alt=""
            width="20"
            style="padding-left: 3px; padding-top: 3px"
          />
        </n-button>
      </div>
      {{ marker.kind === "rect" ? marker.content : marker.label }}
    </n-popover>

    <mod-user-notification ref="modUserNotificationRef" />
    <mod-user-input ref="modUserInputRef" />
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
  NPopover,
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

import { ref, computed, reactive } from "vue";
import { appConfig } from "@/utils/main/config";

import modUserNotification from "./cards/modUserNotification.vue";
import modUserInput from "./cards/modUserInput.vue";

let assistWinSize = appConfig.get("assistWinSize");
const canvasWidth = ref(assistWinSize.width);
const canvasHeight = ref(assistWinSize.height);

const activeAnnotationsShow = computed(() => {
  return activeAnnotations.value
    .filter((item) => item.show)
    .filter((item) => {
      let toShow = true;
      if (item.after !== undefined) {
        toShow = item.after.every((label) =>
          closedMarkers.value.includes(label)
        );
      }
      // console.log(item.label, toShow, "@@@", item.after);
      if (item.duration && item.after !== undefined && toShow) {
        setTimeout(() => {
          activeAnnotations.value = activeAnnotations.value.filter(
            (i) => i.label !== item.label
          );
          closedMarkers.value.push(item.label);
        }, item.duration * 1000);
      }
      return toShow;
    })
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

// Ref handles to sub-components
const modUserNotificationRef = ref(null);
const modUserInputRef = ref(null);

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
    // console.log(item.scope, activeWin.name);
    if (item.scope !== null) {
      item.show = item.scope.owner === activeWin.name;
    } else {
      item.show = true;
    }
    return item;
  });
  // console.log(activeAnnotations.value, activeAnnotationsShow.value);
});

const activeAnnotations = ref([]);
const closedMarkers = ref([]);

ipcRenderer.on("assist-win-push", (event, message) => {
  let messageType = message.type;
  switch (messageType) {
    case "window-annotate":
      activeAnnotations.value.push(message);
      break;

    case "user-notify":
      modUserNotificationRef.value.enqueue(message);
      break;

    case "user-input":
      modUserInputRef.value.enqueue(message);
      break;

    default:
      console.log("[ ERROR ] invalid type", message.type, message);
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
      closedMarkers.value.push(label);
    }
  }, 500);
};

const leaveMarker = (index) => {
  activeMarkerLabel = "";
};
</script>

<style scoped>
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
