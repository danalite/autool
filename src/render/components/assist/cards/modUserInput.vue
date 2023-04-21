<template>
  <div></div>
</template>
  
<script setup>
import {
  NSpace,
  NInput,
  NInputNumber,
  NInputGroup,
  NButton,
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

import { handleCopyImg } from "@/utils/render/renderComponents";
import { ExternalLink } from "@vicons/tabler";

import queryResults from "./queryResults.vue";
import { renderTitle } from "@/utils/render/renderComponents";

const emits = defineEmits(["drawMask"]);
const notification = useNotification();
const retValues = reactive({});
let nRef = null;

const renderCheckbox = (content) => {
  const options = content.content.map((item) => {
    // if item is of type string, convert it to object
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
      };
    } else {
      return {
        label: item.label,
        value: item.value,
      };
    }
  });
  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        renderTitle(content.label),
        h(
          NCheckboxGroup,
          {
            onUpdateValue: (value) => {
              retValues[content.key] = value;
              if (content.instantQuit && content.max === 1) {
                nRef.destroy();
              }
            },
            style: { "margin-left": "30px" },
            defaultValue: content.preset,
            max: content.max,
            min: content.min,
          },
          {
            default: () =>
              h(
                NGrid,
                {
                  yGap: 8,
                  cols: 1,
                },
                {
                  default: () =>
                    options.map((option) =>
                      h(
                        NGridItem,
                        {
                          span: 1,
                        },
                        {
                          default: () =>
                            h(
                              NCheckbox,
                              {
                                label: option.label,
                                value: option.value,
                              },
                              {
                                default: () =>
                                  h(
                                    NText,
                                    {
                                      style: {
                                        "font-size": "14px",
                                        "line-height": "0px",
                                      },
                                    },
                                    { default: () => option.label }
                                  ),
                              }
                            ),
                        }
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

const renderInput = (content) => {
  if (retValues[content.key] == null) {
    retValues[content.key] = {
      options: content.advanced?.default ?? [],
      checked: [],
    };
  }
  return content.advanced?.dynamic
    ? h(
        NDynamicInput,
        {
          createButtonStyle: {
            "margin-left": "30px",
            "margin-top": "8px",
            "margin-bottom": "8px",
          },
          onCreate: (index) => {
            if (Array.isArray(retValues[content.key])) {
              retValues[content.key].options.splice(index, 0, "");
            }
            return "";
          },

          onRemove: (index) => {
            if (Array.isArray(retValues[content.key])) {
              retValues[content.key].options.splice(index, 1);
            }
          },

          size: "small",
          placeholder: content.placeholder,
          style: { "font-size": "14px" },
          defaultValue: retValues[content.key].options,
        },
        {
          default: ({ value, index }) =>
            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                },
              },
              {
                default: () => [
                  h(NCheckbox, {
                    style: { marginRight: "12px" },
                    onUpdateChecked: (v) => {
                      const current = retValues[content.key].options[index];
                      if (v) {
                        retValues[content.key].checked.push(current);
                      } else {
                        retValues[content.key].checked = retValues[
                          content.key
                        ].checked.filter((item) => item !== current);
                      }
                    },
                  }),
                  h(NInput, {
                    style: { "font-size": "14px" },
                    defaultValue: value,
                    onUpdateValue: (v) => {
                      retValues[content.key].options[index] = v;
                      // console.log(retValues[content.key], "@@@");
                    },
                    size: "small",
                    placeholder: content.placeholder,
                    style: { "font-size": "14px" },
                  }),
                ],
              }
            ),
        }
      )
    : h(NInput, {
        style: { "font-size": "14px" },
        onUpdateValue: (value) => {
          retValues[content.key] = value;
        },
        size: "small",
        placeholder: content.placeholder,
        style: { "font-size": "14px" },
      });
};

const renderText = (content) => {
  return h(
    NSpace,
    { vertical: true, style: {} },
    {
      default: () => [
        renderTitle(content.label),
        // Text input or a simple text to display
        content.key != null
          ? renderInput(content)
          : h(
              NText,
              {
                style: {
                  "font-size": "14px",
                  "line-height": "0px",
                },
              },
              { default: () => content.content }
            ),
      ],
    }
  );
};

const renderCarousel = (content) => {
  const options = content.content.map((item) => {
    // if item is of type string, convert it to object
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
      };
    } else {
      return item;
    }
  });
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        renderTitle(content.label),
        h(
          NCarousel,
          {
            effect: "card",
            "prev-slide-style":
              "transform: translateX(-150%) translateZ(-800px);",
            "next-slide-style":
              "transform: translateX(50%) translateZ(-800px);",
            style: { height: "180px", width: "290px" },
            "show-dots": false,
          },
          {
            default: () =>
              options.map((item) => {
                return h(
                  NCarouselItem,
                  { style: { width: "75%" } },
                  {
                    default: () => [
                      h("img", {
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
                      content.key != null
                        ? h(
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
                          )
                        : null,
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

function querySearch(query, searchType, params) {
  return new Promise(function (resolve, reject) {
    var server = new WebSocket("ws://localhost:5678");
    server.onopen = function () {
      server.send(
        JSON.stringify({
          event: "I_EVENT_WSS_REQ",
          value: `${searchType}`,
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
      server.close();
    };
  });
}

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
  }

  // search == "File": search for files
  // search == "Segmentation": search for window segmentation
  if (content.search == "Segmentation" && selectStatus == false) {
    selectStatus = true;

    var callback = "SegmentationMouseClicked";
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
                nRef.destroy();
              }
            } else {
              let item = {
                id: data.label,
                name: data.value,
                status: "finished",
              };
              if (retValues[content.key].every((i) => i.name !== item.name)) {
                retValues[content.key].push(item);
              }
            }
          },
        }),
        h(NUpload, {
          listType: "image",
          style: { width: "300px" },
          fileList: retValues[content.key],
          onUpdateFileList: (value) => {
            // console.log("[ INFO ] onUpdateChange ", value);
            retValues[content.key] = value;
          },
        }),
      ],
    }
  );
};

const renderUpload = (content) => {
  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        renderTitle(content.label),
        h(
          NUpload,
          {
            defaultFileList: [],
            listType: "image",
            onChange: (event) => {
              const { file, fileList } = event;
              // fileListRef.value = fileList;
              console.log("[ INFO ] onChange ", JSON.stringify(fileList));
              retValues[content.key] = fileList.map((item) => item.file.path);
            },
          },
          {
            default: () =>
              h(NButton, { size: "small" }, { default: () => "Select" }),
          }
        ),
      ],
    }
  );
};

const renderNumberInput = (content) => {
  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        renderTitle(content.label),
        h(NInputNumber, {
          placeholder: content.default,
          size: "small",
          style: { "font-size": "14px", width: "250px" },
          onUpdateValue: (value) => {
            retValues[content.key] = value;
          },
        }),
      ],
    }
  );
};

const renderImageList = (content) => {
  const options = content.content.map((item) => {
    return {
      ...item,
      width: 100,
    };
  });
  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        renderTitle(content.label),
        h(queryResults, {
          options: options,
          style: { width: "290px" },
        }),
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

    // dynamic inputs (search files, HTTP requests, etc.)
    case "dynamic":
      return renderDynamicInput(content);

    case "upload":
      return renderUpload(content);

    case "text":
      return renderText(content);

    case "number":
      return renderNumberInput(content);

    case "audio":
    case "video":
      return h(
        content.type,
        {
          src: content.source,
          controls: true,
          volume: content.volume || 0.5,
          style: {
            width: "90%",
            maxHeight: content.type == "audio" ? "30px" : "320px",
          },
        },
        { default: () => "Your browser does not support the video element." }
      );

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
  Object.assign(retValues, {});
  traverse(message.content, process);
  // console.log("waiting for...", retValues);

  nRef = notification.create({
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
          "https://raw.githubusercontent.com/danalite/autool/main/imgs/logo.png",
        style: {
          backgroundColor: "#ffffff",
        },
      }),
    onAfterLeave: () => {
      // Only send back if there is any input keys specified
      if (Object.keys(retValues).length > 0) {
        ipcRenderer.send("event-to-main-win", {
          callback: message.callback,
          data: JSON.stringify(retValues),
        });
      }

      // Unset preset parameters
      selectStatus = false;
      selectIndex = 0;
      rawOptions.value = [];
      ipcRenderer.removeAllListeners("mouse-hover");
    },
  });
};

defineExpose({
  enqueue,
});
</script>