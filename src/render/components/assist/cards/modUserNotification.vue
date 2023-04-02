<template>
  <div></div>
</template>
  
<script setup>
import {
  NSpace,
  NButton,
  NAvatar,
  NText,
  NTabs,
  NIcon,
  NTabPane,
  NList,
  NListItem,
  NCarousel,
  NCarouselItem,
  useNotification,
} from "naive-ui";

import { h, ref } from "vue";
import { ipcRenderer, shell } from "electron";
import { handleCopyImg } from "@/utils/render/msgRenders";
import { ExternalLink, Bookmarks } from "@vicons/tabler";

const notification = useNotification();
const renderText = (content) => {
  return h(
    NSpace,
    {},
    {
      default: () => [
        h(
          NIcon,
          { size: 16, color: "#0e7a0d" },
          { default: () => h(Bookmarks) }
        ),
        h(
          NButton,
          {
            text: true,
            style: {
              "font-size": "15px",
              "line-height": "0px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
            onClick: () => {
              navigator.clipboard.writeText(content.content);
            },
          },
          {
            default: () => content.label,
          }
        ),
      ],
    }
  );
};

const renderCarousel = (content) => {
  return h(
    NCarousel,
    {
      effect: "card",
      "prev-slide-style": "transform: translateX(-150%) translateZ(-800px);",
      "next-slide-style": "transform: translateX(50%) translateZ(-800px);",
      style: { height: "180px", width: "290px" },
      "show-dots": false,
    },
    {
      default: () =>
        content.content.map((item) => {
          return h(
            NCarouselItem,
            { style: { width: "70%" } },
            {
              default: () => [
                h("img", {
                  src: item,
                  onClick: () => handleCopyImg(item),
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
                    onClick: () => shell.openExternal(item),
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
              ],
            }
          );
        }),
    }
  );
};

const renderList = (content) => {
  return h(
    NList,
    {
      bordered: false,
      showDivider: true,
      // hoverable: true,
      // clickable: true,
    },
    {
      default: () =>
        content.content.map((item) =>
          h(
            NListItem,
            {
              style: {
                "padding-top": "10px",
                "padding-bottom": "10px",
              },
            },
            {
              default: () => renderContent(item),
            }
          )
        ),
    }
  );
};

const renderContent = (content) => {
  // console.log("@@", content, typeof content);
  if (typeof content == "string") {
    return renderText({ label: content, content: content });
  }

  switch (content.type) {
    case "text":
      return renderText(content);

    case "list":
      return renderList(content);

    case "tabs":
      return renderTabs(content);

    case "audio":
      return h(
        "audio",
        {
          src: content.source,
          controls: true,
          volume: content.volume || 0.5,
          style: { width: "90%", maxHeight: "30px"},
        },
        { default: () => "Your browser does not support the audio element." }
      );

    case "video":
      return h(
        "video",
        {
          src: content.source,
          controls: true,
          volume: content.volume || 0.5,
          style: { width: "90%", maxHeight: "320px" },
        },
        { default: () => "Your browser does not support the video element." }
      );

    case "carousel":
      return renderCarousel(content);

    default:
      console.log("[ ERROR ] Unknown content type", content.type);
      return h(
        NText,
        { style: { "font-size": "14px" } },
        { default: () => JSON.stringify(content) }
      );
  }
};

const renderTabs = (content) => {
  // console.log("renderTabs", content);
  return h(
    NTabs,
    { type: "card" },
    {
      default: () =>
        content.content.map((item) => {
          return h(
            NTabPane,
            { name: item.tab, tab: item.tab },
            {
              default: () => renderContent(item),
            }
          );
        }),
    }
  );
};

const enqueue = (message) => {
  let nRef = notification.create({
    title: () => h("span", message.title),
    description: () => "task: " + message.source,

    content: () => renderContent(message.content),
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
          default: () => h("span", { style: {} }, "Finish"),
        }
      ),
    avatar: () =>
      h(NAvatar, {
        size: "small",
        src: message.icon,
        fallbackSrc:
          "https://raw.githubusercontent.com/danalites/autoo/main/imgs/logo.png",
        style: {
          backgroundColor: "#ffffff",
        },
      }),
    onAfterLeave: () => {},
  });
};

defineExpose({
  enqueue,
});
</script>