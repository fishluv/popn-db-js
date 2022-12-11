import Chart from "../models/Chart"
import { SampleOptions } from "./Database"

export default class JsonDatabase {
  private static instance = new this()

  static get get() {
    return this.instance
  }

  private constructor() {}

  findSongLabels = (songId: string): string[] => {
    return []
  }

  findChart = (id: string): Chart | null => {
    return null
  }

  findCharts = (...ids: string[]): Array<Chart | null> => {
    return ids.map(this.findChart)
  }

  sampleCharts = ({
    count,
    levelLowerBound = 1,
    levelUpperBound = 50,
    excludeFloorInfection = false,
    excludeBuggedBpms = false,
    sranLevelLowerBound = "01a",
    sranLevelUpperBound = "19",
    includeEasy = true,
    includeNormal = true,
    includeHyper = true,
    includeEx = true,
    onlyIncludeHardest = false,
    excludeLivelyPacks = false,
  }: SampleOptions = {}): Chart[] => {
    if (!count) {
      console.error("`count` must be a positive integer")
      return []
    }
    // TODO
    if (excludeFloorInfection) {
      console.warn("`excludeFloorInfection` is not supported yet")
    }
    if (excludeBuggedBpms) {
      console.warn("`excludeBuggedBpms` is not supported yet")
    }
    if (onlyIncludeHardest) {
      console.warn("`onlyIncludeHardest` is not supported yet")
    }
    if (excludeLivelyPacks) {
      console.warn("`excludeLivelyPacks` is not supported yet")
    }

    return []
  }
}
