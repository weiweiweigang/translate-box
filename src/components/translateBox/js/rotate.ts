/*
 * @Author: Strayer
 * @Date: 2022-12-05
 * @LastEditors: Strayer
 * @LastEditTime: 2022-12-11
 * @Description: 
 * @FilePath: \translateBox\src\components\translateBox\js\rotate.ts
 */
import { ref } from "vue"
import { translateBoxHeight, translateBoxRotate, translateBoxWidth, updateBtnData } from './data';
import { MoveType } from "./spread";
import { Tool } from "./tool";

export const isRotating = ref(false);

/**
 * @description: 元素移动处理函数
 * @param {MoveType} rotateType 移动的类型：'begin' | 'moving' | 'end'
 * @param {MouseEvent} e 鼠标事件参数 
 * @return {*}
 */
export function rotateHandle(rotateType: MoveType, e: MouseEvent) {
  const distributeObj: Record<MoveType, (e: MouseEvent) => void> = {
    'begin': beginRotateHandle,
    'moving': rotatingHandle,
    'end': endRotateHandle
  }

  distributeObj[rotateType](e)
}

let [mouseBeginX, mouseBeginY] = [0, 0];
let [centerX, centerY] = [0, 0];
let originRotate = 0;
function beginRotateHandle(e: MouseEvent) {
  isRotating.value = true;
  [mouseBeginX, mouseBeginY] = [e.clientX, e.clientY];
  const {left, top} = document.querySelector('.translateBox')!.getBoundingClientRect();
  [centerX, centerY] = [left + translateBoxWidth.value/2, top+translateBoxHeight.value/2];
  originRotate = translateBoxRotate.value;
}

function rotatingHandle(e: MouseEvent) {
  if(!isRotating.value) return;
  rotateTo(e)
}

// 移动结束
function endRotateHandle(e: MouseEvent) {
  if(!isRotating.value) return;
  isRotating.value = false;
  rotateTo(e);

  updateBtnData()
}

function rotateTo(e: MouseEvent) {
  const angle = Tool.getAngleOfThreePoint([centerX, centerY], [mouseBeginX, mouseBeginY], [e.clientX, e.clientY])
  translateBoxRotate.value = originRotate + angle;
}
