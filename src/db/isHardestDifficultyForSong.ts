import { Difficulty } from "../models"
import { ChartConstructorProps } from "../models/Chart"
import { parseDifficulty } from "../models/Difficulty"

const allCharts: Array<ChartConstructorProps> = require("../../assets/2022061300.json")

export default function isHardestDifficultyForSong(
  difficulty: Difficulty,
  songId: string,
): boolean {
  const hardestDiff = allCharts
    .filter(c => c.songId === songId)
    .map(c => parseDifficulty(c.difficulty))
    .sort((a, b) => {
      const diffsOrdered: Difficulty[] = ["ex", "h", "n", "e"]
      return diffsOrdered.indexOf(a) - diffsOrdered.indexOf(b)
    })[0]
  return difficulty === hardestDiff
}
