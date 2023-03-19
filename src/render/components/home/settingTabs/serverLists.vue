<template>
  <n-space vertical>
    <n-divider
      title-placement="left"
      style="margin-bottom: 5px; margin-top: 5px"
    >
      {{ $t("settings.services.taskServer.title") }}
    </n-divider>

    <n-input-group size="small" :style="{ width: '100%' }">
      <n-input-group-label size="small">
        {{ $t("settings.services.taskServer.local") }}
      </n-input-group-label>
      <n-input
        disabled
        size="small"
        placeholder="ws://localhost:5678"
        type="text"
        :style="{ width: '63%' }"
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

    <n-input-group size="small" :style="{ width: '100%' }">
      <n-input-group-label size="small">
        {{ $t("settings.services.taskServer.remote") }}
      </n-input-group-label>
      <n-input
        size="small"
        placeholder="wss://autool.io/server"
        type="text"
        :style="{ width: '63%' }"
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

    <n-divider title-placement="left" style="margin-bottom: 5px">
      {{ $t("settings.services.mediaServer.title") }}
    </n-divider>

    <n-input-group size="small">
      <n-input-group-label size="small">
        {{ $t("settings.services.mediaServer.ocrServer") }}
      </n-input-group-label>
      <n-input
        size="small"
        v-model:value="remoteServer.ocr.url"
        type="text"
        :style="{ width: '63%' }"
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
      <n-input-group-label size="small">
        {{ $t("settings.services.mediaServer.textParser") }}
      </n-input-group-label>
      <n-input
        size="small"
        v-model:value="remoteServer.parser.url"
        type="text"
        :style="{ width: '63%' }"
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
      <n-input-group-label size="small">
        {{ $t("settings.services.mediaServer.uiDetector") }}
      </n-input-group-label>
      <n-input
        size="small"
        v-model:value="remoteServer.ui.url"
        type="text"
        :style="{ width: '63%' }"
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
</template>

<script setup>
import {
  NCard,
  NInputGroup,
  NInputGroupLabel,
  NSpace,
  NIcon,
  NInput,
  NButton,
  NDivider,
  NTag,
  useMessage,
} from "naive-ui";

import { ref, nextTick, h, computed, onMounted, reactive } from "vue";

import { Check, Refresh } from "@vicons/tabler";

import { request } from "@/utils/render/request"
import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const license = ref(appConfig.get("license"));
const remoteServer = reactive(appConfig.get("remoteServer"));
const isLocalServerActive = ref(appConfig.get("isLocalServerActive"));

setInterval(() => {
  isLocalServerActive.value = appConfig.get("isLocalServerActive");
}, 1000);

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