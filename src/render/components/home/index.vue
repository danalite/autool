<template>
  <!-- Logo and settings on the top -->
  <div>
    <dashboard></dashboard>
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

document.title = "AuTool";
document.getElementsByTagName("html")[0].className = "container";
// document.getElementsByTagName("html")[0].style.background = "#f5f5f5";

const store = useStore();
let { pageCount } = storeToRefs(store);
</script>

<style>
@import url(../../assets/css/animationCommon.css);

/* https://dev.to/tolentinoel/frosted-glass-on-css-37bg */
.container {
  -webkit-backdrop-filter: blur(8px); /* Safari 9+ */
  backdrop-filter: blur(2px); /* Chrome and Opera */
  box-shadow: 0px 10px 15px 10px rgba(228, 228, 228, 0.903);
  background-color: rgba(228, 228, 228, 0.903);
}
</style>
