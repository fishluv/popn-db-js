import SranLevel from "../models/SranLevel"

export interface SampleOptions {
  count?: number
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
