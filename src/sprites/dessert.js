import { GameObjects, Utils } from 'phaser'
import { tileConfig, DESSERT_FRAMES, Debug } from '../configs'

export default class Dessert extends GameObjects.Sprite {
  row = 0
  col = 0
  frameKey = ''
  _highlighted = false
  
  constructor(gameScene, row, col, x, y, textureKey, frame) {
    let { tileWidth, tileHeight } = tileConfig
    
    if (!frame) {
      // Phaser.Math.RND.pick(DESSERT_FRAMES)
      frame = Utils.Array.GetRandom(DESSERT_FRAMES)
    }
    
    // 这里origin为0.5, 感觉在前面做这件事要好点
    super(gameScene, x + tileWidth / 2, y + tileHeight / 2, textureKey, frame)

    this.row = row
    this.col = col
    this.frameKey = frame

    this.setInteractive()
    this.input.cursor = 'pointer'
    
    gameScene.events.emit('createDessert', this, row, col)
  }
  
  isSameDessert(otherDessert) {
    return this.frameKey === otherDessert.frameKey
  }

  addHighLighted() {
    // this.frame.name
    this.setFrame(this.frameKey + '-Highlighted')
  }
  
  removeHighLighted() {
    // this.frame.name.replace('-Highlighted', '')
    this.setFrame(this.frameKey)
  }
}