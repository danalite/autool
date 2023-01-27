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
  NInput,
  NInputGroup,
  NBadge,
  NButton,
  NList,
  NListItem,
  NPopconfirm,
  useNotification,
} from "naive-ui";

import { Select } from "@vicons/tabler";
import { h, ref, onMounted } from "vue";
import { appConfig } from "../../../utils/main/config";

const notification = useNotification();

// Closable options selection
let isInputAcquired = true;
const currentOptions = ref([]);
const renderOptions = (optionNames) => {
  currentOptions.value = optionNames;
  return h(
    NSpace,
    { style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () =>
        currentOptions.value.map((name) =>
          h(
            NTag,
            {
              closable: true,
              style: {},
              type: "info",
              onClose: () => {
                currentOptions.value.splice(optionNames.indexOf(name), 1);
              },
            },
            { default: () => name }
          )
        ),
    }
  );
};

const createSelectOptions = (command) => {
  let count = command.count;
  const nRef = notification.create({
    title: command.title,
    content: () => renderOptions(command.options),
    duration: count * 1000,
    meta: `task (${command.source}): start in ${count} seconds...`,
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
          type: "error",
          onClick: () => {
            isInputAcquired = false;
            nRef.destroy();
            // TODO: Send back abort ACK
          },
        },
        {
          default: () => h("span", { style: {} }, "Stop"),
        }
      ),
    onAfterEnter: () => {
      const minusCount = () => {
        count--;
        nRef.meta = `task (${command.source}): start in ${count} seconds...`;
        if (count > 0) {
          window.setTimeout(minusCount, 1e3);
        }
      };
      window.setTimeout(minusCount, 1e3);
    },
    onAfterLeave: () => {
      if (isInputAcquired) {
        // TDOD: Send back selection result
      }
    },
  });
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
                  { size: "small" },
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
    createSelectOptions({
      title: "Auto run tasks?",
      source: "task-manager",
      count: 32,
      options: ["task1-few", "task2-dewfeew", "task3-fwfwdwedew"],
    });

    createTextInput({
      title: "Input text",
      source: "another-task-manager",
      options: ["yourName", "postalCode"],
      placeholders: ["Mike Hu", "11234"],
    });
  }, 1000);
});

const getImaUrl = (imgId) => {
  return require(`../../assets/runes/${imgId}.png`);
};

const deleteAutoRune = () => {
  if (appConfig.has(`autoRune.${currentChamp.value}`)) {
    appConfig.delete(`autoRune.${currentChamp.value}`);
    isAutoRune.value = 0;
  }
};
</script>

<style scoped>
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
