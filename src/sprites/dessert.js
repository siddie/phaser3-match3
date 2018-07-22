import { GameObjects, Utils } from 'phaser'
import { tileConfig, Debug } from '../configs'

export default class Dessert extends GameObjects.Sprite {
  row = 0
  col = 0
  frameKey = ''
  _highlighted = false
  
  constructor(gameScene, row, col, x, y, textureKey) {
    let { tileWidth, tileHeight } = tileConfig
    // Croissant   羊角面包
    // Cupcake     纸托蛋糕
    // Danish      丹麦蓝乳酪
    // Donut       甜甜圈
    // Macaroon    杏仁饼(马卡龙)
    // SugarCookie 糖果曲奇
    // TODO: config ?
    let frames = ['Croissant', 'Cupcake', 'Danish', 'Donut', 'Macaroon', 'SugarCookie']
    // 也可以使用 Utils.Array.GetRandom(frames)
    let randFrame = Phaser.Math.RND.pick(frames)
    
    // 这里origin为0.5, 感觉在前面做这件事要好点
    super(gameScene, x + tileWidth / 2, y + tileHeight / 2, textureKey, randFrame)

    this.row = row
    this.col = col
    this.frameKey = randFrame

    this.setInteractive()
    this.input.cursor = 'pointer'
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