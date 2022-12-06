import { Database } from "./Database"
import { Difficulty } from "./Difficulty"

const difficultyFromString = (s: string | null): Difficulty => {
  const sl = s?.toLowerCase()
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

const toNullableNumber = (val: string | null): number | null => {
  if (val === null) {
    return null
  } else {
    return Number(val)
  }
}

interface ChartProps {
  id: string
  songId: string
  difficulty: Difficulty
  level: number
  hasHolds: boolean
  title: string
  genre: string
  bpm: string
  duration: number | null
  notes: number | null
  rating: number | null
  sranLevel: string | null
}

export class Chart {
  static find = async (id: string): Promise<Chart | null> => {
    const query = `
    select c.id, c.song_id, c.difficulty, c.level, c.has_holds,
           s.remywiki_title, s.genre_romantrans,
           h.bpm, h.duration_sec, h.notes, h.rating_num, h.sran_level
    from charts c
    join songs s on c.song_id = s.id -- Every chart has a song
    left join hyrorre_charts h on c.hyrorre_page_path = h.page_path -- but may not have a hyrorre_chart
    where c.id = $id
    limit 1
    `
    const chartRow = (await Database.get.exec(query, { $id: id }))[0]
    if (!chartRow) {
      return null
    }

    return new Chart({
      id: chartRow["id"]!,
      songId: chartRow["song_id"]!,
      difficulty: difficultyFromString(chartRow["difficulty"]),
      level: Number(chartRow["level"]),
      hasHolds: chartRow["has_holds"] === "1",
      title: chartRow["remywiki_title"]!,
      genre: chartRow["genre_romantrans"]!,
      bpm: chartRow["bpm"]!,
      duration: toNullableNumber(chartRow["duration_sec"]),
      notes: toNullableNumber(chartRow["notes"]),
      rating: toNullableNumber(chartRow["rating_num"]),
      sranLevel: chartRow["sran_level"],
    })
  }

  readonly id: string
  readonly songId: string
  readonly difficulty: Difficulty
  readonly level: number
  readonly hasHolds: boolean
  readonly title: string
  readonly genre: string
  readonly bpm: string
  readonly duration: number | null
  readonly notes: number | null
  readonly rating: number | null
  readonly sranLevel: string | null

  constructor({
    id,
    songId,
    difficulty,
    level,
    hasHolds,
    title,
    genre,
    bpm,
    duration,
    notes,
    rating,
    sranLevel,
  }: ChartProps) {
    this.id = id
    this.songId = songId
    this.difficulty = difficulty
    this.level = level
    this.hasHolds = hasHolds
    this.title = title
    this.genre = genre
    this.bpm = bpm
    this.duration = duration
    this.notes = notes
    this.rating = rating
    this.sranLevel = sranLevel
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
