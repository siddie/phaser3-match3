import { Utils } from 'phaser'
import { tilesConfig, CHECK_DIRECTION, MIN_MATCHES } from './configs'
import Util from './util'
import Explosion from './explosions'

export default class Desserts {
  scene = null

  // 二维数组
  _dessertsArr = null

  constructor(scene) {
    this.scene = scene

    this._dessertsArr = []

    this.scene.events.on('createDessert', this._setDessert, this)
  }

  /**
   * 初始化数据
   * @param allDesserts 所有甜品对象 一维数组
   */
  initData(allDesserts) {
    let _dessertsArr = this._dessertsArr
    
    for (let i = 0; i < allDesserts.length; i++) {
      let dessert = allDesserts[i]
      let { row, col, x, y } = dessert

      if (!_dessertsArr[row]) {
        _dessertsArr[row] = []
      }

      _dessertsArr[row][col] = dessert
    }
  }
  
  _setDessert(dessert, row, col) {
    let _dessertsArr = this._dessertsArr

    if (!_dessertsArr[row]) {
      _dessertsArr[row] = []
    }

    _dessertsArr[row][col] = dessert
  }

  getDessert(row, col) {
    return this._dessertsArr[row][col]
  }

  /**
   * 已判断fromDessert和toDessert为邻居，尝试交换
   */
  trySwap(fromDessert, toDessert) {
    this._swap(fromDessert, toDessert)
    
    return this._animateSwap(fromDessert, toDessert)
  }

  /**
   * 将甜品数组_dessertsArr里的两个"值"(可能为null)交换
   * 并重新设置甜品对象的row和col属性
   * @param {Dessert | null} fromDessert 
   * @param {Dessert | null} toDessert 
   */
  _swap(fromDessert, toDessert) {
    let { row: fromRow, col: fromCol } = fromDessert
    let { row: toRow, col: toCol } = toDessert
    let _dessertsArr = this._dessertsArr
    
    // swap them in the array
    _dessertsArr[fromRow][fromCol] = toDessert
    _dessertsArr[toRow][toCol] = fromDessert

    // swap their respective properties
    Util.swapRowCol(fromDessert, toDessert)
  }

  undoSwap(fromDessert, toDessert) {
    this._swap(toDessert, fromDessert)
    this.scene.invalidSwapSound.play()
    return this._animateSwap(toDessert, fromDessert)
  }

  _animateSwap(dessert1, dessert2) {
    let tween1 = this.scene.tweens.add({
      targets: dessert2,
      x: dessert1.x,
      y: dessert1.y,
      duration: 200,
      ease: 'Power1'
    })

    let tween2 = this.scene.tweens.add({
      targets: dessert1,
      x: dessert2.x,
      y: dessert2.y,
      duration: 200,
      ease: 'Power1'
    })

    return Promise.all([Util.pifyTween(tween1), Util.pifyTween(tween2)])
  }

  getMatches(dessert, direct) {
    let horizontalMatches = this._getMatchHorizontally(dessert, direct)
    let verticalMatches = this._getMatchVertically(dessert, direct)
    
    let matches = Util.unionSet(horizontalMatches, verticalMatches)

    return matches
  }

  _getMatchHorizontally(dessert, direct) {
    let matchesSet = new Set()
    let { row, col, frameKey } = dessert
    let isBitSet = Util.isBitSet

    let horizontalMatches
    
    if (isBitSet(direct, CHECK_DIRECTION.HORIZONTAL)) {
      horizontalMatches = this.getHorizontalMatches(row, col, -1, 1, frameKey)
    } else if (isBitSet(direct, CHECK_DIRECTION.RIGHT)) {
      horizontalMatches = this.getHorizontalMatches(row, col, 0, 1, frameKey)
    } else if (isBitSet(direct, CHECK_DIRECTION.LEFT)) {
      horizontalMatches = this.getHorizontalMatches(row, col, -1, 0, frameKey)
    }

    Util.addArrToSet(matchesSet, horizontalMatches)

    if (matchesSet.size < MIN_MATCHES - 1) {
      matchesSet.clear()
    } else {
      matchesSet.add(dessert)
    }

    return matchesSet
  }

  _getMatchVertically(dessert, direct) {
    let matchesSet = new Set()
    let { row, col, frameKey } = dessert
    let isBitSet = Util.isBitSet

    let verticalMatches

    if (isBitSet(direct, CHECK_DIRECTION.VERTICAL)) {
      verticalMatches = this.getVerticalMatches(row, col, -1, 1, frameKey)
    } else if (isBitSet(direct, CHECK_DIRECTION.UP)) {
      verticalMatches = this.getVerticalMatches(row, col, -1, 0, frameKey)
    } else if (isBitSet(direct, CHECK_DIRECTION.DOWN)) {
      verticalMatches = this.getVerticalMatches(row, col, 0, 1, frameKey)
    }
    
    Util.addArrToSet(matchesSet, verticalMatches)

    if (matchesSet.size < MIN_MATCHES - 1) {
      matchesSet.clear()
    } else {
      matchesSet.add(dessert)
    }

    return matchesSet
  }
  
  /**
   * 查找横向匹配列表
   * @param {number} row 
   * @param {number} col
   * @param {-1 | 0} startDeltaCol 待检查的相对起列始点 (MIN_MATCHES - 1) 0
   * @param {0 | 1} endDeltaCol    待检查的相对列终点  0 (MIN_MATCHES - 1)
   * @return {Dessert[] | undefined}
   */
  getHorizontalMatches(row, col, startDeltaCol, endDeltaCol, frame) {
    let { colsNumber } = tilesConfig
    let _dessertsArr = this._dessertsArr
    let startCol = col + (MIN_MATCHES - 1) * startDeltaCol
    let endCol = col + (MIN_MATCHES - 1) * endDeltaCol
    
    let matchesList = []

    if (startCol < 0) startCol = 0
    if (endCol >= colsNumber) endCol = colsNumber - 1

    for (let c = col - 1; c >= startCol; c--) {
      let checkDessert = _dessertsArr[row][c]

      if (checkDessert.frameKey !== frame) {
        break
      }

      matchesList.push(checkDessert)
    }

    for (let c = col + 1; c <= endCol; c++) {
      let checkDessert = _dessertsArr[row][c]

      if (checkDessert.frameKey !== frame) {
        break
      }

      matchesList.push(checkDessert)
    }
    
    if (matchesList.length < MIN_MATCHES - 1) {
      return
    }

    return matchesList
  }

  /**
   * 查找纵向匹配列表
   * @param {number} row 
   * @param {number} col
   * @param {-1 | 0} startDeltaRow 待检查的相对行起始点 (MIN_MATCHES - 1) 0
   * @param {0 | 1} endDeltaRow    待检查的相对行终点  0 (MIN_MATCHES - 1)
   * @return {Dessert[] | undefined}
   */
  getVerticalMatches(row, col, startDeltaRow, endDeltaRow, frame) {
    let { rowsNumber } = tilesConfig
    let _dessertsArr = this._dessertsArr
    let startRow = row + (MIN_MATCHES - 1) * startDeltaRow
    let endRow = row + (MIN_MATCHES - 1) * endDeltaRow
    
    let matchesList = []

    if (startRow < 0) startRow = 0
    if (endRow >= rowsNumber) endRow = rowsNumber - 1

    for (let r = row - 1; r >= startRow; r--) {
      let checkDessert = _dessertsArr[r][col]

      if (checkDessert.frameKey !== frame) {
        break
      }

      matchesList.push(checkDessert)
    }

    for (let r = row + 1; r <= endRow; r++) {
      let checkDessert = _dessertsArr[r][col]

      if (checkDessert.frameKey !== frame) {
        break
      }

      matchesList.push(checkDessert)
    }
    
    if (matchesList.length < MIN_MATCHES - 1) {
      return
    }

    return matchesList
  }
  
  // NOTE: 节约时间，空间，这里不用MIN_MATCHES了，直接用"三"消计算
  // 如果写通用的话就在循环中判断需要检查的row, col是否出界
  // 或者做一次横向swap再undoswap, 再做一次纵向swap再undoswap(我觉得不好)
  checkPotentialMatches() {
    let _dessertArr = this._dessertsArr
    let { rowsNumber, colsNumber } = tilesConfig
    let potentialMatches = []

    for (let row = 0; row < rowsNumber; row++) {
      for (let col = 0; col < colsNumber; col++) {
        let matchThree
        // 横向6种情况
        /*  example  *\
         * *  *  * * *
         * &  *  * & *
         & * .&. & * & 
         * &  *  * & *
         * *  *  * * *
        \*  example  */
        matchThree = Util.checkHorizontal1(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        matchThree = Util.checkHorizontal2(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        matchThree = Util.checkHorizontal2(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        // 纵向6种情况
        /* example *\
         * * & * * *
         * & * & * *
         * * & * * *
         * * & * * * 
         * & * & * *
         * * & * * *
        \* example */
        matchThree = Util.checkVertical1(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        matchThree = Util.checkVertical1(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        matchThree = Util.checkVertical1(row, col, _dessertArr)
        if (matchThree !== null) potentialMatches.push(matchThree)

        // 这里3是随便取的
        if (potentialMatches.length >= 3) {
          return Utils.Array.GetRandom(potentialMatches)
        }

        // 相当于是优化，仅仅为了显示一个匹配，不用做无谓的比较了
        if (row >= rowsNumber / 2 && potentialMatches.length > 0) {
          return Utils.Array.GetRandom(potentialMatches)
        }
      }
    }

    return null
  }
  
  /*
   * 将甜品从二维数组中的删除
   * 并做消除动画, 完成后回调
   */
  remove(dessert, callback) {
    let { row, col } = dessert
    this._dessertsArr[row][col] = null
    Explosion.explosionsArr[row][col].playAnim(callback)
  }

  /**
   * 数据上，将下层的null值由上层"坠落"填充
   * @param {*} cols 
   */
  quickCollapse(cols) {
    let { rowsNumber } = tilesConfig
    let _dessertArr = this._dessertsArr

    let collapseInfo = []
    
    // TODO: 怎么感觉这么像排序? 快速排序试试?
    // for (let col in cols) {
    //   col = Number(col)
    //   for (let row = rowsNumber - 1; row >= 0; row--) {
    //     // 当找到一个null元素
    //     if (_dessertArr[row][col] == null) {
    //       // 向上, 找第一个非null
    //       for (let row2 = row - 1; row2 >= 0; row2--) {
    //         if (_dessertArr[row2][col] !== null) {
    //           // 
    //           _dessertArr[row][col] = _dessertArr[row2][col]
    //           _dessertArr[row2][col] = null
    //           _dessertArr[row][col].row = row
    //           _dessertArr[row][col].col = col
    //           collapseInfo.push(_dessertArr[row][col])
    //           break
    //         }
    //       }
    //     }
    //   }
    // }
    
    for (let col in cols) {
      let tmp = []
      for (let row = 0; row < rowsNumber; row++) {
        tmp.push(_dessertArr[row][col])
      }
      this._quickPartition(tmp, _dessertArr, col, collapseInfo)
    }
    
    return collapseInfo
  }

  // x o x o x x o o o
  // |     |   |     |
  // p     u   q     r
  // x表示为null
  // 实际上p...r也代表了行索引
  _quickPartition(arr, dessertArr, col, collapseInfo) {
    let r = arr.length - 1
    let q = r
    
    for (let u = r - 1; u >= 0; u--) {
      if (arr[u] != null && arr[q] == null) {
        dessertArr[q][col] = dessertArr[u][col]
        // 仅行发生变化
        dessertArr[q][col].row = q
        
        dessertArr[u][col] = null
        collapseInfo.push(dessertArr[q][col])

        // arr这边也稍微要处理一下
        arr[q] = arr[u]
        arr[u] = null
        
        q--
      }

      if (arr[u] == null && arr[q] != null) {
        q = u
      }
    }

  }

  /**
   * 消除坠落后，一列元素为null的行数
   * @param {number} col
   */
  getEmptyRowsOnCol(col) {
    let { rowsNumber } = tilesConfig
    let _dessertArr = this._dessertsArr
    let emptyRows = 0

    for (let row = 0; row < rowsNumber; row++) {
      if (_dessertArr[row][col] !== null) {
        break
      }
      emptyRows++
    }

    return emptyRows
  }
}