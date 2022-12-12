import { FilterOptions, SampleOptions } from "./Database"
import Chart, { ChartConstructorProps } from "../models/Chart"
import Difficulty, { parseDifficulty } from "../models/Difficulty"

const allCharts: Array<ChartConstructorProps> = require("../../assets/2022061300.json")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNullableNumber(val: any): number | null {
  if (val === null) {
    return null
  } else {
    return Number(val)
  }
}

function isBuggedBpm(bpmStr: string | null): boolean {
  if (bpmStr === null) {
    return false
  }

  const bpms = bpmStr.match(/\d+/g) || []
  const bpmNums = bpms.map(Number)
  return bpmNums.some(bpm => {
    const dividend = 3600 / bpm
    return dividend === Math.floor(dividend)
  })
}

function isHardestDifficultyForSong(
  difficulty: Difficulty,
  songId: string,
): boolean {
  const hardestDiff = allCharts
    .filter(c => c.songId === songId)
    .map(c => c.difficulty)
    .sort((a, b) => {
      const diffsOrdered = ["ex", "h", "n", "e"]
      return diffsOrdered.indexOf(a) - diffsOrdered.indexOf(b)
    })[0]
  return difficulty === hardestDiff
}

function sampleArray<T>(arr: Array<T>, count: number) {
  const shuffled = arr.slice()

  // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled.slice(0, count)
}

export default class JsonDatabase {
  private static instance = new this()

  static get get() {
    return this.instance
  }

  private constructor() {}

  findChart = (id: string): Chart | null => {
    const chartRecord = allCharts.find(c => c.id === id)
    if (!chartRecord) {
      return null
    }
    return this.recordToChart(chartRecord)
  }

  findCharts = (...ids: string[]): Array<Chart | null> => {
    return ids.map(this.findChart)
  }

  filterCharts = ({
    levelLowerBound = 1,
    levelUpperBound = 50,
    excludeFloorInfection = false,
    excludeBuggedBpms = false,
    sranLevelLowerBound = null,
    sranLevelUpperBound = null,
    includeEasy = true,
    includeNormal = true,
    includeHyper = true,
    includeEx = true,
    onlyIncludeHardest = false,
    excludeLivelyPacks = false,
  }: FilterOptions = {}): Chart[] => {
    // TODO
    if (excludeLivelyPacks) {
      console.warn("`excludeLivelyPacks` is not supported yet")
    }

    // lower and upper both null:     [00, 19] (include charts without sran levels)
    // lower null, upper present:     [01,  u] (do not include charts without sran levels)
    // lower present, upper null:     [ l, 19] (do not include charts without sran levels)
    // lower and upper both present:  [ l,  u] (do not include charts without sran levels)
    const normSranLower =
      sranLevelLowerBound ?? (sranLevelUpperBound === null ? "00" : "01")
    const normSranUpper = sranLevelUpperBound ?? "19"

    const filtered = allCharts.filter(
      ({ songId, difficulty, level, bpm, sranLevel, songLabels }) => {
        if (level < levelLowerBound) {
          return false
        }
        if (level > levelUpperBound) {
          return false
        }

        if (excludeFloorInfection && songLabels.includes("floor_infection")) {
          return false
        }
        if (excludeBuggedBpms && isBuggedBpm(bpm)) {
          return false
        }

        const normSranLevel = sranLevel ?? "00"
        if (normSranLevel < normSranLower) {
          return false
        }
        if (normSranLevel > normSranUpper) {
          return false
        }

        if (!includeEasy && difficulty === "e") {
          return false
        }
        if (!includeNormal && difficulty === "n") {
          return false
        }
        if (!includeHyper && difficulty === "h") {
          return false
        }
        if (!includeEx && difficulty === "ex") {
          return false
        }

        // Put this last because it's expensive.
        if (
          onlyIncludeHardest &&
          !isHardestDifficultyForSong(difficulty, songId)
        ) {
          return false
        }

        return true
      },
    )

    return filtered.map(this.recordToChart)
  }

  sampleCharts = (sampleOptions: SampleOptions = {}): Chart[] => {
    const { count, ...filterOptions } = sampleOptions
    if (!(count && count > 0)) {
      console.error("`count` must be a positive integer")
      return []
    }

    const filtered = this.filterCharts(filterOptions)
    return sampleArray(filtered, count)
  }

  private recordToChart = (chartRec: typeof allCharts[number]): Chart => {
    return new Chart({
      id: chartRec["id"] as string,
      songId: chartRec["songId"] as string,
      difficulty: parseDifficulty(chartRec["difficulty"] as string),
      level: Number(chartRec["level"]),
      hasHolds: chartRec["hasHolds"] as boolean,
      title: chartRec["title"] as string,
      genre: chartRec["genre"] as string,
      bpm: chartRec["bpm"] as string,
      duration: toNullableNumber(chartRec["duration"]),
      notes: toNullableNumber(chartRec["notes"]),
      rating: toNullableNumber(chartRec["rating"]),
      sranLevel: chartRec["sranLevel"] as string | null,
      songLabels: chartRec["songLabels"] as string[],
      remyWikiPath: chartRec["remyWikiPath"] as string,
      hyrorrePath: chartRec["hyrorrePath"] as string | null,
    })
  }
}
