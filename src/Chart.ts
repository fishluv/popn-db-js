import { Database } from "./Database"
import { Difficulty } from "./Difficulty"

interface ChartProps {
  id: string
  difficulty: Difficulty
  level: number
  has_holds: boolean
  title: string
}

const difficultyFromString = (s: string): Difficulty => {
  const sl = s.toLowerCase()
  switch (sl) {
    case "e":
    case "n":
    case "h":
    case "ex":
      return sl
    case "easy":
      return "e"
    case "normal":
      return "n"
    case "hyper":
      return "h"
    default:
      throw new Error(`Invalid difficulty ${s}`)
  }
}

export class Chart {
  static find = async (id: string): Promise<Chart | null> => {
    const res = await Database.get.exec(
      "select id, difficulty, level, has_holds from charts where id = $id limit 1",
      { $id: id },
    )
    if (!res[0].values) {
      return null
    }

    const chartRow = res[0].values[0]
    return new Chart({
      id: chartRow[0]!.toString(),
      difficulty: difficultyFromString(chartRow[1]!.toString()),
      level: Number(chartRow[2]),
      has_holds: chartRow[3] === "1",
      title: "title",
    })
  }

  readonly id: string
  readonly difficulty: Difficulty
  readonly level: number
  readonly has_holds: boolean
  readonly title: string

  constructor({ id, difficulty, level, has_holds, title }: ChartProps) {
    this.id = id
    this.difficulty = difficulty
    this.level = level
    this.has_holds = has_holds
    this.title = title
  }
  //   {"id":"0e"
  // "level":"1"
  // "song__category":null
  // "song__remy_title":"I REALLY WANT TO HURT YOU"
  // "song__remy_genre":"POPS"
  // "song__remy_path":"I_REALLY_WANT_TO_HURT_YOU"
  // "hyr_path":null
  // "bpm":null
  // "duration":null
  // "note_count":null
  // "has_holds":"0"
  // "rating":null
  // "sran_level":null
  // "song__labels":null
  // "song__id":"0"
  // "difficulty":"e"
  // "song__musicdb_title":"I REALLY WANT TO HURT YOU"
  // "song__musicdb_genre":"ポップス"
  // "song__musicdb_title_sort_char":"I"
  // "song__musicdb_genre_sort_char":"ポ"}
}
