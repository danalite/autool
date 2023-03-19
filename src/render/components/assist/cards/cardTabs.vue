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
  NTabPane,
  useNotification,
} from "naive-ui";
import { h, ref } from "vue";
import { ipcRenderer } from "electron";

const notification = useNotification();

const renderTabs = (command) => {
    return h(NTabs, { type: "card" }, {
        default: () => [
            h(NTabPane, { name: "Upload", tab: "Upload" }, {
                default: () => h("div", "Upload")
            }),
            h(NTabPane, { name: "XX", tab: "XX" }, {
                default: () => h("div", "Paste")
            })
        ]
    })

}

const enqueue = (command) => {
  let nRef = notification.create({
    title: () => h("span", command.title),
    description: () => "task: " + command.source,

    content: () => renderTabs(command),
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