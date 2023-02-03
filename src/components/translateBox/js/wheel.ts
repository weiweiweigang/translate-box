/*
 * @Author: Strayer
 * @Date: 2023-02-03
 * @LastEditors: Strayer
 * @LastEditTime: 2023-02-03
 * @Description: 
 * @FilePath: \translateBox\src\components\translateBox\js\wheel.ts
 */

import { Ref } from "vue";

export function wheelHand(param: {
  e:WheelEvent,
  openWheelSpread?: boolean,
  translateBoxWidth: Ref<number>,
  translateBoxHeight: Ref<number>,
  translateBoxTop: Ref<number>,
  translateBoxLeft: Ref<number>,
}) {
  if(!param.openWheelSpread) return;
  
  let addValue = -20;
  if(param.e.deltaY < 0) addValue = 20;
  const heightAddValue = addValue*param.translateBoxHeight.value/param.translateBoxWidth.value;;
  
  const newWidth = param.translateBoxWidth.value + addValue;
  const newHeight = param.translateBoxHeight.value + heightAddValue;
  if(newWidth<2 || newHeight<2) return;

  param.translateBoxWidth.value = newWidth;
  param.translateBoxHeight.value = newHeight;

  param.translateBoxLeft.value = param.translateBoxLeft.value - addValue / 2;
  param.translateBoxTop.value = param.translateBoxTop.value - heightAddValue / 2;
}