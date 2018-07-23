import { tilesConfig, CHECK_DIRECTION, MIN_MATCHES } from './configs'
import Util from './util'
import Explosion from './explosions'
import MatchesInfo from './matchesInfo'

export default class Desserts {
  scene = null

  // 二维数组
  _dessertsArr = null
  
  // 甜品的xy位置map
  // 感觉程序很擅长做row, col -> x, y的计算，这里就不存储了
  // _dessertsPosMap = null

  constructor(scene) {
    this.scene = scene

    this._dessertsArr = []
    // this._dessertsPosMap = new Map()

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
    // let matchesInfo = new Set()
    let horizonalMatches = this._getMatchHorizonally(dessert, direct)
    let verticalMatches = this._getMatchVertically(dessert, direct)
    
    let matches = Util.unionSet(horizonalMatches, verticalMatches)

    return matches
  }

  _getMatchHorizonally(dessert, direct) {
    let matchesSet = new Set()
    let isBitSet = Util.isBitSet

    let rightMathces
    let leftMatches

    if (isBitSet(direct, CHECK_DIRECTION.HORIZONAL)) {
      rightMathces = this._getMatchesList(dessert, 0, 1)
      leftMatches = this._getMatchesList(dessert, 0, -1)
    } else if (isBitSet(direct, CHECK_DIRECTION.RIGHT)) {
      rightMathces = this._getMatchesList(dessert, 0, 1)
    } else if (isBitSet(direct, CHECK_DIRECTION.LEFT)) {
      leftMatches = this._getMatchesList(dessert, 0, -1)
    }

    Util.addArrToSet(matchesSet, leftMatches)
    Util.addArrToSet(matchesSet, rightMathces)

    if (!Util.isMeetNum(matchesSet.size)) {
      matchesSet.clear()
    }

    return matchesSet
  }

  _getMatchVertically(dessert, direct) {
    let matchesSet = new Set()
    let isBitSet = Util.isBitSet
    let upMatches
    let downMatches

    if (isBitSet(direct, CHECK_DIRECTION.VERTICAL)) {
      upMatches = this._getMatchesList(dessert, -1, 0)
      downMatches = this._getMatchesList(dessert, 1, 0)
    } else if (isBitSet(direct, CHECK_DIRECTION.UP)) {
      upMatches = this._getMatchesList(dessert, -1, 0)
    } else if (isBitSet(direct, CHECK_DIRECTION.DOWN)) {
      downMatches = this._getMatchesList(dessert, 1, 0)
    }
    
    Util.addArrToSet(matchesSet, upMatches)
    Util.addArrToSet(matchesSet, downMatches)

    if (!Util.isMeetNum(matchesSet.size)) {
      matchesSet.clear()
    }

    return matchesSet
  }

  _getMatchesList(dessert, checkDeltaRow, checkDeltaCol) {
    let _dessertsArr = this._dessertsArr
    let { row, col } = dessert
    let { rowsNumber, colsNumber } = tilesConfig
    let matchesList = []
    
    // 所以这里row, col必须为数字，不能是字符串
    let checkRows = row
    let checkCols = col
    // max
    // let max = checkDeltaRow == 0 ? rowsNumber : rowsNumber
    
    for (let i = 1; i < MIN_MATCHES; i++) {
      let over = true
      checkRows += checkDeltaRow
      checkCols += checkDeltaCol

      if (checkRows >= 0 && checkRows < rowsNumber && checkCols >= 0 && checkCols < colsNumber) {
        let checkDessert = _dessertsArr[checkRows][checkCols]
        if (dessert.isSameDessert(checkDessert)) {
          over = false
          matchesList.push(checkDessert)
        }
      }

      if (over) {
        break
      }
    }

    if (matchesList.length) {
      matchesList.push(dessert)
    }

    return matchesList
  }

  // 左边是否符合消除
  // 上边是否符合消除
  /**
   * 
   * @param {number} row 
   * @param {number} col
   * @param {-1 | 0 | 1} startDeltaRow
   * @param {-1 | 0 | 1} endDeltaRow 
   */
  getRowMatches(row, col, startDeltaRow, endDeltaRow, frame) {
    let { rowsNumber } = tilesConfig
    let _dessertsArr = this._dessertsArr
    let startRow = row + (MIN_MATCHES - 1) * startDeltaRow
    let endRow = row + (MIN_MATCHES - 1) * endDeltaRow
    
    // self
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

  getColMatches(row, col, startDeltaCol, endDeltaCol, frame) {
    let { colsNumber } = tilesConfig
    let _dessertsArr = this._dessertsArr
    let startCol = col + (MIN_MATCHES - 1) * startDeltaCol
    let endCol = col + (MIN_MATCHES - 1) * endDeltaCol
    
    // self
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
  
  /*
   * 将甜品从二维数组中的删除
   * 并做消除动画, 完成后回调
   */
  remove(dessert, callback) {
    let { row, col } = dessert
    this._dessertsArr[row][col] = null
    Explosion.explosionsArr[row][col].playAnim(callback)
  }

  // 
  collapse(cols) {
    let { rowsNumber } = tilesConfig
    let _dessertArr = this._dessertsArr

    let collapseInfo = []
    
    for (let col in cols) {
      col = Number(col)
      // TODO: 怎么感觉这么像排序? 快速排序试试?
      for (let row = rowsNumber - 1; row >= 0; row--) {
        // 当找到一个null元素
        if (_dessertArr[row][col] == null) {
          // 向上, 找第一个非null
          for (let row2 = row - 1; row2 >= 0; row2--) {
            if (_dessertArr[row2][col] !== null) {
              // 
              _dessertArr[row][col] = _dessertArr[row2][col]
              _dessertArr[row2][col] = null

              _dessertArr[row][col].row = row
              _dessertArr[row][col].col = col

              collapseInfo.push(_dessertArr[row][col])

              break
            }
          }
        }
      }
    }

    return collapseInfo
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