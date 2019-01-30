// const DPR = window.devicePixelRatio

const gameConfig = {
  width: 640,
  height: 1136
}

const tilesConfig = {
  rowsNumber: 8,
  colsNumber: 8,
  offsetX: 0,
  offsetY: 100
}

const tileConfig = {
  tileWidth: 64,
  tileHeight: 72,
  tileSpace: 16
}

tilesConfig.offsetX = (gameConfig.width - tilesConfig.rowsNumber * tileConfig.tileWidth) / 2

const CHECK_DIRECTION = {
  NONE: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 4,
  LEFT: 8,
  HORIZONTAL: 10,
  VERTICAL: 5,
  ALL: 15
}

// 三消
const MIN_MATCHES = 3

// Croissant   羊角面包
// Cupcake     纸托蛋糕
// Danish      丹麦蓝乳酪
// Donut       甜甜圈
// Macaroon    杏仁饼(马卡龙)
// SugarCookie 糖果曲奇
// 感觉放到level里更好
const DESSERT_FRAMES = ['Croissant', 'Cupcake', 'Danish', 'Donut', 'Macaroon', 'SugarCookie']

const EXPLOSION_KEYS = ['explosionpink', 'explosionred']

// ...
const Debug = true
const level = {
  
}

export {
  // DPR,
  gameConfig,
  tilesConfig,
  tileConfig,
  Debug,
  CHECK_DIRECTION,
  MIN_MATCHES,
  DESSERT_FRAMES,
  EXPLOSION_KEYS
}