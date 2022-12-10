/*
 * @Author: Strayer
 * @Date: 2022-12-04
 * @LastEditors: Strayer
 * @LastEditTime: 2022-12-10
 * @Description: 
 * @FilePath: \heat-web\src\components\translateBox\js\move.ts
 */

import { ref } from "vue"
import { translateBoxLeft, translateBoxTop } from "./data";

export const isMoving = ref(false);

type MoveType = 'begin' | 'moving' | 'end'

/**
 * @description: 元素移动处理函数
 * @param {MoveType} moveType 移动的类型：'begin' | 'moving' | 'end'
 * @param {MouseEvent} e 鼠标事件参数 
 */
export function moveHandle(moveType: MoveType, e: MouseEvent) {
  const distributeObj: Record<MoveType, (e: MouseEvent) => void> = {
    'begin': beginMoveHandle,
    'moving': onMovingHandle,
    'end': endMoveHandle
  }

  distributeObj[moveType](e)
}

// 开始移动
let [mouseBeginX, mouseBeginY] = [0, 0];
let [originLeft, originTop] = [0, 0];
function beginMoveHandle(e: MouseEvent) {
  // console.log('beginMoveHandle: ', e)
  isMoving.value = true;
  [mouseBeginX, mouseBeginY] = [e.clientX, e.clientY];
  [originLeft, originTop] = [translateBoxLeft.value, translateBoxTop.value];
}

// 移动中
function onMovingHandle(e: MouseEvent) {
  if(!isMoving.value) return;
  // console.log('onMovingHandle: ', value)
  moveTo(e)
}

// 移动结束
function endMoveHandle(e: MouseEvent) {
  if(!isMoving.value) return;
  // console.log('endMoveHandle: ', e)
  isMoving.value = false;
  moveTo(e)
}

function moveTo(e: MouseEvent) {
  const moveX = e.clientX - mouseBeginX;
  const moveY = e.clientY - mouseBeginY;
  [translateBoxLeft.value, translateBoxTop.value] = [originLeft + moveX, originTop + moveY];
}