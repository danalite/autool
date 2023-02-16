<template>
  <div></div>
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
  NText,
  NInput,
  NInputGroup,
  NBadge,
  NSwitch,
  NButton,
  NList,
  NListItem,
  NPopconfirm,
  useNotification,
  NUpload,
  NUploadFileList,
  NCheckboxGroup,
  NCheckbox,
} from "naive-ui";

import { Select, Mail, FileImport, ExternalLink, Copy } from "@vicons/tabler";
import { h, ref, onMounted } from "vue";
import { appConfig } from "../../../utils/main/config";
import dragDemo from "../../assets/apps/drop-files-demo.gif";

const notification = useNotification();

const handleCopyImg = (src) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.crossOrigin = "Anonymous";
  img.src = src;

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(async (blob) => {
      // console.log(blob);
      const data = [
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ];
      // https://w3c.github.io/clipboard-apis/#dom-clipboard-write
      await navigator.clipboard.write(data).then(
        () => {
          console.log("Copied to clipboard successfully!");
        },
        () => {
          console.error("Unable to write to clipboard.");
        }
      );
    });
  };
};

const renderPreviews = (images) => {
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
        images.map((image) => {
          return h(
            NCarouselItem,
            { style: { width: "70%" } },
            {
              default: () => [
                h(NImage, {
                  src: image,
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
                    onClick: () => shell.openExternal(image),
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
                  NButton,
                  {
                    size: "small",
                    circle: true,
                    type: "info",
                    onClick: () => handleCopyImg(image),
                    style: { position: "absolute", bottom: "8px", left: "8px" },
                  },
                  {
                    default: () =>
                      h(NIcon, { size: 20 }, { default: () => h(Copy) }),
                  }
                ),
              ],
            }
          );
        }),
    }
  );
};

const renderTitle = (title, icon) => {
  return h(
    NSpace,
    { size: [10, 2] },
    {
      default: () => [
        h(NIcon, { color: "green", size: 20 }, { default: () => h(icon) }),
        h("span", title),
      ],
    }
  );
};

const renderMeta = (source, sub) => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
      },
    },
    [
      h(
        "div",
        {
          style: {
            marginLeft: "0px",
            padding: "4px 0",
          },
        },
        [
          h("div", null, [source]),
          h(
            NText,
            { depth: 3, tag: "div" },
            {
              default: () => sub,
            }
          ),
        ]
      ),
    ]
  );
};

// Closable options selection
let isInputAcquired = true;
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
                    onClick: () => shell.openExternal(image),
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
                        currentOptions.value.push({ index: index, ...option});
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

const renderOptions = (options, params) => {
  if (params.isPreview) {
    return renderPreviewsSelection(options);
  } else {
    return h(
      NCheckboxGroup,
      {
        onUpdateValue: (value) => {
          currentOptions.value = value;
          // console.log("Options: ", value);
        },
        defaultValue: params.preset,
        max: params.max,
        min: params.min,
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
                options.map((option) =>
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
    );
  }
};

const createSelectOptions = (command) => {
  isInputAcquired = true;
  let count = command.timeout;

  // Setup preset values
  let defaultSetValue = false;
  if (command.preset == true || command.preset == false) {
    defaultSetValue = command.preset;
  }

  // Options: ['str'...] or [{label: 'str', value: 'str', set: true/false}...]
  let options = [];
  if (command.options.every((item) => typeof item === "string")) {
    options = command.options.map((option) => {
      return {
        label: option,
        value: option,
        set: defaultSetValue,
      };
    });
  } else {
    options = command.options;
  }

  let preset = options
    .filter((option) => (option.set == true ? true : defaultSetValue))
    .map((option) => option.value);

  currentOptions.value = preset;
  let title = command.title ? command.title : "Select options and continue";

  const nRef = notification.create({
    title: () => renderTitle(title, Select),
    content: () =>
      renderOptions(options, {
        max: command.max,
        min: command.min,
        isPreview: command.isPreview == undefined ? false : command.isPreview,
      }),
    duration: count ? count * 1000 : undefined,
    meta: () =>
      renderMeta(
        `task (${command.source})`,
        count ? `close in ${count} s...` : null
      ),

    action: () =>
      h(
        NSpace,
        {
          style: { "margin-top": "5px", "margin-bottom": "2px", size: [0, 0] },
        },
        {
          default: () => [
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
                type: "error",
                onClick: () => {
                  isInputAcquired = false;
                  nRef.destroy();
                  // TODO: Send back abort ACK and cancel the task
                },
              },
              {
                default: () => h("span", { style: {} }, "Stop"),
              }
            ),
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
                type: "success",
                onClick: () => {
                  isInputAcquired = true;
                  nRef.destroy();
                },
              },
              {
                default: () => h("span", { style: {} }, "Okay"),
              }
            ),
          ],
        }
      ),
    onAfterEnter: () => {
      if (count) {
        const minusCount = () => {
          count--;
          nRef.meta = () =>
            renderMeta(
              `task (${command.source})`,
              count ? `close in ${count} s...` : null
            );
          if (count > 0) {
            window.setTimeout(minusCount, 1e3);
          }
        };
        window.setTimeout(minusCount, 1e3);
      }
    },
    onAfterLeave: () => {
      if (isInputAcquired) {
        // console.log(
        //   "Sending back options: ",
        //   currentOptions.value,
        //   command.callback
        // );
        if (command.callback == "auto-start-approve") {
          // Send to console main
          ipcRenderer.send(
            command.callback,
            JSON.stringify(currentOptions.value)
          );
        } else {
          // Proxy to main window
          // Send data to main window's event listener
          // console.log("Sending back options: ", currentOptions.value);
          ipcRenderer.send("event-to-main-win", {
            callback: command.callback,
            data: JSON.stringify(currentOptions.value),
          });
        }
      }
    },
  });
  // emits('refreshListeners', {})
};

const renderTextContent = (content) => {
  let contentList = [];
  if (typeof content == "string") {
    contentList = [{ label: content, value: content }];
  } else {
    contentList = content;
  }
  return h(
    NList,
    {
      bordered: false,
      showDivider: true,
      hoverable: true,
      clickable: true,
    },
    {
      default: () =>
        contentList.map((content) =>
          h(
            NListItem,
            {
              onClick: () => {
                navigator.clipboard.writeText(content.value);
              },
              style: {
                "padding-top": "5px",
                "padding-bottom": "5px",
              },
            },
            {
              default: () =>
                h(
                  NText,
                  {
                    style: {
                      "font-size": "14px",
                      "line-height": "0px",
                      "margin-left": "10px",
                      color: "#3a4dbf",
                      "font-family":
                        '"Lucida Console", "Courier New", monospace',
                    },
                  },
                  { default: () => content.label }
                ),
            }
          )
        ),
    }
  );
};

const renderNotificationContent = (content, isPreview) => {
  if (isPreview == true) {
    return renderPreviews(content);
  } else {
    return renderTextContent(content);
  }
};

const createNotification = (command) => {
  let count = command.timeout;

  const nRef = notification.create({
    title: () => renderTitle(command.title, Mail),
    content: () =>
      renderNotificationContent(command.content, command.isPreview),
    duration: count ? count * 1000 : undefined,
    meta: () =>
      renderMeta(
        `task (${command.source})`,
        count ? `close in ${count} s...` : null
      ),
    action: () =>
      h(
        NSpace,
        {
          style: { "margin-top": "5px", "margin-bottom": "2px", size: [0, 0] },
        },
        {
          default: () => [
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
                type: "success",
                onClick: () => {
                  nRef.destroy();
                },
              },
              {
                default: () => "Close",
              }
            ),
          ],
        }
      ),
    onAfterEnter: () => {
      if (count) {
        const minusCount = () => {
          count--;
          nRef.meta = () =>
            renderMeta(
              `task (${command.source})`,
              count ? `cont in ${count} s...` : null
            );
          if (count > 0) {
            window.setTimeout(minusCount, 1e3);
          }
        };
        window.setTimeout(minusCount, 1e3);
      }
    },
  });

  // emits('refreshListeners', {})
  // console.log("Notification created: ", nRef, nRef.$el);
};

// Input-text request
const inputText = ref([]);
const renderInputText = (command) => {
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () =>
        command.options.map((key) =>
          h(
            NSpace,
            { style: {} },
            {
              default: () =>
                h(
                  NInputGroup,
                  { size: "small", style: { width: "280px" } },
                  {
                    default: () => [
                      h(NTag, { type: "info" }, { default: () => key }),
                      h(NInput, {
                        size: "small",
                        placeholder:
                          command.placeholders[command.options.indexOf(key)],
                      }),
                    ],
                  }
                ),
            }
          )
        ),
    }
  );
};

const createTextInput = (command) => {
  let nRef = notification.create({
    title: command.title,
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
    onAfterLeave: () => {},
  });
};

const fileListRef = ref([]);
const renderFileInput = (command) => {
  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        h(
          NSpace,
          { style: { margin: "5px 3px 3px" }, justify: "center" },
          {
            default: () => [
              h("img", {
                draggable: false,
                src: dragDemo,
                style: { width: "180px" },
              }),
            ],
          }
        ),
        h(
          NText,
          {
            style: {
              "font-size": "14px",
              "line-height": "0px",
              "margin-left": "10px",
              color: "#3a4dbf",
              "font-family": '"Lucida Console", "Courier New", monospace',
            },
          },
          { default: () => "Select Drop files to tray icon" }
        ),
        h(
          NUpload,
          {
            abstract: true,
            fileList: fileListRef.value,
            directory: command.allowDir,
            max: command.max,
            onChange: (event) => {
              const { file, fileList } = event;
              fileListRef.value = fileList;
            },
          },
          {
            default: () => h(NUploadFileList, { width: "300px" }, null),
          }
        ),
      ],
    }
  );
};

ipcRenderer.on("drop-files", (event, files) => {
  fileListRef.value = [
    ...files.map((t, index) => {
      return {
        id: String(index),
        name: t,
        status: "finished",
        type: "text/plain",
      };
    }),
    ...fileListRef.value,
  ];
});

const createFileInput = (command) => {
  fileListRef.value = [];
  let nRef = notification.create({
    title: () => renderTitle(command.title, FileImport),
    content: () => renderFileInput(command),
    meta: () => renderMeta(`task (${command.source})`, null),
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
        data: JSON.stringify(fileListRef.value),
      });
    },
  });
};

onMounted(() => {
  setTimeout(() => {
    // createNotification({
    //   title: "AuTool started",
    //   content: ["Aren't you excited?", "Click me to copy text"],
    //   timeout: 60,
    //   source: "console.MsgPanel",
    // });
  }, 1000);
});

const deleteAutoRune = () => {
  if (appConfig.has(`autoRune.${currentChamp.value}`)) {
    appConfig.delete(`autoRune.${currentChamp.value}`);
    isAutoRune.value = 0;
  }
};

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
        placeholders: message.hints,
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
      createFileInput({
        title: message.title,
        source: message.source,
        max: message.max,
        allowDir: message.directory,
        callback: message.callback,
      });
      break;
    default:
      console.log("unknown message type", message);
      break;
  }
});
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

.runImgPrimary {
  width: 50px;
  height: 50px;
}

.runImg {
  width: 30px;
  height: 30px;
}

.runImgseSondary {
  width: 25px;
  height: 25px;
  margin-bottom: -7px;
}

.n-card > .n-card__content > .runeCard {
  padding: 0 !important;
}

.buttonSwitch {
  margin-top: 5px;
  margin-left: -5px;
}

.bottomTip {
  margin-bottom: 0px;
  height: 80px;
  padding-top: 10px;
  padding-left: 1px;
}

.itemImg {
  width: 35px;
  height: 35px;
  border-radius: 4px;
  position: absolute;
}

.skillDiv {
  position: relative;
}

.skillText {
  width: 16px;
  height: 16px;
  position: absolute;
  top: 19px;
  left: 19px;
  background: rgba(32, 45, 55, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  white-space: nowrap;
  color: rgb(0, 215, 176) !important;
  font-size: 11px !important;
}

.itemsTotal {
  float: right;
  position: absolute;
  right: 4px;
  bottom: -2px;
  color: #9aa4af;
}

.slide-in-bottom {
  -webkit-animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes slide-in-bottom {
  0% {
    -webkit-transform: translateY(1000px);
    transform: translateY(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
