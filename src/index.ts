import find from "./chart/api/find"
import sample from "./chart/api/sample"
import { SRAN_LEVELS } from "./SranLevel"

export const Chart = {
  find,
  sample,
}

export const Constants = {
  LEVELS: [...Array(50).keys()].map(i => i + 1), // 1 to 50, inclusive
  SRAN_LEVELS,
}
