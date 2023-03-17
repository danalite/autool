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
                {{ $i18n.locale == "zh" ? "简体中文" : "English" }}
              </n-button>
            </n-popselect>
          </n-input-group>

          <!-- <n-space justify="center">
            <n-button @click="toReset"> Reset </n-button>
          </n-space> -->
        </n-space>

        <serverLists v-if="subTab == 'servers'" />
        <helperWindows v-if="subTab == 'helpers'" />

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

import serverLists from "./settingTabs/serverLists.vue";
import helperWindows from "./settingTabs/helperWindows.vue";

import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const emits = defineEmits(["refreshApps"]);
const message = useMessage();

const availableLocales = [
  { label: "English", value: "en" },
  { label: "简体中文", value: "zh" },
];

const appHome = ref(appConfig.get("appHome"));
const license = ref(appConfig.get("license"));

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
    label: () => t("settings.helpers.title"),
    key: "helpers",
    icon: renderIcon(PictureInPictureOff),
  },
];

const toReset = () => {
  appConfig.reset();
  message.success("Settings reset to default");
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
    
    