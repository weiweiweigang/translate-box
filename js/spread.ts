/*
 * @Author: Strayer
 * @Date: 2022-12-04
 * @LastEditors: Strayer
 * @LastEditTime: 2022-12-10
 * @Description: 
 * @FilePath: \heat-web\src\components\translateBox\js\spread.ts
 */
import { ref } from "vue"
import Util from '@/utils/util';
import { 
  translateBoxHeight, 
  translateBoxLeft, 
  translateBoxTop, 
  translateBoxWidth, 
  isReverseX, 
  isReverseY, 
  translateBoxRotate
} from "./data";

export type SpreadType = 'top' | 'right' | 'bottom' | 'left' | 'leftTop' | 'rightTop' | 'rightBottom' | 'leftBottom';
export type MoveType = 'begin' | 'moving' | 'end'

export const isShift = ref(false); //是否按下control建
export const isSpreading = ref(false);
export const curSpreadType = ref<SpreadType>('top')

/**
 * @description: 元素缩放处理函数
 * @param {SpreadType} SpreadType 缩放类型 'top' | 'right' | 'bottom' | 'left' | 'leftTop' | 'rightTop' | 'rightBottom' | 'leftBottom'
 * @param {MoveType} moveType 移动类型 'begin' | 'moving' | 'end'
 * @param {MouseEvent} e 鼠标事件参数
 * @return {*}
 */
export function spreadHand(spreadType: SpreadType, moveType: MoveType, e: MouseEvent){
  const distributeObj: Record<MoveType, (e: MouseEvent,  spreadType: SpreadType) => void> = {
    'begin': beginMoveHandle,
    'moving': onMovingHandle,
    'end': endMoveHandle
  }

  curSpreadType.value = spreadType;
  distributeObj[moveType](e, spreadType)
}

// 开始移动
let [mouseBeginX, mouseBeginY] = [0, 0];
let [originLeft, originTop] = [0, 0];
let [originWidth, originHeight] = [0, 0];
let [originReverseX, originReverseY] = [false, false];
let [centerX, centerY] = [0, 0];
function beginMoveHandle(e: MouseEvent) {
  isSpreading.value = true;
  [mouseBeginX, mouseBeginY] = [e.clientX, e.clientY];
  [originLeft, originTop] = [translateBoxLeft.value, translateBoxTop.value];
  [originWidth, originHeight] = [translateBoxWidth.value, translateBoxHeight.value];
  [originReverseX, originReverseY] = [isReverseX.value, isReverseY.value];
  const {left, top} = document.querySelector('.translateBox')!.getBoundingClientRect();
  [centerX, centerY] = [left + translateBoxWidth.value/2, top+translateBoxHeight.value/2];
}

// 移动中
function onMovingHandle(e: MouseEvent, spreadType: SpreadType) {
  if(!isSpreading.value) return;
  if(e.clientX === 0) return;
  moveTo(e, spreadType)
}

// 移动结束
function endMoveHandle(e: MouseEvent, spreadType: SpreadType) {
  if(!isSpreading.value) return;
  isSpreading.value = false;
  moveTo(e, spreadType)
}

function moveTo(e: MouseEvent, spreadType: SpreadType) {
  if(spreadType === 'right') moveToRight(getMoveValue(e));
  if(spreadType === 'left') moveToLeft(getMoveValue(e));
  if(spreadType === 'bottom') moveToBottom(getMoveValue(e));
  if(spreadType === 'top') moveToTop(getMoveValue(e));

  if(spreadType === 'rightBottom') moveToRightBottom(e);
  if(spreadType === 'rightTop') moveToRightTop(e);
  if(spreadType === 'leftTop') moveToLeftTop(e);
  if(spreadType === 'leftBottom') moveToLeftBottom(e);
}

// -------------------------上下左右缩放begin--------------------
/**
 * @description: 上下左右缩放时计算在该方向上要移动的距离
 */
function getMoveValue(e: MouseEvent): number {
  const AC_len = Util.GetWebMercatorLen([[centerX, centerY], [e.clientX, e.clientY]])
  const AO_len = Util.GetWebMercatorLen([[centerX, centerY], [mouseBeginX, mouseBeginY]])
  const CAB_angle = Util.getAngleOfThreePoint([centerX, centerY], [mouseBeginX, mouseBeginY], [e.clientX, e.clientY], true);
  const AB_len = AC_len * Math.cos(CAB_angle);

  return AB_len - AO_len;
} 

/**
 * @description: 上下左右缩放时计算相对于该方向上中心点需要偏移的距离
 */
function getCenterOffset(moveValue: number, type: 'with'| 'height') {
  const centerMoveValue = moveValue / 2;
  const centerOffsetX = (type === 'with')? (centerMoveValue - centerMoveValue * Math.cos(translateBoxRotate.value*Math.PI/180)) : centerMoveValue*Math.sin(translateBoxRotate.value*Math.PI/180);
  const centerOffsetY = (type === 'with')? centerMoveValue * Math.sin(translateBoxRotate.value*Math.PI/180) : (centerMoveValue - centerMoveValue * Math.cos(translateBoxRotate.value*Math.PI/180));
  return [centerOffsetX, centerOffsetY];
}

/**
 * @description: 上下左右缩放时设置宽度或高度
 */
function setWidthOrHeight(moveValue: number, type: 'with'| 'height') {
  let newWidth = type === 'with' ? (originWidth + moveValue) : 0;
  let newHeight = type === 'height'? (originHeight + moveValue) : 0;

  if(isShift.value) {
    if(type === 'with') {
      newHeight = originHeight + moveValue*originHeight/originWidth;
    }else {
      newWidth = originWidth + moveValue*originWidth/originHeight;
    }
  }

  if(newWidth > 0) {
    translateBoxWidth.value = newWidth;
    (isReverseX.value !== originReverseX)? isReverseX.value = originReverseX:'';
  }else if(newWidth < 0) {
    translateBoxWidth.value = -newWidth;
    (isReverseX.value === originReverseX)? isReverseX.value = !originReverseX:'';
  }

  if(newHeight > 0) {
    translateBoxHeight.value = newHeight;
    (isReverseY.value !== originReverseY)? isReverseY.value = originReverseY:'';
  }else if(newHeight < 0) {
    translateBoxHeight.value = -newHeight;
    (isReverseY.value === originReverseY)? isReverseY.value = !originReverseY:'';
  }
}

function moveToRight(moveValue: number) {
  setWidthOrHeight(moveValue, 'with')
  const [centerOffsetX, centerOffsetY] = getCenterOffset(moveValue, 'with')
  
  if(isShift.value) {
    const heightAddValue = translateBoxHeight.value - originHeight;
    translateBoxTop.value = originTop + centerOffsetY - heightAddValue/2;
  }else translateBoxTop.value = originTop + centerOffsetY;

  if(originWidth + moveValue > 0) {
    translateBoxLeft.value = originLeft - centerOffsetX;
  }else{
    translateBoxLeft.value = originLeft + (moveValue + originWidth) - centerOffsetX;
  }
}

function moveToLeft(moveValue: number) {
  setWidthOrHeight(moveValue, 'with')
  const [centerOffsetX, centerOffsetY] = getCenterOffset(moveValue, 'with')

  if(isShift.value) {
    const heightAddValue = translateBoxHeight.value - originHeight;
    translateBoxTop.value = originTop - centerOffsetY - heightAddValue/2;
  }else translateBoxTop.value = originTop - centerOffsetY;

  if(originWidth + moveValue > 0) {
    translateBoxLeft.value = originLeft - moveValue + centerOffsetX;
  }else{
    translateBoxLeft.value = originLeft + originWidth + centerOffsetX;
  }
}

function moveToBottom(moveValue: number) {
  setWidthOrHeight(moveValue, 'height')
  const [centerOffsetX, centerOffsetY] = getCenterOffset(moveValue, 'height')

  if(isShift.value) {
    const widthAddValue = translateBoxWidth.value - originWidth;
    translateBoxLeft.value = originLeft - centerOffsetX - widthAddValue/2;
  }else translateBoxLeft.value = originLeft - centerOffsetX;

  if(originHeight + moveValue > 0) {
    translateBoxTop.value = originTop - centerOffsetY;
  }else {
    translateBoxTop.value = originTop + moveValue + originHeight - centerOffsetY;
  }
}

function moveToTop(moveValue: number) {
  setWidthOrHeight(moveValue, 'height')
  const [centerOffsetX, centerOffsetY] = getCenterOffset(moveValue, 'height')
  
  if(isShift.value) {
    const widthAddValue = translateBoxWidth.value - originWidth;
    translateBoxLeft.value = originLeft + centerOffsetX - widthAddValue/2;
  }else translateBoxLeft.value = originLeft + centerOffsetX;
  
  if(originHeight + moveValue > 0) {
    translateBoxTop.value = originTop - moveValue + centerOffsetY;
  }else {
    translateBoxTop.value = originTop + originHeight + centerOffsetY;
  }
}

// -------------------------上下左右缩放end--------------------

// -------------------------对角线缩放begin--------------------
type NewValue = {
  newCenter: [number, number],
  C_point: [number, number],
  newWidth: number,
  newHeight: number,
}
function getB_point(originB_point: [number, number]) {
  const B_point: [number, number] = Util.createLatLngOfRotate({
    latLng: originB_point,
    center: [centerX, centerY],
    rotateNum: -translateBoxRotate.value
  })
  return B_point
}
function getC_Point(e: MouseEvent, originB_point: [number, number]) {
  let C_point: [number, number] = [e.clientX, e.clientY];
  const B_point: [number, number] = getB_point(originB_point);
  if(isShift.value) {
    let CAB_angle = Util.getAngleOfThreePoint(
      [centerX, centerY],
      B_point,
      C_point,
    )
    
    // TODO 这里有点生硬，或者可以把中心点换成无限远的一个点
    if(CAB_angle > 90) CAB_angle = CAB_angle-180;
    else if(CAB_angle < -90) CAB_angle = CAB_angle+180;

    C_point = Util.createLatLngOfRotate({
      latLng: C_point,
      center: [centerX, centerY],
      rotateNum: CAB_angle
    })
  }

  return C_point;
}
function getCalcNewValue(C_point: [number, number], D_point: [number, number], originB_point: [number, number], xIsSin: boolean): NewValue {
  const D1_point = Util.createLatLngOfRotate({
    latLng: D_point,
    center: [centerX, centerY],
    rotateNum: -translateBoxRotate.value
  })

  const B_point = getB_point(originB_point)
  const D1BC_angle = Util.getAngleOfThreePoint(B_point, D1_point, C_point, true);
  const EBC_angle = Math.PI - D1BC_angle;

  const BC_len = Util.GetWebMercatorLen([B_point, C_point]);
  const moveX = xIsSin? BC_len*Math.sin(EBC_angle):BC_len*Math.cos(EBC_angle);
  const moveY = xIsSin? BC_len*Math.cos(EBC_angle):BC_len*Math.sin(EBC_angle);
  const newWidth = originWidth + moveX;
  const newHeight = originHeight + moveY;
  const newCenter: [number, number] = [centerX+moveX/2, centerY+moveY/2];

  return { newCenter, C_point, newWidth, newHeight }
}

function setPotionAndShape(newValueObj: NewValue, M2_point: [number, number]) {
  const M3_point: [number, number] = Util.createLatLngOfRotate({
    latLng: M2_point,
    center: newValueObj.newCenter, 
    rotateNum: -translateBoxRotate.value
  })

  const offsetValue: [number, number] = [newValueObj.C_point[0]-M3_point[0], newValueObj.C_point[1]-M3_point[1]];

  if(newValueObj.newWidth > 0) {
    translateBoxWidth.value = newValueObj.newWidth;
    (isReverseX.value !== originReverseX)? isReverseX.value = originReverseX:'';
    translateBoxLeft.value = originLeft + offsetValue[0];
  }else {
    translateBoxWidth.value = - newValueObj.newWidth;
    (isReverseX.value === originReverseX)? isReverseX.value = !originReverseX:'';
    translateBoxLeft.value = originLeft + newValueObj.newWidth  + offsetValue[0];
  }

  if(newValueObj.newHeight > 0) {
    translateBoxHeight.value = newValueObj.newHeight;
    (isReverseY.value !== originReverseY)? isReverseY.value = originReverseY:'';
    translateBoxTop.value = originTop + offsetValue[1];
  }else {
    translateBoxHeight.value = -newValueObj.newHeight;
    (isReverseY.value === originReverseY)? isReverseY.value = !originReverseY:'';
    translateBoxTop.value = originTop + newValueObj.newHeight + offsetValue[1];
  }
}

function moveToRightBottom(e: MouseEvent) {
  const D_point: [number, number] = [centerX + originWidth / 2, centerY];
  const originB_point: [number, number] = [centerX+originWidth/2, centerY+originHeight/2];

  const newValueObj = getCalcNewValue(getC_Point(e, originB_point), D_point, originB_point, true);

  const M2_point: [number, number] = [
    newValueObj.newCenter[0]+newValueObj.newWidth/2, 
    newValueObj.newCenter[1]+newValueObj.newHeight/2
  ];

  setPotionAndShape(newValueObj, M2_point)
}

function moveToRightTop(e: MouseEvent) {
  const D_point: [number, number] = [centerX, centerY - originHeight/2];
  const originB_point: [number, number] = [centerX+originWidth/2, centerY-originHeight/2];

  const newValueObj = getCalcNewValue(getC_Point(e, originB_point), D_point, originB_point, false);

  const M2_point: [number, number] = [
    newValueObj.newCenter[0]+newValueObj.newWidth/2, 
    newValueObj.newCenter[1]-newValueObj.newHeight/2
  ];

  setPotionAndShape(newValueObj, M2_point)
}

function moveToLeftTop(e: MouseEvent) {
  const originB_point: [number, number] = [centerX-originWidth/2, centerY-originHeight/2];
  const D_point: [number, number] = [centerX - originWidth / 2, centerY];

  const newValueObj = getCalcNewValue(getC_Point(e, originB_point), D_point, originB_point, true);

  const M2_point: [number, number] = [
    newValueObj.newCenter[0]-newValueObj.newWidth/2, 
    newValueObj.newCenter[1]-newValueObj.newHeight/2
  ];

  setPotionAndShape(newValueObj, M2_point)
}

function moveToLeftBottom(e: MouseEvent) {
  const D_point: [number, number] = [centerX, centerY+originHeight/2];
  const originB_point: [number, number] = [centerX-originWidth/2, centerY+originHeight/2];

  const newValueObj = getCalcNewValue(getC_Point(e, originB_point), D_point, originB_point, false);

  const M2_point: [number, number] = [
    newValueObj.newCenter[0]-newValueObj.newWidth/2, 
    newValueObj.newCenter[1]+newValueObj.newHeight/2
  ];

  setPotionAndShape(newValueObj, M2_point)
}
// -------------------------对角线缩放end--------------------
