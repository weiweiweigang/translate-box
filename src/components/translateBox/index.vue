
<!--
 * @Author: Strayer
 * @Date: 2022-12-04
 * @LastEditors: Strayer
 * @LastEditTime: 2022-12-11
 * @Description: 图片编辑
 * @FilePath: \translateBox\src\components\translateBox\index.vue
-->
<template>
  <!-- 这一层用作移动目标和旋转时的中心点点位 -->
  <div 
    class="translateBox" 
    :id="boxId"
    :style="{
      transform: `translate(${translateBoxLeft}px, ${translateBoxTop}px)`
    }"
  >
    <!-- 这一层用作拉伸和旋转 -->
    <div 
      class="translate"
      :style="{
        width: translateBoxWidth+'px',
        height: translateBoxHeight+'px',
        transform: `rotate(${translateBoxRotate}deg)`
      }"
    >
      <!-- 内容放置区+内容反转区 -->
      <div 
        class="content" 
        :style="{
          transform: `scale(${isReverseX? -1:1}, ${isReverseY? -1:1})`
        }"
        @mousedown="moveHandleLocal('begin', $event)"
        @mousemove="moveHandleLocal('moving', $event)"
        @mouseup="moveHandleLocal('end', $event)"
      >
        <slot></slot>
      </div>

      <!-- 缩放和旋转控制按钮放置区 -->
      <div 
        class="controlBox"
        :style="{opacity: props.hideControlBtn? 0:1}"
      >
        <!-- 缩放按钮 -->
        <template v-if="!props.closeSpread" >
          <div 
            v-for="item in btnData"
            :class="`btn spread${item.name[0].toUpperCase()+item.name.substring(1)}Btn`"
            :style="{
              cursor: item.cursor,
              bottom: item.bottom,
              top: item.top,
              left: item.left,
              right: item.right,
              width: item.width ?? '23px',
              height: item.height ?? '23px',
            }"
            @mousedown="spreadHandLocal(item.name, 'begin', $event)"
            @drag="spreadHandLocal(item.name, 'moving', $event)"
            @mouseup="spreadHandLocal(item.name, 'end', $event)"
            @dragend="spreadHandLocal(item.name, 'end', $event)"
          >
            <img :src="props.hideControlBtn? opacityZeroImg:spreadBtnImg" :style="{
              width: item.width? '100%':'23px',
              height: item.height? '100%':'23px',
            }" >
          </div>
        </template>
        <!-- 旋转按钮 -->
        <div 
          v-if="!props.closeRotate" 
          class="rotateBtn"
          @mousedown="rotateHandleLocal('begin', $event)"
          @drag="rotateHandleLocal('moving', $event)"
          @dragend="rotateHandleLocal('end', $event)"
        ><img :src="props.hideControlBtn? opacityZeroImg:rotateBtnImg" ></div>
      </div>
    </div>
  </div>
  
  <!-- 拿来做元素拖动超出时的鼠标检测 -->
  <div 
    v-show="isMoving" 
    class="mouseMoveTool" 
    @mousemove="moveHandleLocal('moving', $event)"
    @mouseup="moveHandleLocal('end', $event)"
  ></div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue';
import { 
  spreadBtnImg, 
  rotateBtnImg,
  updateOriginBtnData,
  opacityZeroImg,
  updateBtnData,
Btn,
} from './js/data';
import { moveHandle } from './js/move';
import { rotateHandle } from './js/rotate';
import { MoveType, spreadHand, SpreadType } from './js/spread';
import { Tool } from './js/tool';

// -----------对外接口begin-------
const props = defineProps<{
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  rotate?: number,
  closeSpread?: boolean, // 关闭拉伸功能
  closeRotate?: boolean, // 关闭旋转功能
  hideControlBtn?: boolean, // 隐藏按钮，但功能可用
}>()

type EmitMoveObj = {
  type: 'move' | 'spread' | 'rotate',
  left: number,
  top: number,
  width: number,
  height: number,
  rotate: number,
  isReverseX: boolean,
  isReverseY: boolean,
}
const emit = defineEmits<{
  (e: 'beginMove', value: EmitMoveObj): void,
  (e: 'moving', value: EmitMoveObj): void;
  (e: 'endMove', value: EmitMoveObj): void;
}>()
// -----------对外接口end-------

// 生成控制按钮
const btnDataOrigin = shallowRef<Btn>([])
const btnData = ref(Tool.DeepClone(btnDataOrigin.value))

// 盒子相关属性
const translateBoxLeft = ref(props.left ?? 0); 
const translateBoxTop = ref(props.top ?? 0);
const translateBoxWidth = ref(props.width ?? 200);
const translateBoxHeight = ref(props.height ?? 200);
const translateBoxRotate = ref(props.rotate ?? 0);
const isReverseX = ref(false); // 盒子在横轴方向上是否倒置
const isReverseY = ref(false); // 盒子在纵轴方向上是否倒置

const boxId = ref(Tool.GetUID()); // 元素Id

const isMoving = ref(false);
const isRotating = ref(false);
const isShift = ref(false); //是否按下control建
const isSpreading = ref(false);
const curSpreadType = ref<SpreadType>('top')

/**
 * @description: 发送emit
 * @param {*} moveType
 * @return {*}
 */
function emitHandle(moveType: MoveType, type: 'move' | 'spread' | 'rotate') {
  const emitValue = {
    type,
    left: translateBoxLeft.value,
    top: translateBoxTop.value,
    width: translateBoxWidth.value,
    height: translateBoxHeight.value,
    rotate: translateBoxRotate.value,
    isReverseX: isReverseX.value,
    isReverseY: isReverseY.value,
  }
  switch(moveType) {
    case 'begin': emit('beginMove', emitValue); break;
    case 'end': emit('endMove', emitValue); break;
    case 'moving': 
      if(isMoving.value || isSpreading.value || isRotating.value) emit('moving', emitValue); 
      break;
    default: const noAny: never = moveType;
  }
}

watch(() => props.hideControlBtn, value => {
  updateOriginBtnData({ btnDataOrigin, btnData, isFull: value })
  updateBtnData({ btnDataOrigin, btnData, translateBoxRotate });
})
updateOriginBtnData({ btnDataOrigin, btnData, isFull: props.hideControlBtn });

// 本地转发一下，因为要出发emit
function moveHandleLocal(moveType: MoveType, e: MouseEvent) {
  moveHandle({e, moveType, isMoving, translateBoxLeft, translateBoxTop})
  emitHandle(moveType, 'move')
}

// 本地转发一下，因为要出发emit
function spreadHandLocal(spreadType: SpreadType, moveType: MoveType, e: MouseEvent) {
  spreadHand({
    e,
    translateBoxRotate,
    translateBoxWidth,
    translateBoxHeight,
    translateBoxTop,
    translateBoxLeft,
    isReverseX,
    isReverseY,
    isShift,
    isSpreading,
    curSpreadType,
    boxId,
    spreadType,
    moveType
  });

  emitHandle(moveType, 'spread');

  if(moveType === 'end') isShift.value = false; //鼠标按住不放时，不会触发按键的keyup事件
}

function rotateHandleLocal(moveType: MoveType, e: MouseEvent) {
  rotateHandle({
    e,
    isRotating,
    boxId,
    translateBoxRotate,
    translateBoxWidth,
    translateBoxHeight,
    btnDataOrigin,
    btnData,
    rotateType: moveType
  })
  emitHandle(moveType, 'rotate')
}

const onKeyDown = (event: KeyboardEvent) => {
  if(event.key === 'Shift') isShift.value = true;
}
const onKeyUp = (event: KeyboardEvent) => {
  console.log('event: ', event);
  if(event.key === 'Shift') isShift.value = false;
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
</script>

<style lang="scss" scoped>
.translateBox {
  user-select: none;
  z-index: 9;
  position: absolute;
  top: 0;
  left: 0;

  .content {
    cursor: move;
    width: 100%;
    height: 100%;
  }

  .controlBox {
    .btn {
      position: absolute;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .rotateBtn {
      cursor: crosshair;
      position: absolute;
      width: 16px;
      height: 16px;
      line-height: 16px;
      top: -26px;
      right: -26px;
    }
  }
}

.mouseMoveTool {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>