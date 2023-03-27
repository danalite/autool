<template>
  <div></div>
</template>
  
<script setup>
import {
  NSpace,
  NImage,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NAutoComplete,
  NButton,
  NAvatar,
  NSwitch,
  NCheckboxGroup,
  NCheckbox,
  NText,
  NTabs,
  NSelect,
  NIcon,
  NTabPane,
  NList,
  NListItem,
  NCarousel,
  NCarouselItem,
  useNotification,
} from "naive-ui";

import { h, reactive, ref } from "vue";
import { ipcRenderer, shell } from "electron";

import { handleCopyImg } from "@/utils/render/msgRenders";
import { ExternalLink } from "@vicons/tabler";

const notification = useNotification();
const retValues = reactive({});

const renderCheckbox = (content) => {
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        h(
          NText,
          {
            style: {
              "font-size": "14px",
              "line-height": "0px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
          },
          {
            default: () => content.label,
          }
        ),
        h(
          NCheckboxGroup,
          {
            onUpdateValue: (value) => {
              retValues[content.key] = value;
            },
            defaultValue: content.preset,
            max: content.max,
            min: content.min,
          },
          {
            default: () =>
              h(
                NSpace,
                {
                  style: { "margin-top": "5px", "margin-bottom": "2px" },
                  itemStyle: "display: flex;",
                },
                {
                  default: () =>
                    content.content.map((option) =>
                      h(
                        NCheckbox,
                        {
                          label: option.label,
                          value: option.value,
                        },
                        {}
                      )
                    ),
                }
              ),
          }
        ),
      ],
    }
  );
};

const renderTextInput = (content) => {
  return h(
    NInputGroup,
    { size: "medium" },
    {
      default: () => [
        h(
          NInputGroupLabel,
          { style: { "font-size": "14px" }, size: "small" },
          { default: () => content.label }
        ),
        h(NInput, {
          onUpdateValue: (value) => {
            retValues[content.key] = value;
          },
          size: "small",
          placeholder: content.placeholder,
          style: { "font-size": "14px" },
        }),
      ],
    }
  );
};

const renderCarousel = (content) => {
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        h(
          NText,
          {
            style: {
              "font-size": "14px",
              "line-height": "0px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
          },
          {
            default: () => content.label,
          }
        ),
        h(
          NCarousel,
          {
            effect: "card",
            "prev-slide-style":
              "transform: translateX(-150%) translateZ(-800px);",
            "next-slide-style":
              "transform: translateX(50%) translateZ(-800px);",
            style: { height: "180px", padding: "10px 0px" },
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
                      h(NImage, {
                        src: item.value,
                        onClick: () => handleCopyImg(item.value),
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
                          onClick: () => shell.openExternal(item.value),
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
                          style: {
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                          },
                          onUpdateValue: (value) => {
                            if (retValues[content.key] == null) {
                              retValues[content.key] = [];
                            }
                            if (value) {
                              retValues[content.key].push(item);
                            } else {
                              retValues[content.key].splice(
                                retValues[content.key].indexOf(item),
                                1
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
        ),
      ],
    }
  );
};

const renderSingleSelect = (content) => {
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        h(
          NText,
          {
            style: {
              "font-size": "14px",
              "line-height": "0px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
          },
          {
            default: () => content.label,
          }
        ),
        h(
          NSelect,
          {
            onUpdateValue: (value) => {
              retValues[content.key] = value;
            },
            options: content.content,
            size: "small",
            style: { "font-size": "14px" },
          },
          {
            default: () => {},
          }
        ),
      ],
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

function querySearch(query, params) {
  return new Promise(function (resolve, reject) {
    var server = new WebSocket("ws://localhost:5678");
    server.onopen = function () {
      server.send(
        JSON.stringify({
          event: "I_EVENT_WSS_REQ",
          value: "Search",
          query: query,
          params: params,
        })
      );
    };
    server.onerror = function (err) {
      reject(err);
    };
    server.onmessage = function (e) {
      resolve(e.data);
    };
  });
}

const dynamicOptions = ref([]);
const renderDynamicInput = (content) => {
  return h(
    NSpace,
    {},
    {
      default: () => [
        h(
          NText,
          {
            style: {
              "font-size": "14px",
              "line-height": "0px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
          },
          {
            default: () => content.label,
          }
        ),
        h(NAutoComplete, {
          onUpdateValue: (value) => {
            querySearch(value, content.params)
              .then(function (data) {
                dynamicOptions.value = JSON.parse(data);
              })
              .catch(function (err) {
                console.log("[ ERROR ] querySearch ", err);
              });
          },
          options: dynamicOptions,
          size: "small",
          style: { "font-size": "14px" },
        }),
      ],
    }
  );
};

const renderContent = (content) => {
  switch (content.type) {
    case "list":
      return renderList(content);

    case "tabs":
      return renderTabs(content);

    case "select":
      if (content.imagePreview == true) {
        return renderCarousel(content);
      } else {
        if (content.max > 1) {
          return renderCheckbox(content);
        } else {
          return renderSingleSelect(content);
        }
      }

    // dynamic inputs (search files, HTTP requests, etc.)
    case "dynamic":
      return renderDynamicInput(content);

    case "text":
      return renderTextInput(content);

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

function process(key, value) {
  if (key == "key") {
    retValues[value] = null;
  }
}

function traverse(o, func) {
  for (var i in o) {
    func.apply(this, [i, o[i]]);
    if (o[i] !== null && typeof o[i] == "object") {
      traverse(o[i], func);
    }
  }
}

const enqueue = (message) => {
  traverse(message.content, process);
  console.log("waiting for...", retValues);

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
    onAfterLeave: () => {
      ipcRenderer.send("event-to-main-win", {
        callback: message.callback,
        data: JSON.stringify(retValues),
      });
    },
  });
};

defineExpose({
  enqueue,
});
</script>