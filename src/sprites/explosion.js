import { GameObjects, Utils } from 'phaser'
import { tileConfig, tilesConfig } from '../configs'

export default class Explosion extends GameObjects.Sprite {
  completeCallback = null

  animationKeys = [ 'explosionpink', 'explosionred' ]
  
  constructor(gameScene, x, y, textureKey) {
    let { tileWidth, tileHeight } = tileConfig
    let { offsetX, offsetY } = tilesConfig

    // 以0.5 0.5为origin，所以 + tileWidth / 2, + tileHeight / 2   
    super(gameScene, x + offsetX + tileWidth / 2, y + offsetY + tileHeight / 2, textureKey, 'explosionred_04.png')

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
    let animationKey = Utils.Array.GetRandom(this.animationKeys)
    
    this.completeCallback = cb
    this._show()
    this.play(animationKey)
  }
}