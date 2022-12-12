import { readFileSync } from "fs"
import { resolve } from "path"
import initSqlJs = require("sql.js")
import Chart from "../models/Chart"
import { parseDifficulty } from "../models/Difficulty"
import { SampleOptions } from "./Database"

const toNullableNumber = (val: string | null): number | null => {
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

export default class SqlDatabase {
  private static instance = new this()

  static get get() {
    return this.instance
  }

  private db: initSqlJs.Database | null = null

  private constructor() {}

  init = async () => {
    const filename = resolve(__dirname, "../../assets/2022061300.sqlite3")
    const sqliteBuffer = readFileSync(filename)
    const SQL = await initSqlJs()
    this.db = new SQL.Database(sqliteBuffer)
  }

  findChart = async (id: string): Promise<Chart | null> => {
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
    const chartRow = (await this.exec(query, { $id: id }))[0]
    if (!chartRow) {
      return null
    }

    return this.recordToChart(chartRow)
  }

  findCharts = async (...ids: string[]): Promise<Array<Chart | null>> => {
    return await Promise.all(ids.map(this.findChart))
  }

  sampleCharts = async ({
    count,
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
    livelyPacks = "include",
  }: SampleOptions = {}): Promise<Chart[]> => {
    if (!count) {
      console.error("`count` must be a positive integer")
      return []
    }
    // TODO
    if (hardest) {
      console.warn("`hardest` is not supported yet")
    }
    if (floorInfection) {
      console.warn("`floorInfection` is not supported yet")
    }
    if (buggedBpms) {
      console.warn("`buggedBpms` is not supported yet")
    }
    if (livelyPacks) {
      console.warn("`livelyPacks` is not supported yet")
    }

    // Only filter by rating if ratingMin or ratingMax is present.
    const shouldFilterRating = isNotBlank(ratingMin) || isNotBlank(ratingMax)
    const normRatingMin = ratingMin ?? -2
    const normRatingMax = ratingMax ?? 2

    // Only filter by sran level if sranLevelMin or sranLevelMax is present.
    const shouldFilterSranLevel =
      isNotBlank(sranLevelMin) || isNotBlank(sranLevelMax)
    const normSranMin = sranLevelMin ?? "01"
    const normSranMax = sranLevelMax ?? "19"

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
      and c.level >= $levelMin
      and c.level <= $levelMax
      and ($shouldFilterRating = 0 or (h.rating_num is not null and h.rating_num >= $ratingMin and h.rating_num <= $ratingMax))
      and ($shouldFilterSranLevel = 0 or (h.sran_level is not null and h.sran_level >= $sranLevelMin and h.sran_level <= $sranLevelMax))
      and c.difficulty in ($easy, $normal, $hyper, $ex)
      order by random()
      limit $count
    )
    `

    const chartRecords = await this.exec(query, {
      $levelMin: levelMin,
      $levelMax: levelMax,
      $shouldFilterRating: shouldFilterRating ? 1 : 0,
      $ratingMin: normRatingMin,
      $ratingMax: normRatingMax,
      $shouldFilterSranLevel: shouldFilterSranLevel ? 1 : 0,
      $sranLevelMin: normSranMin,
      $sranLevelMax: normSranMax,
      $easy: includeEasy ? "e" : "",
      $normal: includeNormal ? "n" : "",
      $hyper: includeHyper ? "h" : "",
      $ex: includeEx ? "ex" : "",
      $count: count,
    })
    return await Promise.all(chartRecords.map(this.recordToChart))
  }

  private exec = async (
    sql: string,
    params?: initSqlJs.BindParams,
  ): Promise<Record<string, string | null>[]> => {
    if (this.db === null) {
      console.error(
        "db has not been initialized. call `init()` first. returning [].",
      )
      return []
    }

    let records: Record<string, string | null>[] = []
    try {
      // `result` is [] if no results
      const result = this.db.exec(sql, params)[0]
      if (result) {
        const [cols, rows] = [result.columns, result.values]
        records = rows.map(vals => {
          return vals.reduce((ret, v, i) => ({ ...ret, [cols[i]]: v }), {})
        })
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      console.error(`db call failed: ${message}`)
    }
    return records
  }

  private recordToChart = async (
    chartRow: Record<string, string | null>,
  ): Promise<Chart> => {
    const songId = chartRow["song_id"]!
    const songLabels = await this.findSongLabels(songId)

    return new Chart({
      id: chartRow["id"]!,
      songId,
      difficulty: parseDifficulty(chartRow["difficulty"]),
      level: Number(chartRow["level"]),
      hasHolds: Number(chartRow["has_holds"]) === 1,
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

  private findSongLabels = async (songId: string): Promise<string[]> => {
    const query =
      "select value from labels where record_type = 'song' and record_id = $songId"
    const labelRecords = await this.exec(query, {
      $songId: songId,
    })
    return labelRecords.map(row => row["value"]!)
  }
}
