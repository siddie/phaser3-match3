import Util from './util'

export default class MathesInfo {
  
  matchedSet = new Set()
  
  addArray(arr) {
    if (arr && arr.length) {
      arr.forEach((item) => {
        this.matchedSet.add(item)
      })
    }
  }
}