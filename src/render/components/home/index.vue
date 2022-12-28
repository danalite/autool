<template>
  <!-- Logo and settings on the top -->
  <dashboard></dashboard>
  <div>
    <app-main v-show="pageCount == 1" class="slide-in-left"></app-main>
    <setting v-show="pageCount == 2" class="slide-in-right"></setting>
  </div>
</template>

<script setup>
import Dashboard from "./dashboard.vue";
import Setting from "./setting.vue";
import AppMain from "./appMain.vue";
import { useStore } from "../../store";
import { storeToRefs } from "pinia";

document.title = "AbaTech";
const store = useStore();
let { pageCount } = storeToRefs(store);
</script>

<style scoped>
@import url(../../assets/css/animationCommon.css);
</style>
