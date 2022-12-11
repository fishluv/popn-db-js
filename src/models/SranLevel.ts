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

export function parseSranLevel(s: string): SranLevel {
  switch (s) {
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
      return s
    default:
      throw new Error(`Invalid sran level ${s}`)
  }
}
