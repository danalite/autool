<script setup>
import { NMessageProvider, NConfigProvider, darkTheme } from "naive-ui";
</script>

<template>
  <n-message-provider :placement="'bottom'">
    <router-view></router-view>
  </n-message-provider>
</template>

<style>
/* @font-face {
  font-family: 'Quicksand';
  src: url("assets/fonts/Quicksand-Medium.ttf");
} */
* {
  margin: 0;
  padding: 0;
  font-family: Monospace, Arial, sans-serif;
  -webkit-user-select: none;
}
::-webkit-scrollbar {
  width: 0;
}
.boxShadow {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08),
    0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

#app {
  /* -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  /* text-align: center; */
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
