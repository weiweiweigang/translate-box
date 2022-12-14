<script setup lang="ts">
import { reactive } from 'vue';
import TranslateBox from './components/translateBox/index.vue'

const form = reactive({
  closeSpread: false, // 关闭拉伸功能
  closeRotate: false, // 关闭旋转功能
  hideControlBtn: false, // 隐藏按钮，但功能可用
})

</script>

<template>
  <div class="main">
    <div>
      <TranslateBox
        :hide-control-btn="form.hideControlBtn"
        :close-rotate="form.closeRotate"
        :close-spread="form.closeSpread"
      >
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
    <div>
      <TranslateBox
        :left="700"
        :top="100"
        :width="200"
        :height="200"
        :hide-control-btn="true"
        :close-rotate="true"
      >
      <div class="control">
        <p>按住shift键等比缩放</p>
        <el-form :model="form" label-width="120px">
          <el-form-item label="隐藏按钮">
            <el-switch v-model="form.hideControlBtn" />
          </el-form-item>
          <el-form-item label="关闭拉伸功能">
            <el-switch v-model="form.closeSpread" />
          </el-form-item>
          <el-form-item label="关闭旋转功能">
            <el-switch v-model="form.closeRotate" />
          </el-form-item>
        </el-form>
      </div>
    </TranslateBox>
    </div>
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
.control {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
}
</style>
