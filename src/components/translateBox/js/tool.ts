/*
 * @Author: Strayer
 * @Date: 2022-12-11
 * @LastEditors: Strayer
 * @LastEditTime: 2022-12-11
 * @Description: 
 * @FilePath: \translateBox\src\components\translateBox\js\tool.ts
 */
export const Tool = {
  getAngleOfThreePoint,
  GetWebMercatorLen,
  createLatLngOfRotate,
  DeepClone
}

/**
 * @description: 把坐标旋转固定角度后生成新坐标
 */
function createLatLngOfRotate (param: {
  latLng: [number, number],
  center: [number, number],
  rotateNum: number
}
): [number, number] {
// 1.求点到中心点的直线距离
const r = Math.sqrt(Math.pow(param.latLng[0] - param.center[0], 2) +  Math.pow(param.latLng[1] - param.center[1], 2))
// 2.求点到x之间的角度
let rotateValue = Math.atan2(param.latLng[1]-param.center[1], param.latLng[0]-param.center[0])/(2*Math.acos(-1))*360;
// 3.减去旋转的角度 再整体转为弧度
rotateValue = (rotateValue - param.rotateNum)*Math.PI/180;
// 4.根据中心的坐标、弧度、半径计算出新的坐标
return [param.center[0]+r*Math.cos(rotateValue), param.center[1]+r*Math.sin(rotateValue)]
}

/**
 * @description: 根据坐标计算坐标长度
 * @param {array} shape 坐标
 * @return { number } 长度
 */
function GetWebMercatorLen(shape: [number, number] []): number {
  let resultLen = 0;
  for(let i = 0; i < shape.length -1; i++) {
    const itemLen = Math.sqrt(Math.pow(shape[i+1][0] - shape[i][0], 2) + Math.pow(shape[i+1][1] - shape[i][1], 2));
    resultLen += itemLen
  }
  return resultLen
}

/**
 * @description: 求一个点伸出的两条线的夹角(带正负)
 * @param {*} centerA 中心点坐标
 * @param {*} pointB 旋转起点末端坐标
 * @param {*} pointC 旋转终点末端坐标
 * @param {*} isRadian 是否要弧度值(默认拿角度值)
 * @return {*} 返回旋转角度(带正负)
 */
function getAngleOfThreePoint(
  centerA: [number, number], 
  pointB: [number, number], 
  pointC: [number, number],
  isRadian?: boolean
): number  {
  // 0.根据向量法求出旋转方向
  let AB = [0, 0];
  let AC = [0, 0];
  AB[0] = (pointB[0] - centerA[0]);
  AB[1] = (pointB[1] - centerA[1]);
  AC[0] = (pointC[0] - centerA[0]);
  AC[1] = (pointC[1] - centerA[1]); // 分别求出AB,AC的向量坐标表示
  let direct = (AB[0] * AC[1]) - (AB[1] * AC[0]); // AB与AC叉乘求出逆时针还是顺时针旋转

  // 1.先算出三条边的长度
  // 2.利用两点坐标求直线公式算出AB,AC,BC线段的长度
  let lengthAB = Math.sqrt(Math.pow(centerA[0] - pointB[0], 2) + Math.pow(centerA[1] - pointB[1], 2));
  let lengthAC = Math.sqrt(Math.pow(centerA[0] - pointC[0], 2) + Math.pow(centerA[1] - pointC[1], 2));
  let lengthBC = Math.sqrt(Math.pow(pointB[0] - pointC[0], 2) + Math.pow(pointB[1] - pointC[1], 2));

  // 3.已知三角形的三边长，求cos值的公式：cos A=(b²+c²-a²)/2bc
  let cosA = (Math.pow(lengthAB, 2) + Math.pow(lengthAC, 2) - Math.pow(lengthBC, 2)) / (2 * lengthAB * lengthAC); //   余弦定理求出旋转角

  // 4.在根据公式,转换成度数
  const angle = isRadian? Math.acos(cosA) : Math.acos(cosA) * 180 / Math.PI;
  
  return direct < 0? -angle:angle;
}

/**
 * @description: 深复制对象或数组
 * @return {any}
 */
export function DeepClone<T>(data: T): T {
  const type = JudgeType(data);
  let obj;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === 'array') {
    
    // eslint-disable-next-line
    for (let i = 0, len = (data as any).length; i < len; i++) {
      (obj as Array<any>).push(DeepClone((data as any)[i]));
    }
  } else if (type === 'object') {
    // 对原型上的方法也拷贝了....
    for (const key in data) {
      (obj as any)[key] = DeepClone(data[key]);
    }
  }
  return (obj as T);
}

export type dataType = 'boolean'|'number'|'string'|'function'|'array'|'date'|'regExp'|'undefined'|'null'|'object'|'element'

/**
 * @description: 判断对象类型
 * @return {String}
 */
// eslint-disable-next-line 
export function JudgeType(obj: any): dataType {
  // tosString会返回对应不同的标签的构造函数
  const toString = Object.prototype.toString;
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return (map as any)[toString.call(obj)];
}