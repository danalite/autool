<template>
  <div></div>
</template>

<script setup>
import {
  NSpace,
  NButton,
  NAvatar,
  NText,
  NUpload,
  NUploadFileList,
  useNotification,
} from "naive-ui";
import { h, ref } from "vue";
import { ipcRenderer } from "electron";
import dragDemo from "@/render/assets/apps/drop-files-demo.gif";

const notification = useNotification();

const fileListRef = ref([]);
const renderFileInput = (command) => {
  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
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
          { default: () => "Select & drop files to tray icon" }
        ),
        h(
          NSpace,
          { style: { margin: "5px 3px 3px" }, justify: "center" },
          {
            default: () => [
              h("img", {
                draggable: false,
                src: dragDemo,
                style: { height: "80px" },
              }),
            ],
          }
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
            default: () => h(NUploadFileList, { width: "100%" }, null),
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

const enqueue = (command) => {
  let nRef = notification.create({
    title: () => h("span", command.title),
    description: () => "task: " + command.source,

    content: () => renderFileInput(command),
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
      ipcRenderer.send("event-to-main-win", {
        callback: command.callback,
        data: { a: 1, b: 2 },
      });
    },
  });
};

defineExpose({
  enqueue,
});
</script>
