<template>
  <div></div>
</template>
  
<script setup>
import {
  NSpin,
  NSpace,
  NInput,
  NInputGroup,
  NButton,
  NAvatar,
  NDivider,
  NText,
  NTabs,
  NUpload,
  NTabPane,
  NList,
  NListItem,
  useNotification,
} from "naive-ui";

import { h, ref, computed } from "vue";
import { ipcRenderer } from "electron";

import { genUUID, querySearchCb } from "@/utils/render/components/common";

import queryResults from "./queryResults.vue";
import { renderTitle } from "@/utils/render/components/common";
import { renderChatWindow } from "@/utils/render/components/renderChatWindow";
import { renderNumberInput } from "@/utils/render/components/renderInputNumber";
import { renderMedia } from "@/utils/render/components/renderMedia";
import { renderImageList } from "@/utils/render/components/renderImageList";
import { renderCarousel } from "@/utils/render/components/renderCarousel";
import { renderUpload } from "@/utils/render/components/renderUpload";
import { renderCheckbox } from "@/utils/render/components/renderCheckbox";
import { renderText } from "@/utils/render/components/renderText";

import { useStore } from "@/render/store";
const emits = defineEmits(["drawMask"]);
const notification = useNotification();

const loadingElements = ref([]);
const store = useStore();

var messageQueue = [];

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
              style: {},
            },
            {
              default: () => renderContent(item),
            }
          )
        ),
    }
  );
};

const renderDynamicUpdate = (content) => {
  if (content.onSelect != null) {
    return h(
      NSpace,
      { vertical: true },
      {
        default: () => [
          h(NDivider, { dashed: true }),
          loadingElements.value.find((item) => item === content.key)
            ? h(NSpin, { size: "small" })
            : renderContent(store.getReturnValue()[content.key]),
        ],
      }
    );
  } else {
    return h(NUpload, {
      listType: "image",
      style: { width: "300px" },
      fileList: store.getReturnValue()[content.key],
      onUpdateFileList: (value) => {
        // console.log("[ INFO ] onUpdateChange ", value);
        store.setValue(content.key, value);
      },
    });
  }
};

const rawOptions = ref([]);
const dynamicOptions = computed(() => {
  return rawOptions.value.map((item) => {
    return { ...item };
  });
});

const renderDynamicInput = (content) => {
  if (store.getReturnValue()[content.key] == null) {
    store.setValue(content.key, []);
  }

  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        // Search input bar
        renderTitle(content.label),
        h(
          NInputGroup,
          { size: "small" },
          {
            default: () => [
              h(NInput, {
                placeholder: "Search",
                size: "small",
                round: true,
                style: { "font-size": "14px", width: "250px" },
                onUpdateValue: (value) => {
                  if (value == "") {
                    rawOptions.value = [];
                    if (content.onSelect != null) {
                      store.setValue(content.key, {});
                    }
                    return;
                  }
                  // Top-level search returning a list
                  const searchType = content.options?.search ?? "";
                  const params = content.options?.params ?? {};
                  querySearchCb(value, searchType, params, (data) => {
                    console.log("[ INFO ] querySearchCb", data);
                    rawOptions.value = JSON.parse(data);
                    return "done";
                  });
                },
              }),
            ],
          }
        ),

        // Display filtered results
        h(queryResults, {
          options: dynamicOptions.value,
          style: { width: "300px" },

          // Click any of the item in the list
          onCustomEvent: (data) => {
            if (content.max == 1) {
              store.setValue(content.key, data.value);
              if (content.instantQuit) {
                store.clearCurrentSession();
              }
            } else {
              if (content.onSelect != null) {
                store.setValue(content.key, {});
                loadingElements.value.push(content.key);

                // Second level search that returns a single item
                const searchType = content.onSelect?.search ?? "";
                const params = content.onSelect?.params ?? {};
                params["QUERY"] = data.value;
                params["__PARENT_SEARCH_TYPE__"] =
                  content.options?.search ?? "";

                querySearchCb("*", searchType, params, (resp) => {
                  loadingElements.value = loadingElements.value.filter(
                    (item) => item !== content.key
                  );
                  const v = JSON.parse(resp);
                  var eos = true;

                  if (v.type == "text") {
                    if (v.stream) {
                      eos = false;
                    }

                    const prev = store.getReturnValue()[content.key];
                    const new_v = prev.content
                      ? prev.content + v.content
                      : v.content;

                    store.setValue(content.key, {
                      type: "text",
                      label: v.label ? v.label : "result",
                      content: new_v,
                    });
                  } else {
                    store.setValue(content.key, v);
                  }

                  if (eos) {
                    return "done";
                  }
                });
              } else {
                let item = {
                  id: data.label,
                  name: data.value,
                  status: "finished",
                };
                const e = store.getReturnValue()[content.key];
                if (e.every((i) => i.name !== item.name)) {
                  e.push(item);
                  store.setValue(content.key, e);
                }
              }
            }
          },
        }),
        renderDynamicUpdate(content),
      ],
    }
  );
};

const renderContent = (content) => {
  switch (content.type) {
    case "list":
      // console.log("@@@", content)
      if (content.imagePreview == true) {
        return renderImageList(content);
      } else {
        return renderList(content);
      }

    case "tabs":
      return renderTabs(content);

    case "select":
      if (content.imagePreview == true) {
        return renderCarousel(content);
      } else {
        return renderCheckbox(content);
      }

    // dynamic inputs (search files, HTTP requests, Screen selection)
    case "dynamic":
      return renderDynamicInput(content);

    case "interactive":
      return renderChatWindow(content);

    case "upload":
      return renderUpload(content);

    case "text":
      return renderText(content);

    case "number":
      return renderNumberInput(content);

    case "audio":
    case "video":
      return renderMedia(content);

    case "webview":
      return h(
        "webview",
        {
          src: content.source,
          style: { width: "100%", height: "600px", fontSize: "12px" },
        },
        { default: () => "Your browser does not support the video element." }
      );

    default:
      if (typeof content == "object") {
        if (Object.keys(content).length > 0) {
          return h(
            NText,
            { style: { "font-size": "14px" } },
            { default: () => JSON.stringify(content) }
          );
        }
      } else {
        // if it is an array
        if (!Array.isArray(content)) {
          return h(
            NText,
            { style: { "font-size": "14px" } },
            { default: () => JSON.stringify(content) }
          );
        }
      }
  }
};

const renderTabs = (content) => {
  // console.log("renderTabs", content);
  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        h(
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
        ),
      ],
    }
  );
};

const newNotification = (message) => {
  const nRef = notification.create({
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
            // store.clearCurrentSession();
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
          "https://raw.githubusercontent.com/danalite/autool/main/imgs/logo.png",
        style: {
          backgroundColor: "#ffffff",
        },
      }),
    onAfterLeave: () => {
      const returnValue = store.getReturnValue();
      if (Object.keys(returnValue).length > 0) {
        ipcRenderer.send("event-to-main-win", {
          callback: message.callback,
          data: JSON.stringify(returnValue),
        });
      }
      ipcRenderer.removeAllListeners("mouse-hover");
      nRef.destroy();
      rawOptions.value = [];

      store.clearCurrentSession();
      if (messageQueue.length > 0) {
        enqueue(messageQueue.shift().message);
      }
    },
  });
  store.initializeSession(message, nRef);
};

const enqueue = (message) => {
  const newID = message.uuid || genUUID();

  if (store.getCurrentSession() != null) {
    messageQueue.push({
      id: newID,
      message: message,
    });
  } else {
    newNotification(message);
  }
};

defineExpose({
  enqueue,
});
</script>