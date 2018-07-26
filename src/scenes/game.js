import { GameObjects, Geom, Scene, Utils } from 'phaser'
import { tilesConfig, tileConfig, DESSERT_FRAMES, MIN_MATCHES, CHECK_DIRECTION } from '../configs'
import Dessert from '../sprites/dessert'
import Explosion from '../sprites/explosion'
import Explosions from '../explosions'
import Desserts from '../desserts'
import Util from '../util'
import pify from 'ts-pify'

export default class GameScene extends Scene {
  _width
  _height
  // Phaser.GameObjects.Container对象
  _dessertContainer = null

  // Desserts实例对象
  _desserts = null

  // TODO: 换个属性，row col好像没用
  _swipeFromRow = null
  _swipeFromCol = null
  // 选中的甜品对象
  selectionDessert = null

  // 每列新甜品的初始位置Map
  _newDessertPositions = null

  constructor() {
    super({ key: 'Game' })
  }
  
  init() {
    let config = this.sys.game.config
    this._width = config.width
    this._height = config.height
    this._desserts = new Desserts(this)
    this._newDessertPositions = new Map()

    this.bgSound = this.sound.add('bgMusic')
    this.swapSound = this.sound.add('swapSound')
    this.matchSound = this.sound.add('matchSound')
    this.invalidSwapSound = this.sound.add('invalidSwapSound')
  }

  create() {
    this.add.image(this._width / 2, this._height / 2, 'background')

    this._setupPositions()
    this._initTiles()
    this._initDesserts()

    this._checkPotentialMatches()
    
    // 默认就是ture, 社不设置无所谓
    this.input.topOnly = true
    this.input.on('pointerdown', this._onPointerDown, this)
    this.input.on('pointermove', this._onPointerMove, this)
    this.input.on('pointerup', this._onPointerUp, this)

    // this.bgSound.play()
  }

  _setupPositions() {
    let { colsNumber, offsetX, offsetY } = tilesConfig
    let _newDessertPositions = this._newDessertPositions

    for (let col = 0; col < colsNumber; col++) {
      let point = Util.rowColToPoint(-1, col)
      _newDessertPositions.set(col, point)
    }
  }

  // 初始化甜品瓦片
  _initTiles() {
    let { rowsNumber, colsNumber, offsetX, offsetY } = tilesConfig
    
    let tilesContainer = this.add.container(offsetX, offsetY)
    let explosionGroup = this.add.group() 
    
    for (let row = 0; row < rowsNumber; row++) {
      for (let col = 0; col < colsNumber; col++) {
        let point = Util.rowColToPoint(row, col)

        let tile = this.add.image(point.x, point.y, 'desserts', 'Tile')
        tile.setOrigin(0, 0)

        let explosionSprite = new Explosion(this, row, col, point.x, point.y, 'explosion')
        
        tilesContainer.add(tile)
        explosionGroup.add(explosionSprite, true)
      }
    }

    Explosions.initData(explosionGroup.getChildren())
  }
  
  _initDesserts() {
    let { rowsNumber, colsNumber, offsetX, offsetY } = tilesConfig

    let _desserts = this._desserts
    // NOTE: 在一个container中 setDepth似乎无效。 group倒是可以
    // swap的情况不会有tile遮住dessert的情况
    let _dessertContainer = this._dessertContainer = this.add.container(offsetX, offsetY)

    for (let row = 0; row < rowsNumber; row++) {
      for (let col = 0; col < colsNumber; col++) {
        let point = Util.rowColToPoint(row, col)
        let frame = Utils.Array.GetRandom(DESSERT_FRAMES)
        
        while (col >= MIN_MATCHES - 1 && _desserts.getHorizontalMatches(row, col, -1, 0, frame) || row >= MIN_MATCHES - 1 && _desserts.getVerticalMatches(row, col, -1, 0, frame)) {
          frame = Utils.Array.GetRandom(DESSERT_FRAMES)
        }

        let dessert = new Dessert(this, row, col, point.x, point.y, 'desserts', frame)
        _dessertContainer.add(dessert)
      }
    }
  }
  
  // 
  _checkPotentialMatches() {
    setTimeout(() => {
      let potentialMatches = this._desserts.checkPotentialMatches()
      if (potentialMatches) {
        this.tweens.add({
          targets: potentialMatches,
          alpha: 0.3,
          yoyo: true,
          repeat: 3,
          duration: 800
        })
      }
    }, 1000)
  }

  _onPointerDown(pointer, currentlyOver) {
    let dessert = currentlyOver[0]
    
    if (dessert) {
      this._swipeFromRow = dessert.row
      this._swipeFromCol = dessert.col
      
      dessert.addHighLighted()

      this.selectionDessert = dessert
    }
  }
  
  _onPointerMove(pointer, currentlyOver) {
    if (this._swipeFromRow === null) return
    
    if (currentlyOver.length) {
      // 直接交换
      let toDessert = currentlyOver[0]

      let isNeighbor = Util.isNeighbor(this.selectionDessert, toDessert)

      if (isNeighbor) {
        this._trySwap(this.selectionDessert, toDessert)
        this.selectionDessert.removeHighLighted()
      }
    }
  }

  _onPointerUp(pointer, dessert) {
    this._swipeFromRow = null
    this._swipeFromCol = null
    if (this.selectionDessert) {
      this.selectionDessert.removeHighLighted()
    }
    this.selectionDessert = null
  }

  _trySwap(fromDessert, toDessert) {
    this._swipeFromRow = null
    this._swipeFromCol = null

    this.swapSound.play()

    let _desserts = this._desserts
    
    _desserts.trySwap(fromDessert, toDessert).then(() => {
      // NOTE: fromDessert, toDessert位置已交换, 原先的fromDessert变为toDessert
      let { fromCheckDirect, toCheckDirect } = Util.calcCheckDirects(fromDessert.row - toDessert.row, fromDessert.col - toDessert.col)
      
      // 交换两相同甜品直接undo
      if (!fromDessert.isSameDessert(toDessert)) {

        // NOTE: fromDessert, toDessert已交换
        let fromDessertMatches = _desserts.getMatches(fromDessert, fromCheckDirect)
        let toDessertMatches = _desserts.getMatches(toDessert, toCheckDirect)
        
        let totalMatches = Util.unionSet(fromDessertMatches, toDessertMatches)
        
        if (totalMatches.size !== 0) {
          return this._removeMatchDesserts(totalMatches)
        }
      }

      return this._undoSwap(fromDessert, toDessert)
    }).then((res) => {
      if (res.act == 'remove') {
        this._chainMatch(res.removedCols)
      }
    })
  }

  _chainMatch(removedCols) {
    let _desserts = this._desserts

    // collapse
    let collapseArr = _desserts.collapse(removedCols)
    
    // create new dessert
    let newDessertsArr = this._createNewDesserts(removedCols)

    let needCheckDesserts = collapseArr.concat(newDessertsArr)
    
    // drop
    this._dropAnim(needCheckDesserts).then(() => {
      let matchesList = []
      needCheckDesserts.forEach((dessert) => {
        let matches = _desserts.getMatches(dessert, CHECK_DIRECTION.HORIZONTAL | CHECK_DIRECTION.DOWN)
        matchesList.push(matches)
      })
      return this._unionAndRemove(matchesList)
    }).then((res) => {
      if (res && res.act == 'remove') {
        this._chainMatch(res.removedCols)
      }
    })
  }

  /**
   * 
   * @param {(Set | Array | undefined)[]} setArr
   */
  _unionAndRemove(matchesList) {
    // NOTE: 空的Set这里也直接 union了
    let totalMatches = Util.unionSet(...matchesList)

    // 由于getMatches时已判断三消的最小数量，所以这里判断不为0即可
    if (totalMatches.size !== 0) {
      return this._removeMatchDesserts(totalMatches)
    }
  }

  /**
   * 
   * @param {Set} totalMatches 
   */
  _removeMatchDesserts(totalMatches) {
    let _desserts = this._desserts
    let _dessertContainer = this._dessertContainer
    let pifyOpts = { errorFirst: false, context: this._desserts }
    let removePromises = []
    // TODO: 
    let cols = {}

    for (let matchDessert of totalMatches) {
      cols[matchDessert.col] = true

      let p = pify(_desserts.remove, pifyOpts)(matchDessert)
      removePromises.push(p)

      // 其实也可以, container监听了gameobject的'destroy'事件
      // matchDessert.destroy()
      _dessertContainer.remove(matchDessert, true)
    }
    
    this.matchSound.play()

    return Promise.all(removePromises).then(() => {
      return {
        act: 'remove',
        removedCols: cols
      }
    })
  }

  _undoSwap(fromDessert, toDessert) {
    return this._desserts.undoSwap(fromDessert, toDessert).then(() => {
      return {
        act: 'undo'
      }
    })
  }

  /**
   * 甜品下落
   * @param {Dessert[]} movedDesserts 
   */
  _dropAnim(movedDesserts) {
    let dropPromises = []

    for (let i = 0; i < movedDesserts.length; i++) {
      let dessert = movedDesserts[i]
      let { row, col } = dessert
      
      let point = Util.rowColToPoint(row, col, 0.5)
      
      let tween = this.tweens.add({
        targets: dessert,
        y: point.y,
        duration: 300
      })

      dropPromises.push(Util.pifyTween(tween))
    }

    return Promise.all(dropPromises)
  }

  _createNewDesserts(cols) {
    let newDessertsInfo = []
    let _desserts = this._desserts
    let _newDessertPositions = this._newDessertPositions
    
    for (let col in cols) {
      col = Number(col)
      let emptyRows = _desserts.getEmptyRowsOnCol(col)
      for (let row = emptyRows - 1; row >= 0; row--) {
        let point = _newDessertPositions.get(col)
        
        let newDessert = new Dessert(this, row, col, point.x, point.y, 'desserts')
        this._dessertContainer.add(newDessert)
        newDessertsInfo.push(newDessert)
      }
    }
    
    return newDessertsInfo
  }
}