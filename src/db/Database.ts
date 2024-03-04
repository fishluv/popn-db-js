import Chart, { ChartConstructorProps } from "../models/Chart"
import Difficulty, { parseDifficulty } from "../models/Difficulty"
import SranLevel from "../models/SranLevel"
import ConditionSet, { IdentifierCondition } from "./ConditionSet"
import hasBpmChanges from "./hasBpmChanges"
import isBuggedBpm from "./isBuggedBpm"
import isHardestDifficultyForSong from "./isHardestDifficultyForSong"

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
  bpmChanges?: IncludeOption
  livelyPacks?: IncludeOption
}

export type SampleOptions = FilterOptions & { count?: number }

class Database {
  private readonly allCharts: Array<ChartConstructorProps>
  private readonly datecode: string

  constructor(allCharts: Array<ChartConstructorProps>, datecode: string) {
    this.allCharts = allCharts
    this.datecode = datecode
  }

  findChart = (id: string): Chart | null => {
    const chartRecord = this.allCharts.find(c => c.id === id)
    if (!chartRecord) {
      return null
    }
    return Database.recordToChart(chartRecord)
  }

  findCharts = (...ids: string[]): Array<Chart | null> => {
    return ids.map(this.findChart)
  }

  findChartBySongSlug = (
    songSlug: string,
    difficulty: Difficulty,
  ): Chart | null => {
    const chartRecord = this.allCharts.find(
      c => c.songSlug === songSlug && c.difficulty === difficulty,
    )
    if (!chartRecord) {
      return null
    }
    return Database.recordToChart(chartRecord)
  }

  filterCharts = ({
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
    bpmChanges = "include",
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

    const filtered = this.allCharts.filter(
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

        if (bpmChanges === "exclude" && hasBpmChanges(bpm)) {
          return false
        }
        if (bpmChanges === "only" && !hasBpmChanges(bpm)) {
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

        // TODO: Support hardest=exclude?
        if (
          hardest === "only" &&
          !isHardestDifficultyForSong(
            parseDifficulty(difficulty),
            songId,
            this.allCharts,
          )
        ) {
          // Put this last because it's expensive.
          return false
        }

        return true
      },
    )

    return filtered.map(Database.recordToChart)
  }

  sampleFilteredCharts = (sampleOptions: SampleOptions = {}): Chart[] => {
    const { count, ...filterOptions } = sampleOptions
    if (!(count && count > 0)) {
      console.error("`count` must be a positive integer")
      return []
    }

    const filtered = this.filterCharts(filterOptions)
    return sampleArray(filtered, count)
  }

  queryCharts = (query = ""): Chart[] => {
    const conditionSet = ConditionSet.fromQuery(query)

    // Default to -omnimix.
    const hasOmni = conditionSet.conditions.some(
      cond =>
        cond.type === "identifier" &&
        ["omnimix", "+omnimix"].includes((cond as IdentifierCondition).value),
    )
    if (!hasOmni) {
      conditionSet.conditions.push(new IdentifierCondition("-omnimix"))
    }

    // Default to -lively.
    const hasLively = conditionSet.conditions.some(
      cond =>
        cond.type === "identifier" &&
        ["lively", "+lively"].includes((cond as IdentifierCondition).value),
    )
    if (!hasLively) {
      conditionSet.conditions.push(new IdentifierCondition("-lively"))
    }

    const matchingRecords = this.allCharts.filter(chart =>
      conditionSet.isSatisfiedByChart(chart, this.allCharts),
    )
    return matchingRecords.map(Database.recordToChart)
  }

  sampleQueriedCharts = ({
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

  private static recordToChart = (chartRec: ChartConstructorProps): Chart => {
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
      remywikiPath: chartRec["remywikiPath"] as string,
      songSlug: chartRec["songSlug"] as string,
      jkwikiPath: chartRec["jkwikiPath"] as string | null,
    })
  }
}

const unilab0411Charts: Array<ChartConstructorProps> = require("../../assets/2023041100.json")
const unilab1218Charts: Array<ChartConstructorProps> = require("../../assets/2023121800.json")

export const Unilab0411 = new Database(unilab0411Charts, "2023041100")
export const Unilab1218 = new Database(unilab1218Charts, "2023121800")
