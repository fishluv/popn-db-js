/**
 * Sran levels in ascending order.
 */
export const SRAN_LEVELS = [
  "01a",
  "01b",
  "02a",
  "02b",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
] as const

type SranLevel = typeof SRAN_LEVELS[number]
export default SranLevel

export function isValidSranLevel(s: string): s is SranLevel {
  try {
    parseSranLevel(s)
    return true
  } catch {
    return false
  }
}

export function parseSranLevel(s: string): SranLevel {
  const sNorm = s.replace(/[-弱]/, "a").replace(/[+強]/, "b")

  switch (sNorm) {
    case "1a":
      return "01a"
    case "1b":
      return "01b"
    case "2a":
      return "02a"
    case "2b":
      return "02b"
    case "3":
      return "03"
    case "4":
      return "04"
    case "5":
      return "05"
    case "6":
      return "06"
    case "7":
      return "07"
    case "8":
      return "08"
    case "9":
      return "09"
    case "01a":
    case "01b":
    case "02a":
    case "02b":
    case "03":
    case "04":
    case "05":
    case "06":
    case "07":
    case "08":
    case "09":
    case "10":
    case "11":
    case "12":
    case "13":
    case "14":
    case "15":
    case "16":
    case "17":
    case "18":
    case "19":
      return sNorm
    default:
      throw new Error(`Invalid sran level ${s}`)
  }
}
