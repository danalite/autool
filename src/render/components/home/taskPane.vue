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
                <n-badge value="new" v-if="index == 1">
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
                <n-avatar
                  style="
                    margin-right: 0px;
                    border-radius: 2px;
                    background-color: #ffffff;
                  "
                  :bordered="false"
                  :size="25"
                  :src="app.icon"
                  v-else
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
                  trigger="click"
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
                  @mouseover="handleMouseOver(index, taskIndex)"
                  @mouseleave="handleMouseLeave(index, taskIndex)"
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
                        <n-ellipsis style="width: 170px; max-width: 170px">
                          {{
                            task.relTaskPath.includes("/")
                              ? task.relTaskPath.split("/")[1]
                              : task.relTaskPath
                          }}
                        </n-ellipsis>
                      </n-button>

                      <n-input-group style="padding-top: 1px; max-width: 40px">
                        <n-icon
                          :class="{
                            invisible: !(
                              task.options?.includes('autostart') ||
                              (hoverAppIndex == index &&
                                hoverTaskIndex == taskIndex)
                            ),
                          }"
                          size="18"
                          :color="
                            task.options?.includes('autostart')
                              ? '#0e7a0d'
                              : 'grey'
                          "
                          depth="2"
                          style="padding-left: 0px"
                          @click="handleToggleProperty(task, 'autostart')"
                        >
                          <BrandAndroid />
                        </n-icon>

                        <n-icon
                          size="18"
                          :color="task.startTime ? '#0e7a0d' : 'grey'"
                          depth="2"
                          style="padding-left: 1px"
                          :class="{
                            invisible: !(
                              task.startTime ||
                              (hoverAppIndex == index &&
                                hoverTaskIndex == taskIndex)
                            ),
                          }"
                          @click="handleToggleProperty(task, 'startTime')"
                        >
                          <Clock />
                        </n-icon>

                        <n-icon
                          :class="{
                            invisible: !(
                              task.hotkey ||
                              (hoverAppIndex == index &&
                                hoverTaskIndex == taskIndex)
                            ),
                          }"
                          size="18"
                          style="padding-left: 1px"
                          :color="task.hotkey ? 'green' : 'grey'"
                          @click="handleToggleProperty(task, 'hotkey')"
                          depth="2"
                        >
                          <Keyboard />
                        </n-icon>
                        <n-icon
                          size="18"
                          :color="
                            task.options?.includes('remote')
                              ? '#0e7a0d'
                              : 'grey'
                          "
                          depth="2"
                          style="padding-left: 1px"
                          :class="{
                            invisible: !(
                              task.options?.includes('remote') ||
                              (hoverAppIndex == index &&
                                hoverTaskIndex == taskIndex)
                            ),
                          }"
                          @click="handleToggleProperty(task, 'remote')"
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

  <!-- Model to do quick config on startTime and Hotkey -->
  <n-modal v-model:show="showModalRef" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">Setup {{ quickConfigTarget }}</div>
    </template>
    <div>
      <n-space vertical style="padding-top: 10px">
        <n-space>
          <n-button style="width: 50px" size="small">App </n-button>
          <n-ellipsis
            style="width: 220px; max-width: 220px; padding-top: 2px"
            :tooltip="false"
          >
            {{ activeSelectedTask.app }}
          </n-ellipsis>
        </n-space>
        <n-space>
          <n-button style="width: 50px" size="small">Task</n-button>
          <n-ellipsis
            style="width: 220px; max-width: 220px; padding-top: 2px"
            :tooltip="false"
          >
            {{ activeSelectedTask.relTaskPath }}
          </n-ellipsis>
        </n-space>

        <n-divider>
          {{ quickConfigTarget == "hotkey" ? "Hotkey" : "Start Time" }}
        </n-divider>

        <n-space v-if="quickConfigTarget == 'startTime'">
          <n-button size="small" @click="updateConfigValue = '15 9 * * mon'"
            >9:15am on Monday weekly</n-button
          >
          <n-button size="small" @click="updateConfigValue = '0 */6 * * *'">
            Every 6 hours
          </n-button>
          <n-button size="small" @click="updateConfigValue = '0 7,17 * * *'">
            7am, 5pm daily
          </n-button>
          <n-button size="small" @click="updateConfigValue = '0 8 1-28 feb *'">
            8am daily from Feb 1st to 28th
          </n-button>
        </n-space>

        <n-input-group style="margin-top: 10px">
          <n-input
            size="small"
            v-model:value="updateConfigValue"
            :placeholder="
              quickConfigTarget == 'hotkey'
                ? 'Specify task hotkey'
                : 'E.g., 15 09 * * 3'
            "
            style="width: 100%"
          />
          <n-button
            v-if="activeSelectedTask[quickConfigTarget]"
            type="warning"
            size="small"
            @click="updateConfigValue = ''"
            >Clear</n-button
          >
        </n-input-group>

        <n-space justify="center" v-if="quickConfigTarget == 'startTime'">
          <n-button text type="info" size="tiny" @click="openCron">
            <template #icon>
              <n-icon>
                <Clock />
              </n-icon>
            </template>
            More examples of cron syntax
          </n-button>
        </n-space>
      </n-space>
    </div>
    <template #action>
      <n-space>
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
  NDivider,
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
    NDivider,
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
      // {
      //   label: "Run",
      //   key: "run",
      //   icon: renderIcon(PlayerPlay, { color: "green" }),
      // },
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

    // show property icons for task hovered
    const hoverAppIndex = ref(-1);
    const hoverTaskIndex = ref(-1);
    const handleMouseOver = (appIndex, taskIndex) => {
      hoverAppIndex.value = appIndex;
      hoverTaskIndex.value = taskIndex;
    };

    const handleMouseLeave = (appIndex, taskIndex) => {
      hoverAppIndex.value = -1;
      hoverTaskIndex.value = -1;
    };

    const showModalRef = ref(false);
    const quickConfigTarget = ref("");

    const onPositiveClick = async () => {
      showModalRef.value = false;
      console.log("update", updateConfigValue.value, quickConfigTarget.value, activeSelectedTask.value.absTaskPath);
      await ipcRenderer.invoke("to-console", {
        action: "task-configs-update",
        taskPath: activeSelectedTask.value.absTaskPath,
        key: quickConfigTarget.value,
        update: updateConfigValue.value,
      });
      emit("refreshApps", {});
    };

    const updateConfigValue = ref("");
    const handleToggleProperty = async (task, property) => {
      if (property === "autostart" || property === "remote") {
        await ipcRenderer.invoke("to-console", {
          action: "task-configs-update",
          taskPath: task.absTaskPath,
          key: property,
          update: !task.options?.includes(property),
        });
      } else {
        showModalRef.value = true;
        activeSelectedTask.value = task;
        updateConfigValue.value = task[property];
        quickConfigTarget.value = property;
      }
      emit("refreshApps", {});
    };

    return {
      activeAppIndex,
      showAppTaskList,

      bulkTaskOptions,
      handleAppAction,
      handleTaskChecked,

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

      hoverAppIndex,
      hoverTaskIndex,
      handleMouseOver,
      handleMouseLeave,
      handleToggleProperty,

      quickConfigTarget,
      showModalRef,
      onPositiveClick,
      activeSelectedTask,
      updateConfigValue,

      openCron() {
        shell.openExternal("https://crontab.guru/");
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

.invisible {
  visibility: hidden;
}
</style>
    