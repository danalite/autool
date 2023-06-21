<template>
  <n-modal v-model:show="showAddAppModal" preset="dialog">
    <template #header>
      <div style="padding-left: 10px">{{ $t("apps.newApp.title") }}</div>
    </template>
    <div>
      <n-tabs type="segment" animated @update:value="changeType($event)">
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
                placeholder="https://github.com/danalite/apps/tree/master/macos"
              />
            </n-input-group>

            <n-space justify="center">
              <n-button
                text
                color="#db5851"
                size="small"
                @click="
                  shell.openExternal(
                    'https://autool.site/en/docs/develop/sample/ai-tools'
                  )
                "
              >
                <template #icon>
                  <n-icon>
                    <Apps />
                  </n-icon>
                </template>
                Browse apps gallery
              </n-button>
            </n-space>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="blank" :tab="$t('apps.newApp.blank')">
          <n-space>
            <n-input-group>
              <n-input-group-label size="small">
                {{ $t("apps.newApp.appName") }}
              </n-input-group-label>
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
            <n-input-group style="padding-top: 3px">
              <n-input-group-label size="small">
                {{ $t("apps.newApp.appIcon") }}
              </n-input-group-label>
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
import { ref } from "vue";
import { Apps } from "@vicons/tabler";
import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const message = useMessage();
const numApps = ref(0);

const showAddAppModal = ref(false);
const show = () => {
  showAddAppModal.value = true;
  numApps.value = appConfig.get("apps").length;
};

defineExpose({
  show,
});

const downloadApp = (link) => {
  message.loading(`Downloading ${link}...`, { duration: 2000 });
  return new Promise(function (resolve, reject) {
    var server = new WebSocket("ws://localhost:5678");

    server.onopen = function () {
      server.send(
        JSON.stringify({
          event: "I_EVENT_WSS_REQ",
          value: "__DOWNLOAD__",
          appUrl: link,
          appHome: appConfig.get("appHome"),
        })
      );
    };
    server.onerror = function (err) {
      console.log(err);
      message.warning(`Failed downloading ${link}...`);
      reject(err);
    };
    server.onmessage = function (e) {
      const data = JSON.parse(e.data);

      if (data.success) {
        message.success(data.message);
        ipcRenderer.send("to-console", { action: "reload-apps" });
      } else {
        message.error(data.message);
      }
      server.close();
    };

    resolve({
      server: server,
    });
  });
};

const addAppType = ref("download");
const githubFolderLink = ref("");

const newAppAuthor = ref("");
const newAppName = ref("");
const newAppIcon = ref(
  "https://raw.githubusercontent.com/danalite/autool/main/imgs/logo.png"
);

const addNewApp = () => {
  if (addAppType.value === "download") {
    if (
      githubFolderLink.value === "" ||
      !githubFolderLink.value.startsWith("http")
    ) {
      message.warning(`INVALID github link: \"${githubFolderLink.value}\"`);
      return;
    }
    downloadApp(githubFolderLink.value);
  } else {
    if (
      newAppName.value === "" ||
      newAppName.value.includes("/") ||
      newAppName.value.includes("\\") ||
      newAppName.value.includes(".")
    ) {
      message.error(`Invalid app name \"${newAppName.value}\"`);
      return;
    }

    ipcRenderer.send("to-console", {
      action: "create-app",
      appAuthor: newAppAuthor.value,
      appName: newAppName.value,
      appIcon: newAppIcon.value,
    });
  }
  showAddAppModal.value = false;
};

ipcRenderer.on("download", (event, data) => {
  downloadApp(data);
});

const changeType = (type) => {
  addAppType.value = type;
};
</script>
