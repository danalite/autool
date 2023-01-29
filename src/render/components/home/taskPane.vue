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
                <n-badge value="new">
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
                </n-badge>

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
                      style="padding-left: 6px"
                      @click.stop
                      v-model:checked="task.shortcut"
                      @update:checked="
                        handleTaskChecked($event, app.tasks[taskIndex])
                      "
                    />

                    <n-space style="gap: 8px 2px">
                      <n-button
                        :text="true"
                        size="small"
                        @click="runTask(task)"
                        style="text-align: left"
                      >
                        <n-ellipsis style="width: 180px; max-width: 180px">
                          {{
                            task.relTaskPath.includes("/")
                              ? task.relTaskPath.split("/")[1]
                              : task.relTaskPath
                          }}
                        </n-ellipsis>
                      </n-button>

                      <n-input-group style="padding-top: 3px; max-width: 40px">
                        <n-icon
                          v-show="task.hotkey"
                          size="18"
                          color="grey"
                          depth="2"
                        >
                          <Keyboard />
                        </n-icon>

                        <n-icon
                          v-show="task.options.includes('autostart')"
                          size="18"
                          color="#0e7a0d"
                          depth="2"
                          style="padding-left: 1px"
                        >
                          <BrandAndroid />
                        </n-icon>

                        <n-icon
                          size="18"
                          color="#0e7a0d"
                          depth="2"
                          style="padding-left: 1px"
                          v-show="task.startTime"
                        >
                          <Clock />
                        </n-icon>

                        <n-icon
                          size="18"
                          color="#0e7a0d"
                          depth="2"
                          style="padding-left: 1px"
                          v-show="task.options.includes('remote')"
                        >
                          <Cloud />
                        </n-icon>
                      </n-input-group>
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

  <n-modal v-model:show="showTaskConfigModalRef" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">Quick config task</div>
    </template>
    <div>
      <n-space vertical style="padding-top: 10px">
        <n-checkbox value="autostart" label="autostart" />
        <n-checkbox value="remote" label="remote  (run on cloud)" />

        <n-text>start time </n-text>
        <n-input-group>
          <n-input size="small"> </n-input>
          <n-button secondary size="small" type="primary">check</n-button>
        </n-input-group>

        <n-text>hotkey </n-text>
        <n-input-group>
          <n-input size="small"> </n-input>
          <n-button secondary size="small" type="primary">check</n-button>
        </n-input-group>
      </n-space>
    </div>
    <template #action>
      <n-space>
        <n-button @click="onNegativeClick">Cancel</n-button>
        <n-button type="primary" @click="onPositiveClick"> Save </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script>
import { h, ref, nextTick } from "vue";
import {
  NCard,
  NAvatar,
  NBadge,
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
  NModal,
  NInput,
  NSwitch,
  NCollapseTransition,
  NTooltip,
  NInputGroup,
  NEllipsis,
} from "naive-ui";

import {
  PlayerPlay,
  BrandAndroid,
  Trash,
  ToggleLeft,
  Pencil,
  FileSearch,
  Box,
  Star,
  PlaylistAdd,
  Copy,
  Cloud,
  CloudDownload,
  Clock,
  FileReport,
  WorldDownload,
  Keyboard,
} from "@vicons/tabler";

import { ipcRenderer, shell } from "electron";

export default {
  name: "taskPane",
  components: {
    NCard,
    NAvatar,
    NBadge,
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
    NModal,
    NInput,
    NInputGroup,
    NEllipsis,
    PlayerPlay,
    BrandAndroid,
    Trash,
    ToggleLeft,
    Pencil,
    Star,
    PlaylistAdd,
    FileSearch,
    Box,
    Copy,
    Cloud,
    CloudDownload,
    Clock,
    FileReport,
    WorldDownload,
    Keyboard,
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
        label: "Update",
        key: "update",
        icon: renderIcon(CloudDownload, { color: "green" }),
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
        label: "Run",
        key: "run",
        icon: renderIcon(PlayerPlay, { color: "green" }),
      },
      {
        label: () => h("span", {}, "Quick config"),
        key: "config",
        icon: renderIcon(ToggleLeft, { color: "green" }),
      },
      {
        type: "divider",
        key: "d1",
      },
      {
        label: "Edit",
        key: "edit",
        icon: renderIcon(Pencil, { color: "#2685c2" }),
      },
      {
        label: () => h("span", {}, "Debug"),
        key: "showLog",
        icon: renderIcon(FileReport, { color: "#FAD02C" }),
      },
      {
        label: () => h("span", { style: { color: "#db2544" } }, "Delete"),
        key: "delete",
        icon: renderIcon(Trash, { color: "#db2544" }),
      },
    ];

    // Quick task config
    const showTaskConfigModalRef = ref(false);
    const onNegativeClick = () => {
      showTaskConfigModalRef.value = false;
    };

    const onPositiveClick = async () => {
      showTaskConfigModalRef.value = false;
      // await ipcRenderer.invoke("to-console", {
      //   action: "task-configs-update",
      //   taskPath: activeSelectedTask.value.absTaskPath,
      //   key: "shortcut",
      //   update: true,
      // });
    };

    return {
      activeAppIndex,
      showAppTaskList,
      showTaskConfigModalRef,

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
        } else if (key === "config") {
          showTaskConfigModalRef.value = true;
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

      onPositiveClick,
      onNegativeClick,
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
    