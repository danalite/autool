<template>
  <n-space vertical>
    <n-dynamic-input
      v-model:value="customValue"
      :on-create="onCreate"
      item-style="margin-bottom: 5px"
    >
      <template #create-button-default> Add whatever you want </template>
      <template #default="{ value }">
        <div
          style="
            display: flex;
            align-items: center;
            width: 100%;
          "
        >
          <n-checkbox
            v-model:checked="value.isCheck"
            style="margin-right: 12px"
          />
          <n-input
            size="small"
            v-model:value="value.label"
            :placeholder="$t('settings.canvas.placeholderName')"
            style="margin-right: 12px; width: 80%"
          />
          <n-input
            size="small"
            v-model:value="value.value"
            :placeholder="$t('settings.canvas.placeholderUrl')"
            type="text"
          />
        </div>
      </template>
    </n-dynamic-input>
    <n-space justify="center" style="padding-top: 5px">
      <n-button
        size="small"
        secondary
        type="success"
        @click="saveHelperWindows"
      >
      {{ $t("apps.common.save")  }}
      </n-button>
      <n-button
        size="small"
        secondary
        type="warning"
        @click="resetHelperWindows"
      >
        {{ $t("apps.common.reset")  }}
      </n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import {
  NSpace,
  NDynamicInput,
  NCheckbox,
  NInput,
  NButton,
  useMessage,
} from "naive-ui";
import { ref } from "vue";
import { appConfig } from "@/utils/main/config";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const message = useMessage();

const customValue = ref(appConfig.get("helperWindowsList"));
const onCreate = () => {
  return {
    isCheck: true,
    label: "",
    value: "",
  };
};

const saveHelperWindows = () => {
  appConfig.set("helperWindowsList", customValue.value);
  message.success("Settings saved");
};

const resetHelperWindows = () => {
  appConfig.reset("helperWindowsList");
  customValue.value = appConfig.get("helperWindowsList");
  message.success("Settings reset to default");
};

// const toReset = () => {
//   appConfig.reset();
//   message.success("Settings reset to default");
// };
</script>
