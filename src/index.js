import Phaser from 'phaser'
import BootScene from './scenes/boot'
import PreloadScene from './scenes/preload'
import GameScene from './scenes/game'
import { DPR, gameConfig } from './configs'

let config = {
  type: Phaser.AUTO,
  parent: 'match-three',
  width: gameConfig.width,
  height: gameConfig.height,
  scene: [ BootScene, PreloadScene, GameScene ],
  backgroundColor: 0x000000,
  zoom: 1 / DPR,
  // transparent: true,
  // banner: false
}

new Phaser.Game(config)