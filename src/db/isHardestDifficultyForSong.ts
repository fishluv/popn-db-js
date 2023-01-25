import { ChartConstructorProps } from "../models/Chart"
import Difficulty, { DIFFICULTIES, parseDifficulty } from "../models/Difficulty"

const allCharts: Array<ChartConstructorProps> = require("../../assets/2022061300.json")

export default function isHardestDifficultyForSong(
  difficulty: Difficulty,
  songId: string,
): boolean {
  const hardestDiff = allCharts
    .filter(c => c.songId === songId)
    .map(c => parseDifficulty(c.difficulty))
    .sort((a, b) => {
      return DIFFICULTIES.indexOf(b) - DIFFICULTIES.indexOf(a)
    })[0]
  return difficulty === hardestDiff
}
