<template>
  <div style="overflow: hidden">
    <n-space>
      <!-- <task-browser @summonerId="getSummonerId($event)"></task-browser> -->
      <n-space>
        <code-content
          v-if="pageCount == 1"
          class="slide-in-right"
        ></code-content>
        <standing
          :matchData="matchData"
          @changePage="
            () => {
              pageCount = 1;
            }
          "
          @toGameDetailsPage="toGameDetailsPage($event)"
          v-else-if="pageCount == 2"
          class="slide-in-right"
        ></standing>
        <gameDetails
          v-else-if="pageCount == 3"
          class="slide-in-right"
          @changePageSencond="
            () => {
              pageCount = 2;
            }
          "
        ></gameDetails>
      </n-space>
    </n-space>
  </div>
</template>

<script setup>
import codeContent from "@/render/components/taskEditor/codeContent";
import Standing from "@/render/components/taskEditor/standing";
import GameDetails from "@/render/components/taskEditor/gameDetails";
import { NSpace, NIcon } from "naive-ui";

import { onBeforeMount, ref } from "vue";
import { useStore } from "@/render/store";
import { storeToRefs } from "pinia/dist/pinia";
import { appConfig } from "@/utils/main/config";

document.title = "TaskEditor";

let matchData = ref([]);
let pageCount = ref(1);
const store = useStore();
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
