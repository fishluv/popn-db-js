import { Difficulty } from "../Difficulty"
import { Label } from "../Label"
import Chart from "./Chart"

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

const fromRow = async (
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
export default fromRow
