<template>
  <div></div>
</template>
  
<script setup>
import {
  NSpin,
  NSpace,
  NInput,
  NInputNumber,
  NInputGroup,
  NButton,
  NDivider,
  NAvatar,
  NSwitch,
  NCheckboxGroup,
  NCheckbox,
  NText,
  NTabs,
  NGrid,
  NGridItem,
  NIcon,
  NUpload,
  NTabPane,
  NList,
  NListItem,
  NCarousel,
  NCarouselItem,
  useNotification,
  NDynamicInput,
} from "naive-ui";

import { h, reactive, ref, computed } from "vue";
import { ipcRenderer, shell } from "electron";

import { genUUID, querySearch } from "@/utils/render/components/common";

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
const retValues = reactive({});
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

function querySearchStream(searchType, params, callback) {
  return new Promise(function (resolve, reject) {
    var server = new WebSocket("ws://localhost:5678");

    server.onopen = function () {
      server.send(
        JSON.stringify({
          event: "I_EVENT_WSS_REQ",
          value: searchType,
          query: "*",
          params: params,
        })
      );
    };
    server.onerror = function (err) {
      reject(err);
    };
    server.onmessage = function (e) {
      callback(e.data);
    };

    resolve({
      server: server,
    });
  });
}

// dynamic input text with different reactions
// E.g., File search + content preview, summary, or call API returns
const renderDynamicUpdate = (content) => {
  const paramsServer = content.params?.server;
  // console.log("[ INFO ] ", retValues[content.key], paramsServer);
  const showType = retValues[content.key]?.type ?? "text";

  if (paramsServer != null) {
    // Need continuous processing of selected item
    return h(
      NSpace,
      { vertical: true },
      {
        default: () => [
          renderTitle("Preview"),

          // return loading page if no data
          loadingElements.value.find((item) => item === content.key)
            ? h(NSpin, { size: "small" })
            : showType == "text"
            ? h(
                NText,
                { style: { "font-size": "14px" } },
                {
                  default: () => retValues[content.key],
                }
              )
            : renderCarousel(retValues[content.key]),
        ],
      }
    );
  } else {
    return h(NUpload, {
      listType: "image",
      style: { width: "300px" },
      fileList: retValues[content.key],
      onUpdateFileList: (value) => {
        // console.log("[ INFO ] onUpdateChange ", value);
        retValues[content.key] = value;
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

var selectStatus = false;
var selectIndex = 0;
const renderDynamicInput = (content) => {
  if (retValues[content.key] == null) {
    retValues[content.key] = [];

    // register callback
  }

  // search == "Files": search for files
  // search == "Segmentation": search for window segmentation
  if (content.search == "Segmentation" && selectStatus == false) {
    selectStatus = true;

    var callback = "SegmentationRequest";
    ipcRenderer.send("to-console", {
      action: "uio-event",
      source: "canvasWindow",
      type: "mouseClicked",
      callback: callback,
      targetWindow: content.params.window,
      wallTime: 200,
    });
    // assume to capture the active window only
    ipcRenderer.on(callback, (event, data) => {
      let params = {
        ...content.params,
        ...data,
      };
      querySearch("predict", content.search, params)
        .then(function (mask) {
          let maskData = JSON.parse(mask);
          ipcRenderer.send("to-console", {
            action: "load-image",
            path: maskData.image,
          });

          ipcRenderer.once("image-loaded", (event, content) => {
            maskData.content = content;
            emits("drawMask", maskData);

            // Add image mask to segmentation list
            rawOptions.value.push({
              label: `mask #${selectIndex++}`,
              src: content,
            });
          });
        })
        .catch(function (err) {
          console.log("[ ERROR ] querySearch ", err);
        });
    });
  }

  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        renderTitle(content.label),
        content.search == "Segmentation"
          ? null
          : h(
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
                        return;
                      }
                      querySearch(value, content.search, content.params)
                        .then(function (data) {
                          rawOptions.value = JSON.parse(data);
                          // console.log("[ INFO ] querySearch ", rawOptions.value);
                        })
                        .catch(function (err) {
                          console.log("[ ERROR ] querySearch ", err);
                        });
                    },
                  }),
                ],
              }
            ),

        // Equivalent to <query-results :queryResults={queryResults} />
        h(queryResults, {
          options: dynamicOptions.value,
          style: { width: "300px" },
          onCustomEvent: (data) => {
            // console.log("Custom event triggered", data);
            // Specially quick path for app launcher
            if (content.max == 1) {
              retValues[content.key] = data;
              if (content.instantQuit) {
                store.clearCurrentSession();
              }
            } else {
              if (content.params?.server != null) {
                retValues[content.key] = "";
                loadingElements.value.push(content.key);
                const params = {
                  ...content.params,
                  queryKey: data.value,
                };

                querySearchStream("SelectItem", params, (resp) => {
                  // Type1: get streamed data from the server
                  loadingElements.value = loadingElements.value.filter(
                    (item) => item !== content.key
                  );
                  const v = JSON.parse(resp);
                  if (v.type == "text") {
                    retValues[content.key] = retValues[content.key] + v.content;
                  } else {
                    retValues[content.key] = v;
                  }
                });
              } else {
                // Select item into a list
                let item = {
                  id: data.label,
                  name: data.value,
                  status: "finished",
                };
                if (retValues[content.key].every((i) => i.name !== item.name)) {
                  retValues[content.key].push(item);
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
            store.clearCurrentSession();
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