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
      fromCheckDirect |= CHECK_DIRECTION.HORIZONTAL
      toCheckDirect |= CHECK_DIRECTION.HORIZONTAL

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
   * 合并集合或数组为一个集合
   * @param {(Set | Array | undefined)[]} setArr  TODO: 感觉typescript这样写有问题...
   */
  static unionSet(...setArr) {
    // return new Set([...set1, ...set2])
    let unioned = new Set()

    setArr.forEach((setItem) => {
      this.addArrToSet(unioned, setItem)
    })

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

  static checkHorizontal1(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig

    if (col <= colsNumber - 2) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row][col + 1])) {
        /*  example  *\
         * *  *  * * *
         * *  *  * * *
         * * .&. & * * 
         * &  *  * * *
         * *  *  * * *
        \*  example  */
        if (row <= rowsNumber - 2 && col >= 1) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row + 1][col - 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row][col + 1],
              dessertsArr[row + 1][col - 1]
            ]
          }
        }

        /*  example  *\
         * *  *  * * *
         * &  *  * * *
         * * .&. & * * 
         * *  *  * * *
         * *  *  * * *
        \*  example  */
        if (row >= 1 && col >= 1) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col - 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row][col + 1],
              dessertsArr[row - 1][col - 1]
            ]
          }
        }
      }
    }

    return null
  }

  static checkHorizontal2(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig

    if (col <= colsNumber - 3) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row][col + 1])) {
        /*  example  *\
         * *  *  * * *
         * *  *  * * *
         * * .&. & * * 
         * *  *  * & *
         * *  *  * * *
        \*  example  */
        if (row <= rowsNumber - 2 && col <= colsNumber - 3) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row + 1][col + 2])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row][col + 1],
              dessertsArr[row + 1][col + 2]
            ]
          }
        }

        /*  example  *\
         * *  *  * * *
         * *  *  * & *
         * * .&. & * * 
         * *  *  * * *
         * *  *  * * *
        \*  example  */
        if (row >= 1 && col <= colsNumber - 3) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col + 2])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row][col + 1],
              dessertsArr[row - 1][col + 2]
            ]
          }
        }
      }
    }

    return null
  }

  static checkHorizontal3(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig
   /*  example  *\
    * *  *  * * *
    * *  *  * * *
    * * .&. & * & 
    * *  *  * * *
    * *  *  * * *
   \*  example  */
    if (col <= colsNumber - 4) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row][col + 1]) && dessertsArr[row][col].isSameDessert(dessertsArr[row][col + 3])) {
        return [
          dessertsArr[row][col],
          dessertsArr[row][col + 1],
          dessertsArr[row][col + 3]
        ]
      }
    }
   /*  example  *\
    * *  *  * * *
    * *  *  * * *
    & * .&. & * *
    * *  *  * * *
    * *  *  * * *
   \*  example  */
    if (col >= 2 && col <= colsNumber - 2) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row][col + 1]) && dessertsArr[row][col].isSameDessert(dessertsArr[row][col - 2])) {
        return [
          dessertsArr[row][col],
          dessertsArr[row][col + 1],
          dessertsArr[row][col - 2]
        ]
      }
    }

    return null
  }


  static checkVertical1(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig

    if (row >= 1) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col])) {
        /* example *\
        * *  *  * * *
        * *  *  * * *
        * *  &  * * *
        * * .&. * * *
        * &  *  * * *
        * *  *  * * *
        \* example */
        if (row <= row - 2 && col >= 1) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row + 1][col - 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row - 1][col],
              dessertsArr[row + 1][col - 1]
            ]
          }
        }
        /* example *\
        * *  *  * * *
        * *  *  * * *
        * *  &  * * *
        * * .&. * * *
        * *  *  & * *
        * *  *  * * *
        \* example */
        if (row <= row - 2 && col <= colsNumber - 2) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row + 1][col + 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row - 1][col],
              dessertsArr[row + 1][col + 1]
            ]
          }
        }
      }
    }

    return null
  }

  static checkVertical2(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig

    if (row >= 2) {
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col])) {
        /* example *\
        * *  *  * * *
        * &  *  * * *
        * *  &  * * *
        * * .&. * * *
        * *  *  * * *
        * *  *  * * *
        \* example */
        if (col >= 1) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 2][col - 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row - 1][col],
              dessertsArr[row - 2][col - 1]
            ]
          }
        }

        /* example *\
        * *  *  * * *
        * *  *  & * *
        * *  &  * * *
        * * .&. * * *
        * *  *  * * *
        * *  *  * * *
        \* example */
        if (col <= colsNumber - 2) {
          if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 2][col + 1])) {
            return [
              dessertsArr[row][col],
              dessertsArr[row - 1][col],
              dessertsArr[row - 2][col + 1]
            ]
          }
        }
      }
    }

    return null
  }

  static checkVertical3(row, col, dessertsArr) {
    const { rowsNumber, colsNumber } = tilesConfig

    if (row >= 3) {
      /* example *\
       * *  &  * * *
       * *  *  * * *
       * *  &  * * *
       * * .&. * * *
       * *  *  * * *
       * *  *  * * *
      \* example */  
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col]) && dessertsArr[row][col].isSameDessert(dessertsArr[row - 3][col])) {
        return [
          dessertsArr[row][col],
          dessertsArr[row - 1][col],
          dessertsArr[row - 3][col]
        ]
      }
    }

    if (row >= 1 && row <= rowsNumber - 3) {
      /* example *\
       * *  *  * * *
       * *  *  * * *
       * *  &  * * *
       * * .&. * * *
       * *  *  * * *
       * *  &  * * *
      \* example */ 
      if (dessertsArr[row][col].isSameDessert(dessertsArr[row - 1][col]) && dessertsArr[row][col].isSameDessert(dessertsArr[row + 2][col])) {
        return [
          dessertsArr[row][col],
          dessertsArr[row - 1][col],
          dessertsArr[row + 2][col]
        ]
      }
    }

    return null
  }
}