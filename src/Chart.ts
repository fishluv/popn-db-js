import { Database } from "./Database"
import { Difficulty } from "./Difficulty"
import { Label } from "./Label"
import { SranLevel } from "./SranLevel"

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

export interface SampleProps {
  count: number
  levelLowerBound?: number
  levelUpperBound?: number
  excludeFloorInfection?: boolean
  excludeBuggedBpms?: boolean
  sranLevelLowerBound?: SranLevel
  sranLevelUpperBound?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  onlyIncludeHardest?: boolean
  excludeLivelyPacks?: boolean
}

// Does not necessary map 1-1 to Chart props.
interface ContructorProps {
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
  songLabels: string[]
  remyWikiPath: string
  hyrorrePath: string | null
}

export class Chart {
  static find = async (id: string): Promise<Chart | null> => {
    const query = `
    select c.id, c.song_id, c.difficulty, c.level, c.has_holds,
           s.remywiki_title, s.genre_romantrans, s.remywiki_url_path,
           h.bpm, h.duration_sec, h.notes, h.rating_num, h.sran_level, h.page_path
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
    return this.fromRow(chartRow)
  }

  // TODO: Need runtime input validation

  static sample = async ({
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
  }: SampleProps): Promise<Chart[]> => {
    const query = `
    select c.id, c.song_id, c.difficulty, c.level, c.has_holds,
           s.remywiki_title, s.genre_romantrans, s.remywiki_url_path,
           h.bpm, h.duration_sec, h.notes, h.rating_num, h.sran_level, h.page_path
    from charts c
    join songs s on c.song_id = s.id -- Every chart has a song
    left join hyrorre_charts h on c.hyrorre_page_path = h.page_path -- but may not have a hyrorre_chart
    where c.id in (
      select c.id
      from charts c
      join songs s on c.song_id = s.id -- Every chart has a song
      left join hyrorre_charts h on c.hyrorre_page_path = h.page_path -- but may not have a hyrorre_chart
      where true
      and c.level >= $levelLowerBound
      and c.level <= $levelUpperBound
      and coalesce(h.sran_level, '19') >= $sranLevelLowerBound
      and coalesce(h.sran_level, '01a') <= $sranLevelUpperBound
      and c.difficulty in ($easy, $normal, $hyper, $ex)
      order by random()
      limit $count
    )
    `

    const chartRows = await Database.get.exec(query, {
      $levelLowerBound: levelLowerBound,
      $levelUpperBound: levelUpperBound,
      $sranLevelLowerBound: sranLevelLowerBound ?? "01a",
      $sranLevelUpperBound: sranLevelUpperBound ?? "19",
      $easy: includeEasy ? "e" : "",
      $normal: includeNormal ? "n" : "",
      $hyper: includeHyper ? "h" : "",
      $ex: includeEx ? "ex" : "",
      $count: count,
    })
    return await Promise.all(chartRows.map(this.fromRow))
  }

  static fromRow = async (
    chartRow: Record<string, string | null>,
  ): Promise<Chart> => {
    const songId = chartRow["song_id"]!
    const songLabels = await Label.forRecord("song", songId)

    return new Chart({
      id: chartRow["id"]!,
      songId,
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
      songLabels,
      remyWikiPath: chartRow["remywiki_url_path"]!,
      hyrorrePath: chartRow["page_path"],
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
  readonly songLabels: string[]
  readonly remyWikiUrl: string
  readonly hyrorreUrl: string | null

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
    songLabels,
    remyWikiPath,
    hyrorrePath,
  }: ContructorProps) {
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
    this.songLabels = songLabels
    this.remyWikiUrl = `https://remywiki.com/${remyWikiPath}`
    this.hyrorreUrl =
      hyrorrePath === null
        ? null
        : `https://popn.hyrorre.com/%E9%9B%A3%E6%98%93%E5%BA%A6%E8%A1%A8/${hyrorrePath}`
  }
  // "song__musicdb_title_sort_char":"I"
  // "song__musicdb_genre_sort_char":"ポ"}
}
