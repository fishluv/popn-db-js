import Difficulty, { parseDifficulty } from "./Difficulty"
import VersionFolder, { parseVersionFolder } from "./VersionFolder"

// Does not necessarily map 1-1 to Chart props.
export interface ChartConstructorProps {
  id: string
  songId: string
  songFolder: string
  difficulty: string
  level: number
  hasHolds: boolean
  title: string
  genre: string
  titleSortChar: string
  genreSortChar: string
  bpm: string | null
  duration: number | null
  notes: number | null
  rating: number | null
  sranLevel: string | null
  songLabels: string[]
  remyWikiPath: string
  songSlug: string | null
  hyrorrePath: string | null
}

export default class Chart {
  readonly id: string
  readonly songId: string
  readonly songFolder: VersionFolder
  readonly difficulty: Difficulty
  readonly level: number
  readonly hasHolds: boolean
  readonly title: string
  readonly genre: string
  readonly titleSortChar: string
  readonly genreSortChar: string
  readonly bpm: string | null
  readonly duration: number | null
  readonly notes: number | null
  readonly rating: number | null
  readonly sranLevel: string | null
  readonly songLabels: string[]
  readonly remyWikiUrl: string
  readonly songSlug: string | null
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
    titleSortChar,
    genreSortChar,
    bpm,
    duration,
    notes,
    rating,
    sranLevel,
    songLabels,
    remyWikiPath,
    songSlug,
    hyrorrePath,
  }: ChartConstructorProps) {
    this.id = id
    this.songId = songId
    this.songFolder = parseVersionFolder(songFolder)
    this.difficulty = parseDifficulty(difficulty)
    this.level = level
    this.hasHolds = hasHolds
    this.title = title
    this.genre = genre
    this.titleSortChar = titleSortChar
    this.genreSortChar = genreSortChar
    this.bpm = bpm
    this.duration = duration
    this.notes = notes
    this.rating = rating
    this.sranLevel = sranLevel
    this.songLabels = songLabels
    this.remyWikiUrl = `https://remywiki.com/${remyWikiPath}`
    this.songSlug = songSlug
    this.hyrorreUrl =
      hyrorrePath === null
        ? null
        : `https://popn.wiki/%E9%9B%A3%E6%98%93%E5%BA%A6%E8%A1%A8/${hyrorrePath}`
  }
}
