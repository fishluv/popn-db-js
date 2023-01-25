import Chart, { ChartConstructorProps } from "../models/Chart"
import { parseDifficulty } from "../models/Difficulty"
import ConditionSet from "./ConditionSet"
import isBuggedBpm from "./isBuggedBpm"
import isHardestDifficultyForSong from "./isHardestDifficultyForSong"
import { SranLevel } from "../models"

const allCharts: Array<ChartConstructorProps> = require("../../assets/2022061300.json")

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNullableNumber(val: any): number | null {
  if (val === null) {
    return null
  } else {
    return Number(val)
  }
}

function isNotBlank(
  x: boolean | number | string | null | undefined,
): x is boolean | number | string {
  return x !== null && x !== undefined && x !== ""
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

export type IncludeOption = "include" | "exclude" | "only"

export interface FilterOptions {
  levelMin?: number
  levelMax?: number
  ratingMin?: number
  ratingMax?: number
  sranLevelMin?: SranLevel
  sranLevelMax?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  hardest?: IncludeOption
  floorInfection?: IncludeOption
  buggedBpms?: IncludeOption
  livelyPacks?: IncludeOption
}

export type SampleOptions = FilterOptions & { count?: number }

export default class Database {
  static findChart = (id: string): Chart | null => {
    const chartRecord = allCharts.find(c => c.id === id)
    if (!chartRecord) {
      return null
    }
    return this.recordToChart(chartRecord)
  }

  static findCharts = (...ids: string[]): Array<Chart | null> => {
    return ids.map(this.findChart)
  }

  static filterCharts = ({
    levelMin = 1,
    levelMax = 50,
    ratingMin = undefined,
    ratingMax = undefined,
    sranLevelMin = undefined,
    sranLevelMax = undefined,
    includeEasy = true,
    includeNormal = true,
    includeHyper = true,
    includeEx = true,
    hardest = "include",
    floorInfection = "include",
    buggedBpms = "include",
    livelyPacks = "include",
  }: FilterOptions = {}): Chart[] => {
    // Only filter by rating if ratingMin or ratingMax is present.
    const shouldFilterRating = isNotBlank(ratingMin) || isNotBlank(ratingMax)
    const normRatingMin = ratingMin ?? -2
    const normRatingMax = ratingMax ?? 2

    // Only filter by sran level if sranLevelMin or sranLevelMax is present.
    const shouldFilterSranLevel =
      isNotBlank(sranLevelMin) || isNotBlank(sranLevelMax)
    const normSranMin = sranLevelMin ?? "01"
    const normSranMax = sranLevelMax ?? "19"

    const filtered = allCharts.filter(
      ({ songId, difficulty, level, bpm, rating, sranLevel, songLabels }) => {
        if (level < levelMin) {
          return false
        }
        if (level > levelMax) {
          return false
        }

        if (shouldFilterRating) {
          if (!isNotBlank(rating)) {
            return false
          }
          if (rating < normRatingMin) {
            return false
          }
          if (rating > normRatingMax) {
            return false
          }
        }

        if (shouldFilterSranLevel) {
          if (!isNotBlank(sranLevel)) {
            return false
          }
          if (sranLevel < normSranMin) {
            return false
          }
          if (sranLevel > normSranMax) {
            return false
          }
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

        if (
          floorInfection === "exclude" &&
          songLabels.includes("floor_infection")
        ) {
          return false
        }
        if (
          floorInfection === "only" &&
          !songLabels.includes("floor_infection")
        ) {
          return false
        }

        if (buggedBpms === "exclude" && isBuggedBpm(bpm)) {
          return false
        }
        if (buggedBpms === "only" && !isBuggedBpm(bpm)) {
          return false
        }

        if (
          livelyPacks === "exclude" &&
          songLabels.some(label => label.includes("_pack_"))
        ) {
          return false
        }
        if (
          livelyPacks === "only" &&
          !songLabels.some(label => label.includes("_pack_"))
        ) {
          return false
        }

        if (
          hardest === "only" &&
          !isHardestDifficultyForSong(parseDifficulty(difficulty), songId)
        ) {
          // Put this last because it's expensive.
          return false
        }

        return true
      },
    )

    return filtered.map(this.recordToChart)
  }

  static sampleFilteredCharts = (
    sampleOptions: SampleOptions = {},
  ): Chart[] => {
    const { count, ...filterOptions } = sampleOptions
    if (!(count && count > 0)) {
      console.error("`count` must be a positive integer")
      return []
    }

    const filtered = this.filterCharts(filterOptions)
    return sampleArray(filtered, count)
  }

  static queryCharts = (query = ""): Chart[] => {
    const conditionSet = ConditionSet.fromQuery(query)
    const matchingRecords = allCharts.filter(chart =>
      conditionSet.isSatisfiedByChart(chart),
    )
    return matchingRecords.map(this.recordToChart)
  }

  static sampleQueriedCharts = ({
    count,
    query,
  }: { count?: number; query?: string } = {}): Chart[] => {
    if (!(count && count > 0)) {
      console.error("`count` must be a positive integer")
      return []
    }
    if (!query) {
      console.error("`query` must be a nonempty string")
      return []
    }

    const queried = this.queryCharts(query)
    return sampleArray(queried, count)
  }

  private static recordToChart = (
    chartRec: typeof allCharts[number],
  ): Chart => {
    return new Chart({
      id: chartRec["id"] as string,
      songId: chartRec["songId"] as string,
      songFolder: chartRec["songFolder"] as string,
      difficulty: chartRec["difficulty"] as string,
      level: Number(chartRec["level"]),
      hasHolds: chartRec["hasHolds"] as boolean,
      title: chartRec["title"] as string,
      genre: chartRec["genre"] as string,
      titleSortChar: chartRec["titleSortChar"] as string,
      genreSortChar: chartRec["genreSortChar"] as string,
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

  private constructor() {}
}
