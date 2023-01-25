/**
 * Difficulties in ascending order.
 */
export const DIFFICULTIES = ["e", "n", "h", "ex"] as const

type Difficulty = typeof DIFFICULTIES[number]
export default Difficulty

export function parseDifficulty(s: string | null): Difficulty {
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
    case "x":
      return "ex"
    default:
      throw new Error(`Invalid difficulty ${s}`)
  }
}
