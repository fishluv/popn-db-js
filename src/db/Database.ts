import SranLevel from "../models/SranLevel"

export type IncludeOption = "include" | "exclude" | "only"

export interface FilterOptions {
  levelMin?: number
  levelMax?: number
  floorInfection?: IncludeOption
  buggedBpms?: IncludeOption
  sranLevelMin?: SranLevel
  sranLevelMax?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  hardest?: IncludeOption
  excludeLivelyPacks?: boolean
}

export type SampleOptions = FilterOptions & { count?: number }
