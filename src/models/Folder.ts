type Folder =
  | "cs"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
export default Folder

export function parseFolder(s: string | null): Folder {
  const sl = s?.toLowerCase()
  switch (sl) {
    case "cs":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
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
    case "20":
    case "21":
    case "22":
    case "23":
    case "24":
    case "25":
    case "26":
      return sl
    case "01":
      return "1"
    case "02":
      return "2"
    case "03":
      return "3"
    case "04":
      return "4"
    case "05":
      return "5"
    case "06":
      return "6"
    case "07":
      return "7"
    case "08":
      return "8"
    case "09":
      return "9"
    default:
      throw new Error(`Invalid folder ${s}`)
  }
}
