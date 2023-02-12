<template>
  <div></div>
</template>

<script setup>
import { ipcRenderer } from "electron";
import {
  NCard,
  NAvatar,
  NSpace,
  NTag,
  NIcon,
  NText,
  NInput,
  NInputGroup,
  NBadge,
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

import { Select, Mail, FileImport } from "@vicons/tabler";
import { h, ref, onMounted } from "vue";
import { appConfig } from "../../../utils/main/config";
import dragDemo from "../../assets/apps/drop-files-demo.gif";

const notification = useNotification();

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

const renderOptions = (optionNames, params) => {
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
              optionNames.map((name) =>
                h(
                  NCheckbox,
                  {
                    value: name,
                    label: name,
                  },
                  {}
                )
              ),
          }
        ),
    }
  );
};

const createSelectOptions = (command) => {
  isInputAcquired = true;
  let count = command.timeout;
  let presetValues = [];
  if (command.preset == true || command.preset == false) {
    presetValues = Array(command.options.length).fill(command.preset);
  } else {
    presetValues = command.preset;
  }

  let preset = command.options.filter((option, index) => {
    if (presetValues[index]) {
      return true;
    }
    return false;
  });
  currentOptions.value = preset;

  let title = command.title ? command.title : "Select options";
  const nRef = notification.create({
    title: () => renderTitle(title, Select),
    content: () =>
      renderOptions(command.options, {
        preset: preset,
        max: command.max,
        min: command.min,
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
          nRef.meta = `task (${command.source})\nexit in ${count} s...`;
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
    contentList = [content];
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
                navigator.clipboard.writeText(content);
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
                  { default: () => content }
                ),
            }
          )
        ),
    }
  );
};

const createNotification = (command) => {
  let count = command.timeout;
  const nRef = notification.create({
    title: () => renderTitle(command.title, Mail),
    content: () => renderTextContent(command.content),
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
const renderFileInput = () => {
  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        h(
          NSpace,
          { style: { margin: "5px 3px 3px" }, justify: "center" },
          {
            default: () =>
              h("img", {
                draggable: false,
                src: dragDemo,
                style: { width: "180px" },
              }),
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
    content: () => renderFileInput(),
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
    onAfterLeave: () => {},
  });
};

onMounted(() => {
  setTimeout(() => {
    createNotification({
      title: "AuTool started",
      content: ["Aren't you excited?", "Click me to copy text"],
      timeout: 60,
      source: "console.MsgPanel",
    });
    createFileInput({
      title: "File Input",
      source: "console",
    });
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
        callback: message.callback,
      });
      break;

    case "input":
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
      });
      break;

    case "input-files":
      createFileInput({
        title: message.title,
        source: message.source,
        options: message.options,
        placeholders: message.hints,
        callback: message.callback,
      });
      break;
    default:
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
