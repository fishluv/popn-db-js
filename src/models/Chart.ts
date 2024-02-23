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
  remywikiPath: string
  songSlug: string
  jkwikiPath: string | null
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
  readonly remywikiPath: string
  readonly songSlug: string
  readonly jkwikiPath: string | null

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
    remywikiPath,
    songSlug,
    jkwikiPath,
  }: ChartConstructorProps) {
    if (!id) throw new Error("missing id")
    if (!songId) throw new Error(`chart ${id} missing songId`)
    if (!songFolder) throw new Error(`chart ${id} missing songFolder`)
    if (!difficulty) throw new Error(`chart ${id} missing difficulty`)
    if (!level) throw new Error(`chart ${id} missing level`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ([null, undefined].includes(hasHolds as any))
      throw new Error(`chart ${id} missing hasHolds`)
    if (!title) throw new Error(`chart ${id} missing title`)
    if (!genre) throw new Error(`chart ${id} missing genre`)
    if (!titleSortChar) throw new Error(`chart ${id} missing titleSortChar`)
    if (!genreSortChar) throw new Error(`chart ${id} missing genreSortChar`)
    if (!songLabels) throw new Error(`chart ${id} missing songLabels`)
    if (!remywikiPath) throw new Error(`chart ${id} missing remywikiPath`)
    if (!songSlug) throw new Error(`chart ${id} missing songSlug`)

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
    this.remywikiPath = remywikiPath
    this.songSlug = songSlug
    this.jkwikiPath = jkwikiPath
  }
}
