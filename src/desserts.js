import { tilesConfig, CHECK_DIRECTION, MIN_MATCHES } from './configs'
import Util from './util'
import MathesInfo from './matchesInfo'

export default class Desserts {
  scene = null

  // 二维数组
  _dessertsArr = null
  
  // 二维数组
  _explosionsArr = null

  // 甜品的xy位置map
  // 感觉程序很擅长做row, col -> x, y的计算，这里就不存储了
  // _dessertsPosMap = null

  constructor(scene) {
    this.scene = scene

    this._dessertsArr = []
    this._explosionsArr = []
    // this._dessertsPosMap = new Map()
  }

  /**
   * 初始化数据
   * @param allDesserts 所有甜品对象 一维数组
   * @param allExplosions 所有消除精灵 一维数组
   */
  initData(allDesserts, allExplosions) {
    let _dessertsArr = this._dessertsArr
    let _explosionsArr = this._explosionsArr
    // let _dessertsPosMap = this._dessertsPosMap

    for (let i = 0; i < allDesserts.length; i++) {
      let dessert = allDesserts[i]
      let explosion = allExplosions[i]
      let { row, col, x, y } = dessert

      if (!_dessertsArr[row]) {
        _dessertsArr[row] = []
        _explosionsArr[row] = []
      }

      _dessertsArr[row][col] = dessert
      _explosionsArr[row][col] = explosion
      // _dessertsPosMap.set(`${row}${col}`, { x, y })
    }
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
    let matchesList = [ dessert ]
    
    let checkRows = row
    let checkCols = col
    // max
    // let max = checkDeltaRow == 0 ? rowsNumber : rowsNumber

    for (let i = 1; i < MIN_MATCHES; i++) {
      checkRows += checkDeltaRow
      checkCols += checkDeltaCol

      if (checkRows >= 0 && checkRows < rowsNumber && checkCols >= 0 && checkCols < colsNumber) {
        let checkDessert = _dessertsArr[checkRows][checkCols]
        if (dessert.isSameDessert(checkDessert)) {
          matchesList.push(checkDessert)
        } else {
          break
        }
      }
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
    this._explosionsArr[row][col].playAnim(callback)
  }

  // 
  collapse(cols) {
    let { rowsNumber } = tilesConfig
    let _dessertArr = this._dessertsArr

    let collapseInfo = []
    
    for (let col in cols) {
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

  getEmptyItemsOnCol(col) {

  }
}