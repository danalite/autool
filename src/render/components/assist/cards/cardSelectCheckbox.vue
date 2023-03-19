<template>
  <div></div>
</template>

<script setup>
import {
  NCheckboxGroup,
  NCheckbox,
  NSpace,
  NButton,
  NAvatar,
  NText,
  useNotification,
} from "naive-ui";
import { h, ref } from "vue";
import { ipcRenderer } from "electron";

const notification = useNotification();
let isInputAcquired = true;
const currentOptions = ref([]);

const renderChecklists = (options, params) => {
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
};

const enqueue = (command) => {
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
    title: () => title,
    description: () => "task: " + command.source,
    content: () =>
      renderChecklists(options, {
        max: command.max,
        min: command.min,
        isPreview: command.isPreview == undefined ? false : command.isPreview,
      }),
    duration: count ? count * 1000 : undefined,
    meta: () =>
      h(
        NText,
        { depth: 3, tag: "div" },
        {
          default: () => (count ? `close in ${count} s...` : new Date().toLocaleString()),
        }
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
            h(
              NText,
              { depth: 3, tag: "div" },
              {
                default: () => (count ? `close in ${count} s...` : null),
              }
            );
          if (count > 0) {
            window.setTimeout(minusCount, 1e3);
          }
        };
        window.setTimeout(minusCount, 1e3);
      }
    },
    avatar: () =>
      h(NAvatar, {
        size: "small",
        src: "https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg",
      }),
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

defineExpose({
  enqueue,
});
</script>