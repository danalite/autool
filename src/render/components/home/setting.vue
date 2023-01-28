<template>
  <div class="mainCard">
    <n-card class="boxShadow">
      <n-tabs type="segment" :animated="true">
        <n-tab-pane style="padding-top: 3px" name="chap1" tab="Settings">
          <n-space vertical :size="[2, 20]" style="padding-top: 12px">
            <n-space vertical justify="space-between">
              <n-space> License </n-space>

              <n-input
                v-model:value="license.key"
                type="text"
                style="width: 240px"
              />
            </n-space>

            <!-- <n-space vertical justify="space-between">
              App Home
              <n-tag
                :bordered="false"
                type="success"
                style="line-height: 28px !important"
                @click="getGameDirectory"
              >
                <input
                  type="file"
                  id="file"
                  hidden
                  webkitdirectory
                  directory
                  multiple
                />
                <n-ellipsis style="max-width: 240px" :tooltip="false">
                  {{ directory }}
                </n-ellipsis>
              </n-tag>
            </n-space> -->

            <n-space vertical>
              OCR server
              <n-space justify="space-between">
                <n-input
                  v-model:value="remoteServer.ocr.url"
                  type="text"
                  style="width: 240px"
                />
                <n-switch
                  size="small"
                  :round="false"
                  :rubber-band="false"
                  :value="remoteServer.ocr.valid"
                  :loading="isTestRunning.ocr"
                  @update:value="testServer($event, 'ocr')"
                  style="margin-left: 3px; margin-top: 5px"
                >
                  <template #checked> </template>
                  <template #unchecked> </template>
                </n-switch>
              </n-space>
            </n-space>

            <n-space vertical>
              UI-detection server
              <n-space justify="space-between">
                <n-input
                  v-model:value="remoteServer.ui.url"
                  type="text"
                  style="width: 240px"
                />
                <n-switch
                size="small"
                  :round="false"
                  :value="remoteServer.ui.valid"
                  :loading="isTestRunning.ui"
                  @update:value="testServer($event, 'ui')"
                  style="margin-left: 2px; margin-top: 5px"
                >
                  <template #checked> </template>
                  <template #unchecked> </template>
                </n-switch>
              </n-space>
            </n-space>

            <n-space vertical>
              Text-parser server
              <n-space justify="space-between">
                <n-input
                  v-model:value="remoteServer.parser.url"
                  type="text"
                  style="width: 240px"
                />
                <n-switch
                size="small"
                  :round="false"
                  :value="remoteServer.parser.valid"
                  :loading="isTestRunning.parser"
                  @update:value="testServer($event, 'parser')"
                  style="margin-left: 2px; margin-top: 5px"
                >
                  <template #checked> </template>
                  <template #unchecked> </template>
                </n-switch>
              </n-space>
            </n-space>

            <n-space justify="center">
              <n-popconfirm
                @positive-click="toReset"
                positive-text="Sure"
                negative-text="Cancel"
                :show-icon="false"
              >
                <template #trigger>
                  <n-button
                    round
                    size="small"
                    type="success"
                    style="width: 80px"
                    secondary
                  >
                    Reset
                  </n-button>
                </template>
                Confirm to reset all settings?
              </n-popconfirm>
            </n-space>
          </n-space>
        </n-tab-pane>

        <!-- User specified env variable -->
        <n-tab-pane style="padding-top: 3px" name="chap2" tab="Secrets">
          <n-space :style="{ 'margin-top': '10px' }" justify="center">
            <n-button text>
              <template #icon>
                <n-icon>
                  <Lock />
                </n-icon>
              </template>
              How to use secrets?
            </n-button>
          </n-space>

          <n-dynamic-input
            v-model:value="customValue"
            :on-create="onCreate"
            :style="{ 'margin-top': '10px' }"
          >
            <template #create-button-default> Add whatever you want </template>
            <template #default="{ value }">
              <div style="display: flex; align-items: center; width: 100%">
                <n-checkbox
                  v-model:checked="value.isCheck"
                  style="margin-right: 12px"
                />
                <n-input
                  v-model:value="value.num"
                  style="margin-right: 12px; width: 100px"
                />
                <n-input
                  v-model:value="value.string"
                  type="password"
                  show-password-on="click"
                  style="margin-right: 0px; width: 60px"
                />
              </div>
            </template>
          </n-dynamic-input>
        </n-tab-pane>
      </n-tabs>
    </n-card>
    <fbottom />
  </div>
</template>

<script setup>
import {
  NCard,
  NSpace,
  NTag,
  NButton,
  NEllipsis,
  NPopover,
  NSelect,
  NSwitch,
  NModal,
  NSlider,
  NInput,
  NTabs,
  NTabPane,
  NCheckbox,
  NDynamicInput,
  useMessage,
  NPopconfirm,
  NIcon,
} from "naive-ui";
import { ArrowUpLeftCircle, Help, Lock } from "@vicons/tabler";

import { optionsChampion } from "@/utils/render/lolDataList";
import { ref, reactive } from "vue";
import { appConfig } from "@/utils/main/config";
import { useStore } from "@/render/store";
import { ipcRenderer } from "electron";
import { request } from "@/utils/render/request";
import Fbottom from "@/render/components/home/fbottom";

let isExist = ref(false);
let directory = ref("");
const store = useStore();

const message = useMessage();
const license = ref(appConfig.get("license"));
const remoteServer = reactive(appConfig.get("remoteServer"));

const isTestRunning = reactive({
  ocr: false,
  ui: false,
  parser: false,
});

const customValue = ref([
  {
    isCheck: true,
    num: "phoneId",
    string: "zzEmAesdshdy7sgw2",
  },
  {
    isCheck: true,
    num: "myPassword",
    string: "password",
  },
]);

const onCreate = () => {
  return {
    isCheck: false,
    num: "sd",
    string: "A String",
  };
};

// Check if the app directory is set
if (appConfig.get("appHome") != "") {
  isExist.value = true;
  directory.value = appConfig.get("appHome");
}

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

// 获取英雄联盟客户端安装路径
const getGameDirectory = () => {
  const fu = document.getElementById("file");
  fu.click();
  fu.addEventListener("change", (event) => {
    const files = event.target.files[0].path;
    appConfig.set("appHome", files);
    directory.value = files;
    isExist.value = true;
  });
};

const toReset = async () => {
  const blacklist = appConfig.get("blacklist");
  appConfig.clear();
  appConfig.set("blacklist", blacklist);
  message.success("Reset finished. Please restart the app.");
};
</script>

<style scoped>
.mainCard {
  margin-left: 20px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}

.n-card {
  border-radius: 10px;
  padding: 5px;
}

.alignCent {
  align-items: center;
}
</style>
