import Difficulty from "./Difficulty"

// Does not necessary map 1-1 to Chart props.
export interface ChartConstructorProps {
  id: string
  songId: string
  songFolder: string
  difficulty: Difficulty
  level: number
  hasHolds: boolean
  title: string
  genre: string
  bpm: string | null
  duration: number | null
  notes: number | null
  rating: number | null
  sranLevel: string | null
  songLabels: string[]
  remyWikiPath: string
  hyrorrePath: string | null
}

export default class Chart {
  readonly id: string
  readonly songId: string
  readonly songFolder: string
  readonly difficulty: Difficulty
  readonly level: number
  readonly hasHolds: boolean
  readonly title: string
  readonly genre: string
  readonly bpm: string | null
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
    songFolder,
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
  }: ChartConstructorProps) {
    this.id = id
    this.songId = songId
    this.songFolder = songFolder
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
  // TODO
  // "song__musicdb_title_sort_char":"I"
  // "song__musicdb_genre_sort_char":"ポ"}
}
