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
      {{ $t("settings.services.EventSource.title") }}
    </n-divider>

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
  NAvatar,
  NTag,
  useMessage,
} from "naive-ui";

import { ref, h, computed, onMounted } from "vue";
import { Check, Refresh } from "@vicons/tabler";

import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const license = ref(appConfig.get("license"));
const isLocalServerActive = ref(appConfig.get("isLocalServerActive"));
setInterval(() => {
  isLocalServerActive.value = appConfig.get("isLocalServerActive");
}, 1000);


</script>