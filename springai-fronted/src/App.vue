<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// 全局样式初始化
onMounted(() => {
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.fontFamily = '"PingFang SC", "Microsoft YaHei", sans-serif'
})
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>