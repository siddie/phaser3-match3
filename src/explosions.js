
const Explosions = {
  // 二维数组
  explosionsArr: [],
  
  /**
   * @param {Explosion[]} allExplosions 所有消除精灵 一维数组
   */
  initData(allExplosions) {
    let explosionsArr = this.explosionsArr

    for (let i = 0; i < allExplosions.length; i++) {
      let explosionSprite = allExplosions[i]
      let { row, col } = explosionSprite
      if (!explosionsArr[row]) {
        explosionsArr[row] = explosionSprite
      }

      explosionsArr[row][col] = explosionSprite
    }
  }
}

export default Explosions