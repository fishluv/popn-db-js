import { RawChart } from "../db/Database"
import Difficulty, { parseDifficulty } from "./Difficulty"

export default class Chart {
  readonly id: string
  readonly songId: number
  readonly difficulty: Difficulty
  readonly level: number
  readonly hardest: boolean
  readonly bpm: string
  readonly mainBpm: number
  readonly bpmType: string
  readonly bpmSteps: number[]
  readonly duration: number
  readonly notes: number
  readonly holdNotes: number
  readonly timing: string
  readonly timingSteps: number[][]
  readonly jkwikiPath: string | null
  readonly rating: string | null
  readonly sranLevel: number | null
  readonly title: string
  readonly fwTitle: string
  readonly rTitle: string
  readonly genre: string
  readonly fwGenre: string
  readonly rGenre: string
  readonly artist: string
  readonly rChara: string
  readonly debut: string
  readonly folders: string[]
  readonly slug: string
  readonly remywikiPath: string
  readonly songLabels: string[]

  constructor({
    id,
    sid,
    diff,
    lv,
    hardest,
    bpm: { disp, steps: bpmSteps, main, type: bpmType },
    dur,
    notes,
    holds,
    tim: { steps: timingSteps, type: timingType },
    jk: { path: jkwikiPath, rating, srlv },
    title,
    fwTitle,
    rTitle,
    genre,
    fwGenre,
    rGenre,
    artist,
    rChara,
    debut,
    folders,
    slug,
    remyPath,
    labels,
  }: RawChart) {
    if (!id) throw new Error("missing chart id")
    if (sid === undefined || sid === null)
      throw new Error(`chart ${id} missing sid`)
    if (!diff) throw new Error(`chart ${id} missing diff`)
    if (!lv) throw new Error(`chart ${id} missing lv`)
    if (hardest === undefined || hardest === null)
      throw new Error(`chart ${id} missing hardest`)
    if (!disp) throw new Error(`chart ${id} missing disp`)
    if (!bpmSteps) throw new Error(`chart ${id} missing bpmSteps`)
    if (!main) throw new Error(`chart ${id} missing main`)
    if (!bpmType) throw new Error(`chart ${id} missing bpmType`)
    if (!dur) throw new Error(`chart ${id} missing dur`)
    if (!notes) throw new Error(`chart ${id} missing notes`)
    if (holds === undefined || holds === null)
      throw new Error(`chart ${id} missing holds`)
    if (!timingSteps) throw new Error(`chart ${id} missing timingSteps`)
    if (!timingType) throw new Error(`chart ${id} missing timingType`)
    if (!title) throw new Error(`chart ${id} missing title`)
    if (!fwTitle) throw new Error(`chart ${id} missing fwTitle`)
    if (!rTitle) throw new Error(`chart ${id} missing rTitle`)
    if (!genre) throw new Error(`chart ${id} missing genre`)
    if (!fwGenre) throw new Error(`chart ${id} missing fwGenre`)
    if (!rGenre) throw new Error(`chart ${id} missing rGenre`)
    if (!artist) throw new Error(`chart ${id} missing artist`)
    if (!rChara) throw new Error(`chart ${id} missing rChara`)
    if (!debut) throw new Error(`chart ${id} missing debut`)
    if (!folders) throw new Error(`chart ${id} missing folders`)
    if (!slug) throw new Error(`chart ${id} missing slug`)
    if (!remyPath) throw new Error(`chart ${id} missing remyPath`)
    if (!labels) throw new Error(`chart ${id} missing labels`)

    this.id = id
    this.songId = sid
    this.difficulty = parseDifficulty(diff)
    this.level = lv
    this.hardest = hardest
    this.bpm = disp
    this.bpmSteps = bpmSteps
    this.mainBpm = main
    this.bpmType = bpmType
    this.duration = dur
    this.notes = notes
    this.holdNotes = holds
    this.timing = timingType
    this.timingSteps = timingSteps
    this.jkwikiPath = jkwikiPath
    this.rating = rating
    this.sranLevel = srlv
    this.title = title
    this.fwTitle = fwTitle
    this.rTitle = rTitle
    this.genre = genre
    this.fwGenre = fwGenre
    this.rGenre = rGenre
    this.artist = artist
    this.rChara = rChara
    this.debut = debut
    this.folders = folders
    this.slug = slug
    this.remywikiPath = remyPath
    this.songLabels = labels
  }
}
