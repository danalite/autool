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
        @click="reactivateLocalServer"
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
      {{ $t("settings.services.EventSource.title") }}
    </n-divider>

    <n-space v-if="networkCache.length > 0">
      <n-progress
        :v-for="r in networkCache"
        type="line"
        :percentage="30"
        :indicator-placement="'inside'"
      />
    </n-space>
    <n-alert v-else type="warning" :bordered="false">
       No network history.
    </n-alert>
  </n-space>
</template>

<script setup>
import {
  NProgress,
  NAlert,
  NInputGroup,
  NInputGroupLabel,
  NSpace,
  NIcon,
  NInput,
  NButton,
  NDivider,
  NAvatar,
  NTag,
  useMessage,
} from "naive-ui";

import { ref, h, computed, onMounted } from "vue";
import { Check, Refresh } from "@vicons/tabler";

import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";
import { ipcRenderer } from "electron";
const { t } = useI18n();

// Check if license and local server is valid
const license = ref(appConfig.get("license"));
const isLocalServerActive = ref(appConfig.get("isLocalServerActive"));

let failureCount = 0;
setInterval(() => {
  isLocalServerActive.value = appConfig.get("isLocalServerActive");
  if (!isLocalServerActive.value) {
    failureCount++;
    if (failureCount > 10) {
      failureCount = 0;
      ipcRenderer.send("backend-server-reboot", {});
    }
  }
}, 1000);

// Load the network request histories
const networkCache = ref(appConfig.get("networkCache"));

// Send a message to main process to  
const reactivateLocalServer = () => {
  if (!isLocalServerActive.value) {
    ipcRenderer.send("backend-server-reboot", {});
  } 
};
</script>