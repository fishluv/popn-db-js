import SranLevel from "../models/SranLevel"

export interface FilterOptions {
  levelMin?: number
  levelMax?: number
  excludeFloorInfection?: boolean
  excludeBuggedBpms?: boolean
  sranLevelMin?: SranLevel
  sranLevelMax?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  onlyIncludeHardest?: boolean
  excludeLivelyPacks?: boolean
}

export type SampleOptions = FilterOptions & { count?: number }
