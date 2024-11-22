import Chart from "../models/Chart"
import ConditionSet, { IdentifierCondition } from "./ConditionSet"

const UNILAB_0731_CHARTS: Array<Chart> =
  require("../../assets/2024073100.json").map((raw: RawChart) => new Chart(raw))
const JAMFIZZ_0925_CHARTS: Array<Chart> =
  require("../../assets/2024092500.with_extras.json").map(
    (raw: RawChart) => new Chart(raw),
  )

export interface RawChart {
  id: string
  sid: number
  diff: string
  lv: number
  hardest: boolean
  bpm: {
    disp: string
    steps: number[]
    main: number
    type: string
  }
  dur: number
  notes: number
  holds: number
  tim: {
    steps: number[][]
    type: string
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
  remyPath: string
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
}

export const Unilab0731 = new Database(UNILAB_0731_CHARTS)
export const JamFizz0925 = new Database(JAMFIZZ_0925_CHARTS)
