import { GameObjects, Utils } from 'phaser'
import { tileConfig, tilesConfig, EXPLOSION_KEYS } from '../configs'

export default class Explosion extends GameObjects.Sprite {
  row = 0
  col = 0
  completeCallback = null
  
  constructor(gameScene, row, col, x, y, textureKey) {
    let { tileWidth, tileHeight } = tileConfig
    let { offsetX, offsetY } = tilesConfig

    // 以0.5 0.5为origin，所以 + tileWidth / 2, + tileHeight / 2
    super(gameScene, x + offsetX + tileWidth / 2, y + offsetY + tileHeight / 2, textureKey, 'explosionred_04.png')

    this.row = row
    this.col = col

    // 似乎createAnim时，hideOnComplete: true也可以
    this.on('animationcomplete', this._hide, this)
    
    this.visible = false
  }

  _show() {
    this.visible = true
  }

  _hide() {
    this.visible = false
    if (this.completeCallback) {
      let completeCallback = this.completeCallback
      this.completeCallback = null
      completeCallback()
    }
  }
  
  playAnim(cb) {
    let animationKey = Utils.Array.GetRandom(EXPLOSION_KEYS)
    
    this.completeCallback = cb
    this._show()
    this.play(animationKey)
  }
}