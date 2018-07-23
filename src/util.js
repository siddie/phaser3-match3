import { Geom } from 'phaser'
import { tilesConfig, tileConfig, CHECK_DIRECTION } from './configs'

export default class Util {
  /**
   * 二维数组坐标转Point对象(TODO: 目前仅用到x, y)
   * @param {number} row
   * @param {number} col
   */
  static rowColToPoint(row, col, origin = 0) {
    let { tileWidth, tileHeight, tileSpace } = tileConfig
    
    let x = col * tileWidth
    let y = row * tileHeight + row * tileSpace

    if (origin) {
      x += tileWidth * origin
      y += tileHeight * origin
    }

    return new Geom.Point(x, y)
  }

  /**
   * 二维数组坐标转一维数组坐标
   * @param {number} row
   * @param {number} col
   */
  // static rowColToIndex(row, col) {
  //   let { rowsNumber, colsNumber } = tilesConfig
  //   let index = row * colsNumber + col
  //   return index
  // }

  /**
   * 判断两个甜品，是否为邻居(上下一格或左右一格)
   * @param {Dessert} dessert1 
   * @param {Dessert} dessert2
   * @return {boolean} 
   */
  static isNeighbor(dessert1, dessert2) {
    let neighbor = false
    let deltaRow = dessert2.row - dessert1.row
    let deltaCol = dessert2.col - dessert1.col

    if (deltaCol == 0) {
      if (deltaRow == 1 || deltaRow == -1) {
        neighbor = true
      }
    }

    if (deltaRow == 0) {
      if (deltaCol == 1 || deltaCol == -1) {
        neighbor = true
      }
    }

    return neighbor
  }

  /**
   * 根据交换的两个甜品，计算需要检查的方向
   * @param {Dessert} fromDessert 交换前，选择交换的甜品
   * @param {Dessert} toDessert   交换前，被交换的甜品
   */
  static calcCheckDirects(deltaRow, deltaCol) {
    let fromCheckDirect = CHECK_DIRECTION.NONE
    let toCheckDirect = CHECK_DIRECTION.NONE

    // 上下交换
    if (deltaCol == 0) {
      fromCheckDirect |= CHECK_DIRECTION.HORIZONAL
      toCheckDirect |= CHECK_DIRECTION.HORIZONAL

      if (deltaRow == 1) {
        fromCheckDirect |= CHECK_DIRECTION.DOWN
        toCheckDirect |= CHECK_DIRECTION.UP
      } else if (deltaRow == -1) {
        fromCheckDirect |= CHECK_DIRECTION.UP
        toCheckDirect |= CHECK_DIRECTION.DOWN
      }
    }

    // 左右交换
    if (deltaRow == 0) {
      fromCheckDirect |= CHECK_DIRECTION.VERTICAL
      toCheckDirect |= CHECK_DIRECTION.VERTICAL

      if (deltaCol == 1) {
        fromCheckDirect |= CHECK_DIRECTION.LEFT
        toCheckDirect |= CHECK_DIRECTION.RIGHT
      } else if (deltaCol == -1) {
        fromCheckDirect |= CHECK_DIRECTION.RIGHT
        toCheckDirect |= CHECK_DIRECTION.LEFT
      }
    }

    return {
      fromCheckDirect, toCheckDirect
    }
  }

  static swapRowCol(fromDessert, toDessert) {
    let tmp = fromDessert.row
    fromDessert.row = toDessert.row
    toDessert.row = tmp

    tmp = fromDessert.col
    fromDessert.col = toDessert.col
    toDessert.col = tmp
  }

  static pifyTween(tween) {
    return new Promise((resolve) => {
      tween.setCallback('onComplete', () => {
        resolve()
      }, [], null)
    })
  }

  /**
   * 合并两集合或两数组为一个集合
   * @param {Set | Array} set1
   * @param {Set | Array} set2
   */
  static unionSet(set1, set2) {
    // return new Set([...set1, ...set2])
    let unioned = new Set()
    this.addArrToSet(unioned, set1)
    this.addArrToSet(unioned, set2)
    
    return unioned
  }

  /**
   * 将数组元素添加至集合
   * @param {Set} setToAdd 
   * @param {Array | Set | undefined} arr 
   */
  static addArrToSet(setToAdd, arr) {
    if (arr) {
      arr.forEach((item) => {
        setToAdd.add(item)
      })
    }
  }

  /**
   * 某个n的某个bit位是否置1
   */
  static isBitSet(n, mask) {
    if (n & mask) {
      return true
    }
    return false
  }
}