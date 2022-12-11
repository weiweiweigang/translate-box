<script setup lang="ts">
import TranslateBox from './components/translateBox/index.vue'
</script>

<template>
  <div class="main">
    <TranslateBox>
      <img :style="{
        width: '100%',
        height:' 100%',
      }"
        style="-webkit-user-drag: none;"
        src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fn.sinaimg.cn%2Ftranslate%2F147%2Fw1080h667%2F20190419%2Fu6xK-hvvuiyn1957426.jpg&refer=http%3A%2F%2Fn.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1673266094&t=a93adabd1ebedff3a1e9d90cb05c6348"
        alt=""
      >
    </TranslateBox>
  </div>
</template>

<style scoped>
.main {
  position: relative;
  top: 10px;
  left: 10px;
  width: calc(100vw - 40px);
  height: calc(100vh - 40px);
  border: 1px solid black;
  background-color: aquamarine;
  overflow: hidden;
}
</style>
