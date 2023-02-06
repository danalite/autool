<template>
  <n-layout-content
    position="absolute"
    content-style="padding: 0px;"
    style="top: 40px; bottom: 0px"
    :native-scrollbar="false"
  >
    <n-layout has-sider position="absolute">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="55"
        :width="160"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        :native-scrollbar="false"
        style="background-color: #f5f5f5"
      >
        <n-menu
          :indent="22"
          v-model:value="subTab"
          :collapsed="collapsed"
          :collapsed-width="55"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
      </n-layout-sider>

      <n-layout content-style="padding: 15px 25px 5px;">
        <n-space v-if="subTab == 'accounts'">
          <n-input-group size="small">
            <n-button secondary :bordered="false" size="small">
              License
            </n-button>
            <n-input
              size="small"
              v-model:value="license.key"
              type="text"
              style="width: 240px"
            />

            <n-button
              secondary
              :bordered="false"
              :type="license.valid ? 'success' : 'warning'"
              size="small"
            >
              <n-icon v-if="!license.valid" size="16">
                <Refresh />
              </n-icon>
              <n-icon v-else size="16">
                <Check />
              </n-icon>
            </n-button>
          </n-input-group>
        </n-space>

        <n-space v-if="subTab == 'servers'">
          <n-input-group size="small">
            <n-button
              secondary
              :bordered="false"
              size="small"
              style="width: 100px"
            >
              Text OCR
            </n-button>
            <n-input
              size="small"
              v-model:value="remoteServer.ocr.url"
              type="text"
              style="width: 320px"
            />

            <n-button
              secondary
              :bordered="false"
              :type="remoteServer.ocr.valid ? 'success' : 'warning'"
              size="small"
              :loading="isTestRunning.ocr"
              @click="testServer($event, 'ocr')"
            >
              <n-icon v-if="!remoteServer.ocr.valid" size="16">
                <Refresh />
              </n-icon>
              <n-icon v-else size="16">
                <Check />
              </n-icon>
            </n-button>
          </n-input-group>

          <n-input-group size="small">
            <n-button
              secondary
              :bordered="false"
              size="small"
              style="width: 100px"
            >
              Text parse
            </n-button>
            <n-input
              size="small"
              v-model:value="remoteServer.parser.url"
              type="text"
              style="width: 320px"
            />

            <n-button
              secondary
              :bordered="false"
              :type="remoteServer.parser.valid ? 'success' : 'warning'"
              size="small"
              :loading="isTestRunning.parser"
              @click="testServer($event, 'parser')"
            >
              <n-icon v-if="!remoteServer.parser.valid" size="16">
                <Refresh />
              </n-icon>
              <n-icon v-else size="16">
                <Check />
              </n-icon>
            </n-button>
          </n-input-group>

          <n-input-group size="small">
            <n-button
              secondary
              :bordered="false"
              size="small"
              style="width: 100px"
            >
              UI detect
            </n-button>
            <n-input
              size="small"
              v-model:value="remoteServer.ui.url"
              type="text"
              style="width: 320px"
            />

            <n-button
              secondary
              :bordered="false"
              :type="remoteServer.ui.valid ? 'success' : 'warning'"
              size="small"
              :loading="isTestRunning.ui"
              @click="testServer($event, 'ui')"
            >
              <n-icon v-if="!remoteServer.ui.valid" size="16">
                <Refresh />
              </n-icon>
              <n-icon v-else size="16">
                <Check />
              </n-icon>
            </n-button>
          </n-input-group>

        </n-space>
      </n-layout>
    </n-layout>
  </n-layout-content>
</template>
    
    <script setup>
import {
  NCard,
  NInputGroup,
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
  NCountdown,
  NTimeline,
  NTimelineItem,
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
  NSwitch,
} from "naive-ui";

import { ref, nextTick, h, computed, onMounted, reactive } from "vue";
import {
  Copyright,
  BrandAndroid,
  Keyboard,
  Clock,
  Cloud,
  Pencil,
  CloudDownload,
  DevicesPc,
  Plus,
  Trash,
  FileReport,
  Search,
  Box,
  Run,
  Alarm,
  PlayerPlay,
  PlayerStop,
  Refresh,
  Check,
} from "@vicons/tabler";

import { ipcRenderer, shell } from "electron";
import { appConfig } from "@/utils/main/config";
import { request } from "@/utils/render/request";

const message = useMessage();
const license = ref(appConfig.get("license"));
const remoteServer = reactive(appConfig.get("remoteServer"));

const collapsed = ref(false);
const subTab = ref("accounts");

function renderIcon(icon) {
  return () => h(NIcon, { depth: 4 }, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: "Accounts",
    key: "accounts",
    icon: renderIcon(PlayerPlay),
  },
  {
    label: "Servers",
    key: "servers",
    icon: renderIcon(Cloud),
  },
];

const isTestRunning = reactive({
  ocr: false,
  ui: false,
  parser: false,
});

const testServer = (switchOn, target) => {
  isTestRunning[target] = true;
  if (switchOn) {
    if (remoteServer[target]["url"] == "") {
      message.error("Please enter server address");
      isTestRunning[target] = false;
      return;
    }
    // console.log("@@", remoteServer[target]['url'])
    request({
      url: remoteServer[target]["url"],
      method: "GET",
    })
      .then((res) => {
        isTestRunning[target] = false;
        if (res.status === 200) {
          message.success(`${target} server is working`);
          appConfig.set(`remoteServer.${target}.valid`, true);
          appConfig.set(
            `remoteServer.${target}.url`,
            remoteServer[target]["url"]
          );
        } else {
          message.error(`${target} server is not working`);
        }
      })
      .catch((err) => {
        isTestRunning[target] = false;
        message.error(`Error: ${target} server invalid. ${err}`);
      });
  } else {
    isTestRunning[target] = false;
    appConfig.set(`remoteServer.${target}.valid`, false);
    message.warning(`${target} server turned off`);
  }
};
</script>
    
  <style scoped>
.active {
  background-color: #e3f5f1 !important;
  /* color: #f5f5f5; */
}

.hover {
  background-color: #f5f5f5;
  /* color: rgb(200, 92, 92); */
}

.invisible {
  visibility: hidden;
}
</style>
    
    