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
        @collapse="onMenuCollapse"
        @expand="onMenuCollapse"
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
        <n-space v-if="subTab == 'accounts'" vertical>
          <n-input-group size="small">
            <n-button secondary :bordered="false" size="small">
              license
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

          <n-input-group size="small">
            <n-button secondary :bordered="false" size="small">
              appHome
            </n-button>
            <n-input
              size="small"
              v-model:value="appHome"
              type="text"
              style="width: 240px"
            />

            <n-button
              secondary
              @click="onAppHomeChange"
              :bordered="false"
              :type="'success'"
              size="small"
            >
              <n-icon size="16">
                <Refresh />
              </n-icon>
            </n-button>
          </n-input-group>

          <n-space justify="center">
            <n-button @click="toReset"> Reset </n-button>
          </n-space>
        </n-space>

        <n-space vertical v-if="subTab == 'servers'">
          <n-space vertical>
            Local server
            <n-input-group size="small">
              <n-input
                disabled
                size="small"
                placeholder="wss://localhost:5678"
                type="text"
                style="width: 350px"
              />
              <n-button
                secondary
                :bordered="false"
                :type="isLocalServerActive ? 'success' : 'error'"
                size="small"
              >
                <n-icon v-if="!isLocalServerActive" size="16">
                  <Refresh />
                </n-icon>
                <n-icon v-else size="16">
                  <Check />
                </n-icon>
              </n-button>
            </n-input-group>
          </n-space>

          <n-space vertical>
            Text recognition
            <n-input-group size="small">
              <n-input
                size="small"
                v-model:value="remoteServer.ocr.url"
                type="text"
                style="width: 350px"
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
          </n-space>

          <n-space vertical>
            Text parser
            <n-input-group size="small">
              <n-input
                size="small"
                v-model:value="remoteServer.parser.url"
                type="text"
                style="width: 350px"
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
          </n-space>

          <n-space vertical>
            UI detection
            <n-input-group size="small">
              <n-input
                size="small"
                v-model:value="remoteServer.ui.url"
                type="text"
                style="width: 350px"
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
        </n-space>

        <n-space vertical v-if="subTab == 'helpers'">
          <n-dynamic-input v-model:value="customValue" :on-create="onCreate">
            <template #create-button-default> Add whatever you want </template>
            <template #default="{ value }">
              <div style="display: flex; align-items: center; width: 100%">
                <n-checkbox
                  v-model:checked="value.isCheck"
                  style="margin-right: 12px"
                />
                <n-input
                  size="small"
                  v-model:value="value.label"
                  style="margin-right: 12px; width: 160px"
                />
                <n-input size="small" v-model:value="value.value" type="text" />
              </div>
            </template>
          </n-dynamic-input>
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
  NDynamicInput,
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
  UserCircle,
  PlayerStop,
  Refresh,
  Check,
  PictureInPictureOff,
} from "@vicons/tabler";

import { appConfig } from "@/utils/main/config";
import { request } from "@/utils/render/request";

const emits = defineEmits(["refreshApps"]);
const message = useMessage();

const appHome = ref(appConfig.get("appHome"));
const license = ref(appConfig.get("license"));

const remoteServer = reactive(appConfig.get("remoteServer"));
const isLocalServerActive = ref(false);

setInterval(() => {
  isLocalServerActive.value = appConfig.get("isLocalServerActive");
}, 1000);

const collapsed = ref(appConfig.get("isSettingsMenuCollapsed"));
const subTab = ref("accounts");
const onMenuCollapse = () => {
  collapsed.value = !collapsed.value;
  appConfig.set("isSettingsMenuCollapsed", collapsed.value);
};

const onAppHomeChange = () => {
  appConfig.set("appHome", appHome.value);
  emits("refreshApps", {});
};

function renderIcon(icon) {
  return () => h(NIcon, { depth: 4 }, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: "Accounts",
    key: "accounts",
    icon: renderIcon(UserCircle),
  },
  {
    label: "Services",
    key: "servers",
    icon: renderIcon(Cloud),
  },
  {
    label: "Helpers",
    key: "helpers",
    icon: renderIcon(PictureInPictureOff),
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

const toReset = () => {
  appConfig.reset();
  message.success("Settings reset to default");
};

const toggleNotificationPanelPosition = (value) => {
  // console.log("onpromptPositionChange", value);
  let position = value ? "top-right" : "top-left";
  store.setPromptPosition(position);
};

const customValue = ref([
  {
    isCheck: true,
    label: "Google",
    value: "https://www.google.com",
  },
]);

const onCreate = () => {
  return {
    isCheck: false,
    label: "Google",
    value: "https://www.google.com",
  };
};


const restartBackendServer = () => {
  request({
    url: "http://localhost:3000/restart",
    method: "GET",
  })
    .then((res) => {
      if (res.status === 200) {
        message.success(`Backend server restarted`);
      } else {
        message.error(`Backend server restart failed`);
      }
    })
    .catch((err) => {
      message.error(`Error: Backend server restart failed. ${err}`);
    });
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
    
    