import { Database } from "../../Database"
import { SranLevel } from "../../SranLevel"
import Chart from "../Chart"
import fromRow from "../fromRow"

export interface SampleOptions {
  count?: number
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

export default async function sample({
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
}: SampleOptions = {}): Promise<Chart[]> {
  if (!count) {
    console.error("`count` must be a positive integer")
    return []
  }
  // TODO
  if (excludeFloorInfection) {
    console.warn("`excludeFloorInfection` is not supported yet")
  }
  if (excludeBuggedBpms) {
    console.warn("`excludeBuggedBpms` is not supported yet")
  }
  if (onlyIncludeHardest) {
    console.warn("`onlyIncludeHardest` is not supported yet")
  }
  if (excludeLivelyPacks) {
    console.warn("`excludeLivelyPacks` is not supported yet")
  }

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
  return await Promise.all(chartRows.map(fromRow))
}
