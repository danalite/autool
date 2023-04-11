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
        <accounts-mgr v-if="subTab == 'accounts'" />
        <server-lists v-if="subTab == 'servers'" />
        <canvas-settings v-if="subTab == 'canvas'" />
      </n-layout>
    </n-layout>
  </n-layout-content>
</template>
    
<script setup>
import {
  NCard,
  NInputGroup,
  NInputGroupLabel,
  NLayout,
  NPopselect,
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
  NDivider,
  NTag,
  NBadge,
  NAvatar,
  NText,
  NList,
  NListItem,
  NTooltip,
  NCheckboxGroup,
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

import serverLists from "./settingTabs/serverLists.vue";
import canvasSettings from "./settingTabs/canvasSettings.vue";
import accountsMgr from "./settingTabs/accountsMgr.vue";

import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const collapsed = ref(appConfig.get("isSettingsMenuCollapsed"));
const subTab = ref("accounts");
const onMenuCollapse = () => {
  collapsed.value = !collapsed.value;
  appConfig.set("isSettingsMenuCollapsed", collapsed.value);
};

function renderIcon(icon) {
  return () => h(NIcon, { depth: 4 }, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: () => t("settings.accounts.title"),
    key: "accounts",
    icon: renderIcon(UserCircle),
  },
  {
    label: () => t("settings.services.title"),
    key: "servers",
    icon: renderIcon(Cloud),
  },
  {
    label: () => t("settings.canvas.title"),
    key: "canvas",
    icon: renderIcon(PictureInPictureOff),
  }
];



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
    
    