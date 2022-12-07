import { Database } from "../../Database"
import Chart from "../Chart"
import fromRow from "../fromRow"

export default async function find(
  ...ids: string[]
): Promise<Chart | null | Array<Chart | null>> {
  if (ids.length === 1) {
    return await findOne(ids[0])
  }
  return await Promise.all(ids.map(findOne))
}

async function findOne(id: string): Promise<Chart | null> {
  if (typeof id !== "string") {
    console.error("`id` must be a string")
    return null
  }
  id = id.toLowerCase()
  if (!/^\d{1,4}(e|n|h|ex)$/.test(id)) {
    console.error(
      "`id` must be a 4-digit number followed by one of: e, n, h, ex",
    )
    return null
  }

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

  return fromRow(chartRow)
}
