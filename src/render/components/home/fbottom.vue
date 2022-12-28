<template>
  <div :style="{ 'margin-top': '15px' }">
    <n-card class="boxShadow" size="small">
      <n-space justify="center">
        <n-space
          justify="space-between"
          style="margin-top: 5px; margin-bottom: 0px"
        >
          <n-button round :bordered="false" color="#7289da" ghost>
            <n-popover trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-icon size="25" @click="openGithub">
                  <BrandDiscord />
                </n-icon>
              </template>
              Join discord
            </n-popover>
          </n-button>

          <n-button round :bordered="false" color="green" ghost>
            <n-popover trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-icon size="25" @click="openGithub">
                  <ArrowUpCircle />
                </n-icon>
              </template>
              Upgrade to latest version
            </n-popover>
          </n-button>

          <n-button round :bordered="false" color="#2685c2" ghost>
            <n-popover trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-icon size="25" @click="openGithub">
                  <Book />
                </n-icon>
              </template>
              Documents
            </n-popover>
          </n-button>

          <n-button round :bordered="false" color="#db2544" ghost>
            <n-popover trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-icon size="25" @click="openWhop">
                  <Diamond />
                </n-icon>
              </template>
              Subscription
            </n-popover>
          </n-button>


        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { NCard, NSpace, NButton, NIcon, NPopover } from "naive-ui";
import { BrandDiscord, Book, ArrowUpCircle, Diamond } from "@vicons/tabler";
import { shell } from "electron";
import { ref, onMounted } from "vue";
import { request } from "@/utils/render/request";
import { useStore } from "@/render/store";
import { storeToRefs } from "pinia/dist/pinia";

let showPopover = ref(false);
const store = useStore();
const { frankVersion } = storeToRefs(store);

// 检查版本更新
onMounted(async () => {
  const onLineFrankVersion = (
    await request({
      url: " https://unpkg.com/@java_s/op.gg/package.json",
    })
  ).data.frankVersion;
  if (frankVersion.value != onLineFrankVersion) {
    showPopover.value = true;
  }
});
const openUpdate = () => {
  shell.openExternal("https://www.yuque.com/java-s/frank/update");
  showPopover.value = false;
};

const openGithub = () => {
  shell.openExternal("https://github.com/java-S12138/frank");
};
const openWhop = () => {
  shell.openExternal("https://whop.com/hub/?page=products&company=abatech&tab=Home");
};
const openFrank = () => {
  shell.openExternal("https://www.yuque.com/java-s/frank");
};
</script>

<style scoped>
.n-card {
  border-radius: 10px;
  padding: 0px;
}
</style>
