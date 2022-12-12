import SranLevel from "../models/SranLevel"

export interface FilterOptions {
  levelLowerBound?: number
  levelUpperBound?: number
  excludeFloorInfection?: boolean
  excludeBuggedBpms?: boolean
  sranLevelLowerBound?: SranLevel
  sranLevelUpperBound?: SranLevel
  includeEasy?: boolean
  includeNormal?: boolean
  includeHyper?: boolean
  includeEx?: boolean
  onlyIncludeHardest?: boolean
  excludeLivelyPacks?: boolean
}

export type SampleOptions = FilterOptions & { count?: number }
