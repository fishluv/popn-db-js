import { SampleOptions } from "./Database"
import Chart from "../models/Chart"
import { parseDifficulty } from "../models/Difficulty"

const allCharts: Array<
  Record<string, string | string[] | null>
> = require("../../assets/2022061300.json")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNullableNumber = (val: any): number | null => {
  if (val === null) {
    return null
  } else {
    return Number(val)
  }
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

  private recordToChart = (chartRec: typeof allCharts[number]): Chart => {
    return new Chart({
      id: chartRec["id"] as string,
      songId: chartRec["song_id"] as string,
      difficulty: parseDifficulty(chartRec["difficulty"] as string),
      level: Number(chartRec["level"]),
      hasHolds: Number(chartRec["has_holds"]) === 1,
      title: chartRec["title"] as string,
      genre: chartRec["genre"] as string,
      bpm: chartRec["bpm"] as string,
      duration: toNullableNumber(chartRec["duration"]),
      notes: toNullableNumber(chartRec["notes"]),
      rating: toNullableNumber(chartRec["rating"]),
      sranLevel: chartRec["sran_level"] as string,
      songLabels: chartRec["song_labels"] as string[],
      remyWikiPath: chartRec["remywiki_path"] as string,
      hyrorrePath: chartRec["hyrorre_path"] as string,
    })
  }
}
