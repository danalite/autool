<template>
  <n-space vertical>
    <n-input-group size="small">
      <n-input-group-label size="small">
        {{ $t("settings.accounts.license") }}
      </n-input-group-label>
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
      <n-input-group-label size="small">
        {{ $t("settings.accounts.appHome") }}
      </n-input-group-label>

      <n-input
        size="small"
        v-model:value="appHome"
        disabled
        type="text"
        style="width: 240px"
      />

      <n-button
        secondary
        @click="openAppHome"
        :bordered="false"
        :type="'success'"
        size="small"
      >
        <n-icon size="16">
          <Refresh />
        </n-icon>
      </n-button>
    </n-input-group>

    <n-input-group size="small">
      <n-input-group-label size="small">
        {{ $t("settings.accounts.language") }}
      </n-input-group-label>
      <n-popselect
        size="small"
        v-model:value="$i18n.locale"
        :options="availableLocales"
      >
        <n-button size="small">
          {{ $i18n.locale == "zh-CN" ? "简体中文" : "English" }}
        </n-button>
      </n-popselect>
    </n-input-group>
  </n-space>
</template>

<script setup>
import {
  NSpace,
  NButton,
  NIcon,
  NInputGroup,
  NInputGroupLabel,
  NInput,
  NPopselect,
} from "naive-ui";

import { ref } from "vue";
import { shell } from "electron";
import { appConfig } from "@/utils/main/config";
import { Refresh, Check } from "@vicons/tabler";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const availableLocales = [
  { label: "English", value: "en-US" },
  { label: "简体中文", value: "zh-CN" },
];

// Open appHome folder
const openAppHome = async () => {
    shell.openPath(appHome.value);
};

const appHome = ref(appConfig.get("appHome"));
const license = ref(appConfig.get("license"));
</script>
