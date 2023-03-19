<template>
  <div :width="canvasWidth" :height="canvasHeight">
    <n-tooltip
      v-for="(marker, index) in activeAnnotations"
      :key="index"
      trigger="hover"
    >
      <template #trigger>
        <div
          v-if="marker.type === 'rect'"
          :style="{
            border: `2px solid #D9554F`,
            width: marker.width,
            height: marker.height,
            position: 'absolute',
            left: marker.x,
            top: marker.y,
          }"
        >
          <n-button
            @mouseover="closeMarker(index)"
            @mouseleave="leaveMarker(index)"
            @mouseenter="overMarker(index)"
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
            left: marker.x,
            top: marker.y,
          }"
        >
          <n-space>
            <n-button
              @mouseover="closeMarker(index)"
              @mouseleave="leaveMarker(index)"
              @mouseenter="overMarker(index)"
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
              type="secondary"
            >
              {{ marker.content }}
            </n-text>
          </n-space>
        </div>
      </template>
      {{ marker.label }}
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

import { h, ref, onMounted } from "vue";
import { appConfig } from "@/utils/main/config";

import cardUploadFiles from "./cards/cardUploadFiles.vue";
import cardTabs from "./cards/cardTabs.vue";
import cardSelectCarousel from "./cards/cardSelectCarousel.vue";
import cardSelectCheckbox from "./cards/cardSelectCheckbox.vue";

const notification = useNotification();

let assistWinSize = appConfig.get("assistWinSize");
const canvasWidth = ref(assistWinSize.width);
const canvasHeight = ref(assistWinSize.height);

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

const deleteAutoRune = () => {
  if (appConfig.has(`autoRune.${currentChamp.value}`)) {
    appConfig.delete(`autoRune.${currentChamp.value}`);
    isAutoRune.value = 0;
  }
};

// Ref handles to sub-components
const cardFileUploadRef = ref(null);
const cardTabsRef = ref(null);
const cardSelectCarouselRef = ref(null);
const cardSelectCheckboxRef = ref(null);

ipcRenderer.on("assist-win-push", (event, message) => {
  let messageType = message.type;
  switch (messageType) {
    case "select":
      createSelectOptions({
        title: message.title,
        source: message.source,
        options: message.options,
        max: message.max,
        min: message.min,
        preset: message.preset,
        timeout: message.timeout,
        isPreview: message.isPreview,
        callback: message.callback,
      });
      break;

    case "text":
      createTextInput({
        title: message.title,
        source: message.source,
        options: message.options,
        placeholders: message.preset,
        callback: message.callback,
      });
      break;

    case "push-notification":
      createNotification({
        title: message.title,
        content: message.content,
        source: message.source,
        timeout: message.timeout,
        isPreview: message.isPreview,
      });
      break;

    case "upload":
      cardFileUploadRef.value.enqueue({
        title: message.title,
        source: message.source,
        max: message.max,
        allowDir: message.directory,
        callback: message.callback,
      });
      break;
    default:
      console.log("[ ERROR ] unknown message type", message);
      break;
  }
});

onMounted(() => {
  setTimeout(() => {
    // createNotification({
    //   title: "AuTool started",
    //   content: ["Aren't you excited?", "Click me to copy text"],
    //   timeout: 60,
    //   source: "console.MsgPanel",
    // });
    cardFileUploadRef.value.enqueue({
      title: "sss",
      source: "dsads",
      max: 5,
      allowDir: true,
      callback: "dsadsa",
    });

    cardTabsRef.value.enqueue({
      title: "ssss",
      source: "dsads",
      max: 5,
      allowDir: true,
      callback: "dsadsa",
    });

    cardSelectCarouselRef.value.enqueue({
      title: "ssss",
      source: "dsads",
      max: 5,
      options: [
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
      ],
      callback: "dsadsa",
    });

    cardSelectCheckboxRef.value.enqueue({
      title: "ssss",
      source: "dsads",
      max: 5,
      options: [
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
        {
          label: "sdsd",
          value:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        },
      ],
      callback: "dsadsa",
    });
  }, 1000);
});

const activeAnnotations = ref([
  {
    label: "Some tips",
    type: "rect",
    x: "0px",
    y: "0px",
    width: "100px",
    height: "100px",
    color: "#ff0000",
  },
  {
    label: "Some tips XXX",
    type: "rect",
    x: "600px",
    y: "200px",
    width: "600px",
    height: "100px",
    color: "#ff0000",
  },
  {
    label: "Some tips XXX",
    type: "text",
    x: "400px",
    y: "100px",
    content: "Some tips AAA ~~~~~~~",
    size: "20px",
    color: "#ff0000",
  },
]);

var activeMarkerIndex = -1;
const overMarker = (index) => {
  activeMarkerIndex = index;
};

const closeMarker = (index) => {
  setTimeout(() => {
    if (activeMarkerIndex === index) {
      activeAnnotations.value.splice(index, 1);
      activeMarkerIndex = -1;
    }
  }, 800);
};

const leaveMarker = (index) => {
  activeMarkerIndex = -1;
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
