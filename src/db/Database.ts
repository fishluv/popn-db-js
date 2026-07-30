import Chart from "../models/Chart"
import ConditionSet, { IdentifierCondition } from "./ConditionSet"
import * as UNILAB_0731_RAW from "../../assets/2024073100.json"
import * as JAMFIZZ_0924_RAW from "../../assets/2025092400.with_extras.json"
import * as HIGHCHEERS_2607_RAW from "../../assets/hc.202607.json"

const UNILAB_0731_CHARTS: Array<Chart> = (UNILAB_0731_RAW as RawChart[]).map(
  raw => new Chart(raw),
)
const JAMFIZZ_0924_CHARTS: Array<Chart> = (JAMFIZZ_0924_RAW as RawChart[]).map(
  raw => new Chart(raw),
)
const HIGHCHEERS_2607_CHARTS: Array<Chart> = (
  HIGHCHEERS_2607_RAW as RawChart[]
).map(raw => new Chart(raw))

export interface RawChart {
  id: string
  sid: number
  diff: string
  lv: number
  hardest: boolean
  bpm: {
    disp: string
    steps: number[] | null
    main: number | null
    type: string | null
  }
  dur: number | null
  notes: number | null
  holds: number | null
  tim: {
    steps: number[][] | null
    type: string | null
  }
  jk: {
    path: string | null
    rating: string | null
    srlv: number | null
  }
  title: string
  fwTitle: string
  rTitle: string
  genre: string
  fwGenre: string
  rGenre: string
  artist: string
  rChara: string
  debut: string
  folders: string[]
  slug: string
  remyPath: string | null
  labels: string[]
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

// https://github.com/noahm/DDRCardDraw/blob/142e9a1097ef211f2c30748391e5b8b7f31e8591/src/utils/index.ts#L175C8-L184C2
function pickRandomItem<T>(
  list: Array<T>,
): [idx: number, item: T] | [undefined, undefined] {
  if (!list.length) {
    return [undefined, undefined]
  }
  const idx = Math.floor(Math.random() * list.length)
  const item = list[idx]
  return [idx, item]
}

class Database {
  private readonly allCharts: Array<Chart>

  constructor(allCharts: Array<Chart>) {
    this.allCharts = allCharts
  }

  findChart = (id: string): Chart | null => {
    return this.allCharts.find(c => c.id === id) || null
  }

  findCharts = (...ids: string[]): Array<Chart | null> => {
    return ids.map(this.findChart)
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

    return this.allCharts.filter(chart =>
      conditionSet.isSatisfiedByChart(chart, this.allCharts),
    )
  }

  sampleQueriedCharts = ({
    count,
    query,
    levelDistribution,
  }: {
    count?: number
    query?: string
    levelDistribution?: [number, number][]
  } = {}): Chart[] => {
    if (!(count && count > 0)) {
      throw new Error("`count` must be a positive integer")
    }

    const queried = this.queryCharts(query)
    if (!levelDistribution) {
      return sampleArray(queried, count)
    } else {
      // Example:
      //    levelDistribution = [ [30, 1], [40, 3], [50, 1] ]
      // => levelDrawPool = [30, 40, 40, 40, 50]
      const levelDrawPool: number[] = levelDistribution.flatMap(
        ([level, weight]) => Array(weight).fill(level),
      )

      const queriedByLevel = Object.groupBy(queried, chart => chart.level)

      const drawnCharts: Chart[] = []
      for (let i = 0; i < count; i++) {
        const [, levelToDraw] = pickRandomItem(levelDrawPool)
        if (levelToDraw === undefined) continue

        const levelCharts = queriedByLevel[levelToDraw]
        if (!levelCharts?.length) continue

        const [idx, chart] = pickRandomItem(levelCharts)
        if (idx === undefined) continue

        levelCharts.splice(idx, 1)
        drawnCharts.push(chart)
      }

      return drawnCharts
    }
  }
}

export const Unilab0731 = new Database(UNILAB_0731_CHARTS)
export const JamFizz0924 = new Database(JAMFIZZ_0924_CHARTS)
export const HighCheers2607 = new Database(HIGHCHEERS_2607_CHARTS)
