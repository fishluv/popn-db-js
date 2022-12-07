import { Database } from "../../Database"
import Chart from "../Chart"
import fromRow from "../fromRow"

export default async function find(id?: string): Promise<Chart | null> {
  if (!id) {
    console.error("Non-empty `id` required")
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
