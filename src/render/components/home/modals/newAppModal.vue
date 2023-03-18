<template>
  <n-modal v-model:show="showAddAppModal" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">{{ $t("apps.newApp.title") }}</div>
    </template>
    <div>
      <n-tabs type="segment">
        <n-tab-pane name="download" :tab="$t('apps.newApp.download')">
          <n-space vertical>
            <n-input-group>
              <n-input-group-label size="small">
                {{ $t("apps.newApp.appLink") }}
              </n-input-group-label>

              <n-input
                style="width: 80%"
                size="small"
                v-model:value="githubFolderLink"
                placeholder="https://github.com/danalites/apps/tree/master/macos"
              />
            </n-input-group>

            <n-space>
              <n-button
                quaternary
                size="small"
                type="primary"
                @click="openExternal"
              >
                <template #icon>
                  <n-icon>
                    <Apps />
                  </n-icon>
                </template>
                {{ $t("apps.newApp.appExamples") }}
              </n-button>
            </n-space>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="blank" :tab="$t('apps.newApp.blank')">
          <n-space>
            <n-input-group>
              <n-button size="small" secondary style="padding: 10px 5px 10px">
                {{ $t("apps.newApp.appName") }}
              </n-button>
              <n-input
                v-model:value="newAppAuthor"
                style="width: 90px"
                size="small"
                placeholder="author"
              />
              <n-input
                v-model:value="newAppName"
                size="small"
                style="width: 200px"
                placeholder="new-app-name"
              />
            </n-input-group>
            <n-input-group>
              <n-button size="small" secondary style="padding: 10px 5px 10px">
                {{ $t("apps.newApp.appIcon") }}
              </n-button>
              <n-input
                v-model:value="newAppIcon"
                size="small"
                style="width: 260px"
                placeholder="URL to image icon"
              />
            </n-input-group>
            <n-space>
              <n-avatar
                :bordered="false"
                :size="28"
                :src="newAppIcon"
                fallback-src="https://pngimg.com/d/apple_logo_PNG19689.png"
                style="display: block; background-color: #ffffff"
              />
            </n-space>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </div>
    <template #action>
      <n-space justify="space-between">
        <n-space style="margin: 0px">
          <n-button size="small" @click="showAddAppModal = false">
            {{ $t("apps.common.cancel") }}
          </n-button>
          <n-button size="small" type="primary" @click="addNewApp">
            {{ $t("apps.common.ok") }}
          </n-button>
        </n-space>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import {
  NCard,
  NInputGroup,
  NInputGroupLabel,
  NSelect,
  NTabs,
  NTabPane,
  NLayout,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NDropdown,
  NCheckbox,
  NEllipsis,
  NSpace,
  NIcon,
  NInput,
  NButton,
  NMenu,
  NTag,
  NBadge,
  NAvatar,
  NText,
  NList,
  NListItem,
  NTooltip,
  NCheckboxGroup,
  useMessage,
  NModal,
  NRadio,
  NImage,
} from "naive-ui";

import { ipcRenderer, shell } from "electron";
import { ref, h } from "vue";
import { Apps } from "@vicons/tabler";

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const message = useMessage();

const showAddAppModal = ref(false);
const show = () => {
  showAddAppModal.value = true;
};

defineExpose({
  show,
});

let wsConn = null;
const downloadAppFromGithub = (link) => {
  try {
    if (wsConn === null) {
      wsConn = new WebSocket("ws://localhost:5678");
    }
    wsConn.send(
      JSON.stringify({
        event: EventType.I_EVENT_WSS_REQ,
        action: "download",
        url: link,
      })
    );
  } catch (e) {
    console.log(e);
    message.warning(`Failed downloading ${link}...`);
  }
};

const addAppType = ref("download");
const githubFolderLink = ref("");

const newAppAuthor = ref("");
const newAppName = ref("");
const newAppIcon = ref(
  "https://raw.githubusercontent.com/danalites/autoo/main/imgs/logo.png"
);

const disableBuiltInApps = ref(false);
const addNewApp = () => {
  if (
    newAppName.value === "" ||
    newAppName.value.includes("/") ||
    newAppName.value.includes("\\") ||
    newAppName.value.includes(".")
  ) {
    message.error(`Invalid app name \"${newAppName.value}\"`);
    return;
  }

  if (addAppType.value === "download") {
    if (
      githubFolderLink.value === "" ||
      !githubFolderLink.value.startsWith("http")
    ) {
      message.warning("Please enter a valid link");
      return;
    }
    downloadAppFromGithub(githubFolderLink.value);
  } else {
    ipcRenderer.invoke("to-console", {
      action: "create-app",
      appAuthor: newAppAuthor.value,
      appName: newAppName.value,
      appIcon: newAppIcon.value,
    });
  }
  showAddAppModal.value = false;
};

const openExternal = () => {
  shell.openExternal(
    "https://danalites.github.io/autool/docs/basics/apps-macos-display"
  );
};
</script>
