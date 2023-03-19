<template>
  <div></div>
</template>

<script setup>
import {
  NCarousel,
  NCarouselItem,
  NButton,
  NImage,
  NAvatar,
  NIcon,
  NSwitch,
  useNotification,
} from "naive-ui";

import { h, ref } from "vue";
import { ipcRenderer, shell } from "electron";
import { ExternalLink } from "@vicons/tabler";
import { handleCopyImg } from "@/utils/render/msgRenders";

const notification = useNotification();

const currentOptions = ref([]);
const renderPreviewsSelection = (options) => {
  return h(
    NCarousel,
    {
      effect: "card",
      "prev-slide-style": "transform: translateX(-150%) translateZ(-800px);",
      "next-slide-style": "transform: translateX(50%) translateZ(-800px);",
      style: { height: "180px" },
      "show-dots": false,
    },
    {
      default: () =>
        options.map((option, index) => {
          return h(
            NCarouselItem,
            { style: { width: "70%" } },
            {
              default: () => [
                h(NImage, {
                  src: option.value,
                  onClick: () => handleCopyImg(option.value),
                  height: "180",
                  "object-fit": "fill",
                  "preview-disabled": true,
                }),
                h(
                  NButton,
                  {
                    size: "small",
                    circle: true,
                    type: "info",
                    onClick: () => shell.openExternal(option.value),
                    style: {
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                    },
                  },
                  {
                    default: () =>
                      h(
                        NIcon,
                        { size: 20 },
                        { default: () => h(ExternalLink) }
                      ),
                  }
                ),
                h(
                  NSwitch,
                  {
                    round: false,
                    style: { position: "absolute", bottom: "8px", left: "8px" },
                    onUpdateValue: (value) => {
                      if (value) {
                        currentOptions.value.push({ index: index, ...option });
                      } else {
                        currentOptions.value = currentOptions.value.filter(
                          (item) => item.index !== index
                        );
                      }
                    },
                  },
                  {
                    default: () => null,
                  }
                ),
              ],
            }
          );
        }),
    }
  );
};

const enqueue = (command) => {
  let nRef = notification.create({
    title: () => h("span", command.title),
    description: () => "task: " + command.source,

    content: () => renderPreviewsSelection(command.options),
    meta: () => h("span", new Date().toLocaleString()),
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
    avatar: () =>
      h(NAvatar, {
        size: "small",
        src: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg",
      }),
    onAfterLeave: () => {

    },
  });
};

defineExpose({
  enqueue,
});
</script>