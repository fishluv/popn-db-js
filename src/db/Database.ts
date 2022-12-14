import SranLevel from "../models/SranLevel"

export type IncludeOption = "include" | "exclude" | "only"

export interface FilterOptions {
  levelMin?: number
  levelMax?: number
  ratingMin?: number
  ratingMax?: number
  sranLevelMin?: SranLevel
  sranLevelMax?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  hardest?: IncludeOption
  floorInfection?: IncludeOption
  buggedBpms?: IncludeOption
  livelyPacks?: IncludeOption
}

export type SampleOptions = FilterOptions & { count?: number }
