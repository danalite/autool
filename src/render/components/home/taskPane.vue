<template>
  <n-list :show-divider="false">
    <n-scrollbar style="max-height: 430px">
      <n-list-item
        v-for="(app, index) in apps"
        style="padding-top: 8px; padding-bottom: 1px"
        :key="index"
      >
        <n-card :bordered="true" hoverable size="small">
          <n-space vertical style="gap: 0px 0px">
            <n-space justify="space-between">
              <n-space>
                <n-avatar
                  style="
                    margin-right: 0px;
                    border-radius: 2px;
                    background-color: #ffffff;
                  "
                  :bordered="false"
                  :size="25"
                  :src="app.icon"
                />
                <n-button
                  ghost
                  size="small"
                  type="primary"
                  @click="showAppTaskList(index)"
                  :bordered="false"
                >
                  <n-text :size="22" :underline="true">
                    {{ app.author }}/{{ app.app }}
                  </n-text>
                </n-button>
              </n-space>

              <n-space v-if="activeAppIndex === index">
                <n-dropdown
                  :options="bulkTaskOptions"
                  @select="handleAppAction($event, app)"
                >
                  <n-icon size="25">
                    <PlaylistAdd />
                  </n-icon>
                </n-dropdown>
              </n-space>
            </n-space>

            <n-collapse-transition :show="activeAppIndex === index">
              <n-list style="padding-top: 2px; padding-bottom: 0px">
                <n-list-item
                  v-for="(task, taskIndex) in app.tasks"
                  style="padding-top: 6px; padding-bottom: 6px"
                  @contextmenu="handleContextMenu($event, task)"
                  :key="taskIndex"
                >
                  <n-space>
                    <n-checkbox
                      style="padding-left: 8px"
                      @click.stop
                      v-model:checked="task.shortcut"
                      @update:checked="handleTaskChecked($event, app.tasks[taskIndex])"
                    />

                    <n-space>
                      <n-button :text="true" size="small" @click="">
                        <n-ellipsis style="max-width: 180px">
                          {{
                            task.relTaskPath.includes("/")
                              ? task.relTaskPath.split("/")[1]
                              : task.relTaskPath
                          }}
                        </n-ellipsis>
                      </n-button>

                      <n-space style="padding-top: 3px">
                        <n-icon
                          v-show="task.options.includes('autostart')"
                          size="18"
                          color="#0e7a0d"
                          depth="2"
                        >
                          <BrandAndroid />
                        </n-icon>

                        <n-icon size="18" color="#0e7a0d" depth="2">
                          <BrandAndroid />
                        </n-icon>
                      </n-space>
                    </n-space>
                  </n-space>
                </n-list-item>
              </n-list>
              <n-dropdown
                placement="bottom-start"
                trigger="manual"
                :x="x"
                :y="y"
                :options="taskItemOptions"
                :show="showDropdown"
                :on-clickoutside="onClickOutside"
                @select="handleTaskAction"
              />
            </n-collapse-transition>
          </n-space>
        </n-card>
      </n-list-item>
    </n-scrollbar>
  </n-list>
</template>

<script>
import { h, ref, nextTick } from "vue";
import {
  NCard,
  NAvatar,
  NProgress,
  NSpace,
  NTag,
  NGrid,
  NCheckbox,
  NCheckboxGroup,
  NDropdown,
  NList,
  NListItem,
  NText,
  NScrollbar,
  NButton,
  useMessage,
  NTabs,
  NTabPane,
  NIcon,
  NForm,
  NFormItem,
  NFormItemGi,
  NInput,
  NSwitch,
  NCollapseTransition,
  NTooltip,
  NInputGroup,
  NEllipsis,
  NCollapse,
  NCollapseItem,
} from "naive-ui";

import {
  PlayerPlay,
  BrandAndroid,
  Trash,
  Pencil,
  FileSearch,
  Box,
  Star,
  PlaylistAdd,
  Copy,
  CloudUpload,
  FileReport,
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
    NSwitch,
    NCollapseTransition,
    NDropdown,
    NList,
    NListItem,
    NScrollbar,
    NText,
    NButton,
    useMessage,
    NCheckbox,
    NCheckboxGroup,
    NTabs,
    NTabPane,
    NTooltip,
    NIcon,
    NForm,
    NFormItem,
    NFormItemGi,
    NInput,
    NInputGroup,
    NEllipsis,
    PlayerPlay,
    BrandAndroid,
    Trash,
    Pencil,
    Star,
    PlaylistAdd,
    FileSearch,
    Box,
    Copy,
    CloudUpload,
    FileReport,
    NCollapse,
    NCollapseItem,
    WorldDownload,
  },
  props: {
    apps: {
      type: Array,
    },
  },
  emits: ["runTask", "refreshApps"],
  setup(props, { emit }) {
    const message = useMessage();

    const runTask = (task) => {
      message.success(`Task "${task.relTaskPath}" started`);
      emit("runTask", task);
    };

    const handleTaskChecked = async (isChecked, task) => {
      // Update local task config
      await ipcRenderer.invoke("to-console", {
        action: "task-configs-update",
        taskPath: task.absTaskPath,
        key: "shortcut",
        update: isChecked,
      });
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      message.success(`Copied ${text} to clipboard`);
    };

    const activeSelectedTask = ref(null);
    const activeAppIndex = ref(0);

    const showAppTaskList = (index) => {
      if (activeAppIndex.value != index) {
        activeAppIndex.value = index;
      } else {
        activeAppIndex.value = -1;
      }
    };

    const renderIcon = (icon, attrs) => {
      return () => {
        return h(NIcon, attrs, {
          default: () => h(icon),
        });
      };
    };

    const bulkTaskOptions = [
      {
        label: "Edit",
        key: "edit",
        icon: renderIcon(Pencil, { color: "#2685c2" }),
      },
      {
        label: "Delete",
        key: "delete",
        icon: renderIcon(Trash, { color: "#db2544" }),
      },
      {
        type: "divider",
        key: "d1",
      },
      {
        label: "Run",
        key: "run",
        icon: renderIcon(PlayerPlay, { color: "green" }),
      },
    ];

    const handleAppAction = async (key, app) => {
      if (key === "delete") {
        await ipcRenderer.invoke("to-console", {
          action: "app-delete",
          appPath: app.path,
        });
        emit("refreshApps", {});
        message.warning(`deleted app ${app.author}/${app.app}`);

      } else if (key === "edit") {
        shell.openExternal(`vscode://file/${app.path}`);
      }
    };

    // Task item dropdown (context menu)
    const showDropdownRef = ref(false);
    const xRef = ref(0);
    const yRef = ref(0);
    const taskItemOptions = [
      {
        label: "run",
        key: "run",
        icon: renderIcon(PlayerPlay, { color: "green" }),
      },
      {
        type: "divider",
        key: "d1",
      },
      {
        label: "edit",
        key: "edit",
        icon: renderIcon(Pencil, { color: "#2685c2" }),
      },
      {
        label: () => h("span", {}, "debug"),
        key: "showLog",
        icon: renderIcon(FileReport, { color: "#FAD02C" }),
      },
      {
        label: () => h("span", { style: { color: "#db2544" } }, "delete"),
        key: "delete",
        icon: renderIcon(Trash, { color: "#db2544" }),
      },
    ];

    return {
      activeAppIndex,
      showAppTaskList,

      bulkTaskOptions,
      handleAppAction,
      handleTaskChecked,
      copyToClipboard,
      runTask,
      taskItemOptions,
      showDropdown: showDropdownRef,
      x: xRef,
      y: yRef,
      handleTaskAction: async (key) => {
        showDropdownRef.value = false;
        if (key === "run") {
          runTask(activeSelectedTask.value);
        } else if (key === "edit") {
          shell.openExternal(
            `vscode://file/${activeSelectedTask.value.absTaskPath}`
          );
        } else if (key === "delete") {
          await ipcRenderer.invoke("to-console", {
            action: "task-delete",
            taskPath: activeSelectedTask.value.absTaskPath,
            appPath: activeSelectedTask.value.appPath,
            taskName: activeSelectedTask.value.relTaskPath,
          });

          emit("refreshApps", {});
          message.info(`delete task ${activeSelectedTask.value.relTaskPath}`);
        } else if (key === "showLog") {
          message.info("Show log");
        }
      },
      handleContextMenu(e, task) {
        activeSelectedTask.value = task;
        e.preventDefault();
        showDropdownRef.value = false;
        nextTick().then(() => {
          showDropdownRef.value = true;
          xRef.value = e.clientX;
          yRef.value = e.clientY;
        });
      },
      onClickOutside() {
        showDropdownRef.value = false;
      },
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
    