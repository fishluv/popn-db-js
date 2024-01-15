import { ChartConstructorProps } from "../models/Chart"
import Difficulty, { DIFFICULTIES, parseDifficulty } from "../models/Difficulty"

export default function isHardestDifficultyForSong(
  difficulty: Difficulty,
  songId: string,
  allCharts: Array<ChartConstructorProps>,
): boolean {
  const hardestDiff = allCharts
    .filter(c => c.songId === songId)
    .map(c => parseDifficulty(c.difficulty))
    .sort((a, b) => {
      return DIFFICULTIES.indexOf(b) - DIFFICULTIES.indexOf(a)
    })[0]
  return difficulty === hardestDiff
}
