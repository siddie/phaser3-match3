
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
  HORIZONAL: 10,
  VERTICAL: 5,
  ALL: 15
}

// 三消
const MIN_MATCHES = 3

// ...
const Debug = true
const level = {
  
}

export {
  gameConfig,
  tilesConfig,
  tileConfig,
  Debug,
  CHECK_DIRECTION,
  MIN_MATCHES
}

/*
上下交换:
  (在颜色不同的情况下)
  上面的需要查看上两格, 左两格，右两格
  下面的需要查看上两格，左两格，右两格
  
左右交换:


初始状态:
  去除掉能消除的格子，去除掉的格子重新随机，再重复此过程, 直到ok

 */