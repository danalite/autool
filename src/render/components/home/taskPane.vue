<template>
  <n-list hoverable>
    <n-scrollbar style="max-height: 430px">
      <n-list-item v-for="(app, index) in apps" @click="showAppTaskList(index)">
        <n-space justify="space-between">
          <n-space>
            <n-avatar
              style="
                margin-right: 0px;
                border-radius: 2px;
                background-color: #ffffff;
              "
              :bordered="false"
              :size="35"
              :src="app.icon"
            />
            <n-button
              secondary
              size="medium"
              type="success"
              round
              :bordered="false"
              @click="openEditor('app', app)"
            >
              {{ app.author }}/{{ app.app }}
            </n-button>
          </n-space>

          <!-- action buttons: enqueue, run, delete, import -->
          <n-space class="rightCorner" v-if="activeAppIndex === index">
            <n-dropdown
              :options="selectOptions"
              @select="handleSelectAction($event, app)"
            >
              <n-icon size="22">
                <PlaylistAdd />
              </n-icon>
            </n-dropdown>
          </n-space>
        </n-space>

        <transition name="fade">
          <div v-show="activeAppIndex === index" style="padding-top: 8px">
            <n-data-table
              v-model:checked-row-keys="checkedTaskKeys"
              :columns="columns"
              :data="app.tasks"
              :pagination="{ pageSize: 3 }"
            />
          </div>
        </transition>
      </n-list-item>
    </n-scrollbar>
  </n-list>

</template>

<script>
import { h, ref } from "vue";
import {
  NCard,
  NAvatar,
  NProgress,
  NSpace,
  NTag,
  NGrid,
  NDrawer,
  NCheckbox,
  NCheckboxGroup,
  NDropdown,
  NDrawerContent,
  NList,
  NListItem,
  NText,
  NScrollbar,
  NDataTable,
  NDatePicker,
  NButton,
  useMessage,
  NTabs,
  NTabPane,
  NRate,
  NIcon,
  NForm,
  NFormItem,
  NFormItemGi,
  NInput,
  NInputGroup,
  NEllipsis,
  NCollapse,
  NCollapseItem,
} from "naive-ui";

import {
  PlayerPlay,
  Trash,
  Pencil,
  FileSearch,
  Star,
  PlaylistAdd,
  Copy,
  CloudUpload,
  WorldDownload,
} from "@vicons/tabler";

import { ipcRenderer, shell } from "electron";

export default {
  name: "taskPane",
  components: {
    NCard,
    NAvatar,
    NProgress,
    NSpace,
    NTag,
    NGrid,
    NDrawer,
    NDropdown,
    NDatePicker,
    NDrawerContent,
    NList,
    NListItem,
    NScrollbar,
    NText,
    NDataTable,
    NButton,
    useMessage,
    NCheckbox,
    NCheckboxGroup,
    NTabs,
    NTabPane,
    NRate,
    NIcon,
    NForm,
    NFormItem,
    NFormItemGi,
    NInput,
    NInputGroup,
    NEllipsis,
    PlayerPlay,
    Trash,
    Pencil,
    Star,
    PlaylistAdd,
    FileSearch,
    Copy,
    CloudUpload,
    NCollapse,
    NCollapseItem,
    WorldDownload,
  },
  props: {
    apps: {
      type: Array,
    },
  },
  emits: ["runTask"],
  setup(props, { emit }) {
    const message = useMessage();

    const taskOpened = ref({
      task: {
        name: "",
        path: "",
        inputs: [],
        demo: "",
        desc: [],
        options: [],
      },
    });

    const runTask = (task) => {
      // TODO: update tasks in appMain
      message.success(`Task "${task.relTaskPath}" started`);
      emit("runTask", task);
    };

    const saveTask = () => {
      ipcRenderer.send("save-task", JSON.stringify(taskOpened.value.task));
      message.success("Task Saved");
    };

    const openEditor = (target, row) => {
      const appOrTask = { type: target, ...row };
      ipcRenderer.send("show-editor-window", JSON.stringify(appOrTask));
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      message.success(`Copied ${text} to clipboard`);
    };

    // Columns for each task in the app drop list
    const columns = [
      { type: "selection" },
      {
        title: "Task",
        key: "relTaskPath",
        // sorter: "default",
        width: 210,
        render(row) {
          return h(
            NButton,
            {
              text: true,
              onClick: () => openEditor("task", row),
              style: "width: 120px",
            },
            { default: () => row.relTaskPath }
          );
        },
      },
      {
        title: "",
        key: "config",
        render(row) {
          return [
            h(
              NIcon,
              {
                size: 20,
                style: { "padding-right": "3px" },
                onClick: () => {}
              },
              {
                default: () =>
                  h(Star, {
                    style: {
                      "margin-bottom": "-4px",
                      color: "#FAD02C",
                    },
                  }),
              }
            ),
            h(
              NIcon,
              {
                size: 20,
                onClick: () => runTask(row),
              },
              {
                default: () =>
                  h(PlayerPlay, {
                    style: {
                      "margin-bottom": "-4px",
                      color: "green",
                    },
                  }),
              }
            ),
          ];
        },
      },
    ];

    const activeAppIndex = ref(0);
    const checkedTaskKeys = ref([]);

    const showAppTaskList = (index) => {
      // Clear selected tasks when switching to another active app
      if (activeAppIndex.value != index) {
        checkedTaskKeys.value = [];
      }
      activeAppIndex.value = index;
    };

    const enqueueTasks = async (app) => {
      if (checkedTaskKeys.value.length === 0) {
        message.warning("Please select tasks from task list");
      } else {
        for (let i = 0; i < checkedTaskKeys.value.length; i++) {
          let task = app.tasks[i];
          runTask(task);
          message.info("Enqueue tasks: " + app.tasks[0].name);
        }
      }
    };

    const renderIcon = (icon, attrs) => {
      return () => {
        return h(NIcon, attrs, {
          default: () => h(icon),
        });
      };
    };

    const selectOptions = [
      {
        label: "Sync",
        key: "sync",
        icon: renderIcon(WorldDownload, { color: "#32cd32" }),
      },
      {
        label: "New Task",
        key: "new",
        icon: renderIcon(Pencil, { color: "#2685c2" }),
      },
      {
        label: "Del Task",
        key: "delete",
        icon: renderIcon(Trash, { color: "#db2544" }),
      },
      {
        label: "Batch Run",
        key: "batch",
        icon: renderIcon(PlayerPlay, { color: "green" }),
      },
      {
        label: "Cloud Run",
        key: "remote",
        icon: renderIcon(CloudUpload, { color: "green" }),
      },
    ];

    const handleSelectAction = (key, app) => {
      if (key === "new") {
        let appInfo = {
          name: app.name,
          author: app.author,
          path: app.path,
          task: "example-new-task.yaml",
        };
        ipcRenderer.send("show-editor-window", appInfo);
      } else if (key === "delete") {
        message.info("Delete task");
      } else if (key === "batch") {
        enqueueTasks(app);
      } else if (key === "sync") {
        message.info("Sync tasks");
      }
    };

    return {
      columns,
      activeAppIndex,
      checkedTaskKeys,
      showAppTaskList,
      enqueueTasks,
      selectOptions,
      handleSelectAction,
      openEditor,
      copyToClipboard,
      taskOpened,
      runTask,
      saveTask,
    };
  },
};
</script>


<style scoped>
@import url(../../assets/css/animationCommon.css);

.n-card {
  border-radius: 5px;
  padding: 0px;
}

.n-avatar {
  float: left;
  margin-right: 15px;
  margin-top: 1px;
}

.cm-content {
  margin-top: 10px;
  margin-bottom: 10px;
  white-space: pre-wrap;
}

.pointCard {
  margin-top: 15px;
  height: 440px;
}

.alignCenter {
  align-items: center;
}

.tagWidth {
  width: 85px;
  justify-content: center;
}

/* .fade-leave-active */
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.rightCorner {
  padding-top: 8px;
  margin-right: 3px;
}
</style>
    