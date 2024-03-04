import { ChartConstructorProps } from "../models/Chart"
import Difficulty, { parseDifficulty } from "../models/Difficulty"
import VersionFolder, {
  parseVersionFolder,
  VERSION_FOLDERS,
} from "../models/VersionFolder"
import SranLevel, {
  isValidSranLevel,
  parseSranLevel,
} from "../models/SranLevel"
import isBuggedBpm from "./isBuggedBpm"
import isHardestDifficultyForSong from "./isHardestDifficultyForSong"
import hasBpmChanges from "./hasBpmChanges"

type EqualityOperator = "=" | "!="
type NumericalOperator = "=" | "!=" | ">" | ">=" | "<" | "<="

// Need to put longer tokens first or else:
//   ">=" will get matched as ">" and "="
//   "2a" will get matched as "2" and "a"
//   etc.
const TOKEN_REGEX =
  /(!=|>=|<=|=|>|<|0?(1|2)(a|-|弱|b|\+|強)|\d{2}[emh]|(cs|\d{2})+|[+-]?[a-z]+|[+-\d.]+)/g

abstract class Condition {
  static fromString(condStr: string): Condition {
    const tokens = condStr
      .toLowerCase()
      .replace(TOKEN_REGEX, " $1 ")
      .split(/\s+/)
      .filter(Boolean)

    if (FalseCondition.isValid(tokens)) {
      return new FalseCondition()
    } else if (LevelCondition.isValid(tokens)) {
      return LevelCondition.fromTokens(tokens)
    } else if (LevelEmhCondition.isValid(tokens)) {
      return LevelEmhCondition.fromTokens(tokens)
    } else if (RatingCondition.isValid(tokens)) {
      return RatingCondition.fromTokens(tokens)
    } else if (SranLevelCondition.isValid(tokens)) {
      return SranLevelCondition.fromTokens(tokens)
    } else if (DifficultyCondition.isValid(tokens)) {
      return DifficultyCondition.fromTokens(tokens)
    } else if (IdentifierCondition.isValid(tokens)) {
      return IdentifierCondition.fromTokens(tokens)
    } else if (VersionFolderCondition.isValid(tokens)) {
      return VersionFolderCondition.fromTokens(tokens)
    }

    throw new Error(`Invalid condition: [${condStr}]: tokenized as [${tokens}]`)
  }

  abstract readonly type: string

  abstract isSatisfiedByChart(
    chart: ChartConstructorProps,
    allCharts: Array<ChartConstructorProps>,
  ): boolean
}

/**
 * Conditions that match no charts:
 *  "diff ="
 *  "ver ="
 */
class FalseCondition extends Condition {
  static isValid(tokens: string[]) {
    if (tokens.length === 2) {
      const [first, second] = tokens
      return (
        (first === "diff" && second === "=") ||
        (first === "ver" && second === "=")
      )
    }
    return false
  }

  type = "false"

  isSatisfiedByChart(): boolean {
    return false
  }
}

/**
 * lv = 50
 */
class LevelCondition extends Condition {
  static isValid(
    tokens: string[],
  ): tokens is ["lv", NumericalOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "lv" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["lv", NumericalOperator, string]) {
    const [_, operator, value] = tokens
    return new LevelCondition(operator, value)
  }

  private static isValidOperator(operator: string) {
    return ["=", "!=", ">", ">=", "<", "<="].includes(operator)
  }

  private static isValidValue(value: string) {
    return /\d{1,2}/.test(value) && this.between(Number(value), 1, 50)
  }

  private static between(n: number, a: number, b: number) {
    return n >= a && n <= b
  }

  type = "level"

  readonly operator: NumericalOperator
  readonly value: number

  constructor(operator: NumericalOperator, value: string) {
    super()
    this.operator = operator
    this.value = Number(value)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = chart.level

    switch (this.operator) {
      case "=":
        return chartValue === this.value
      case "!=":
        return chartValue !== this.value
      case ">":
        return chartValue > this.value
      case ">=":
        return chartValue >= this.value
      case "<":
        return chartValue < this.value
      case "<=":
        return chartValue <= this.value
    }
  }
}

/**
 * lv = 40h   // Matches charts that are level 40 and rated +0.5 or higher.
 * lv >= 40h  // Matches charts that are level 40 and rated +0.5 or higher; also matches all charts level 41 or higher.
 */
class LevelEmhCondition extends Condition {
  static isValid(
    tokens: string[],
  ): tokens is ["lv", NumericalOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "lv" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["lv", NumericalOperator, string]) {
    const [_, operator, value] = tokens
    const valueMatch = value.match(/(\d{2})([emh])/)
    const [lv, emh] = [
      Number(valueMatch![1]),
      valueMatch![2] as "e" | "m" | "h",
    ]
    return new LevelEmhCondition(operator as "=" | ">=" | "<=", lv, emh)
  }

  private static isValidOperator(operator: string) {
    return ["=", ">=", "<="].includes(operator)
  }

  private static isValidValue(value: string) {
    const lv = value.split(/[emh]/)[0]
    return /\d{1,2}/.test(lv) && this.between(Number(lv), 1, 50)
  }

  private static between(n: number, a: number, b: number) {
    return n >= a && n <= b
  }

  private static levelEquals(
    level: number,
    rating: number,
    targetLevel: number,
    targetEmh: "e" | "m" | "h",
  ) {
    if (level !== targetLevel) {
      return false
    }

    switch (targetEmh) {
      case "e":
        return rating <= -0.5
      case "m":
        return rating > -0.5 && rating < 0.5
      case "h":
        return rating >= 0.5
    }
  }

  private static levelGte(
    level: number,
    rating: number,
    targetLevel: number,
    targetEmh: "e" | "m" | "h",
  ) {
    if (level < targetLevel) {
      return false
    }
    if (level > targetLevel) {
      return true
    }

    switch (targetEmh) {
      case "e":
        return true
      case "m":
        return rating > -0.5
      case "h":
        return rating >= 0.5
    }
  }

  private static levelLte(
    level: number,
    rating: number,
    targetLevel: number,
    targetEmh: "e" | "m" | "h",
  ) {
    if (level < targetLevel) {
      return true
    }
    if (level > targetLevel) {
      return false
    }

    switch (targetEmh) {
      case "e":
        return rating <= -0.5
      case "m":
        return rating < 0.5
      case "h":
        return true
    }
  }

  type = "levelemh"

  readonly operator: "=" | ">=" | "<="
  readonly targetLevel: number
  readonly targetEmh: "e" | "m" | "h"

  constructor(operator: "=" | ">=" | "<=", lv: number, emh: "e" | "m" | "h") {
    super()
    this.operator = operator
    this.targetLevel = lv
    this.targetEmh = emh
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const { level, rating } = chart
    if (rating === null) {
      return false
    }

    switch (this.operator) {
      case "=":
        return LevelEmhCondition.levelEquals(
          level,
          rating,
          this.targetLevel,
          this.targetEmh,
        )
      case ">=":
        return LevelEmhCondition.levelGte(
          level,
          rating,
          this.targetLevel,
          this.targetEmh,
        )
      case "<=":
        return LevelEmhCondition.levelLte(
          level,
          rating,
          this.targetLevel,
          this.targetEmh,
        )
    }
  }
}

/**
 * rat = 0.0
 */
class RatingCondition extends Condition {
  static isValid(
    tokens: string[],
  ): tokens is ["rat", NumericalOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "rat" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["rat", NumericalOperator, string]) {
    const [_, operator, value] = tokens
    return new RatingCondition(operator, value)
  }

  private static isValidOperator(operator: string) {
    return ["=", "!=", ">", ">=", "<", "<="].includes(operator)
  }

  private static isValidValue(value: string) {
    return !isNaN(parseFloat(value))
  }

  type = "rating"

  readonly operator: NumericalOperator
  readonly value: number

  constructor(operator: NumericalOperator, value: string) {
    super()
    this.operator = operator
    this.value = Number(value)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = chart.rating
    if (chartValue === null) {
      return false
    }

    switch (this.operator) {
      // Need to stringify for (in)equality to account for loss of precision.
      case "=":
        return chartValue.toString() === this.value.toString()
      case "!=":
        return chartValue.toString() !== this.value.toString()
      case ">":
        return chartValue > this.value
      case ">=":
        return chartValue >= this.value
      case "<":
        return chartValue < this.value
      case "<=":
        return chartValue <= this.value
    }
  }
}

/**
 * srlv = 1a
 */
class SranLevelCondition extends Condition {
  static isValid(
    tokens: string[],
  ): tokens is ["srlv", NumericalOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "srlv" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["srlv", NumericalOperator, string]) {
    const [_, operator, value] = tokens
    return new SranLevelCondition(operator, value)
  }

  private static isValidOperator(operator: string) {
    return ["=", "!=", ">", ">=", "<", "<="].includes(operator)
  }

  private static isValidValue(value: string) {
    return isValidSranLevel(value)
  }

  type = "sranlevel"

  readonly operator: NumericalOperator
  readonly value: SranLevel

  constructor(operator: NumericalOperator, value: string) {
    super()
    this.operator = operator
    this.value = parseSranLevel(value)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = chart.sranLevel
    if (chartValue === null) {
      return false
    }

    switch (this.operator) {
      case "=":
        return chartValue === this.value
      case "!=":
        return chartValue !== this.value
      case ">":
        return chartValue > this.value
      case ">=":
        return chartValue >= this.value
      case "<":
        return chartValue < this.value
      case "<=":
        return chartValue <= this.value
    }
  }
}

/**
 * diff = enhx
 */
class DifficultyCondition extends Condition {
  static isValid(
    tokens: string[],
  ): tokens is ["diff", EqualityOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "diff" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["diff", EqualityOperator, string]) {
    const [_, operator, value] = tokens
    return new DifficultyCondition(operator, value)
  }

  private static isValidOperator(operator: string) {
    return ["=", "!="].includes(operator)
  }

  private static isValidValue(value: string) {
    return /^[enhx]+$/.test(value)
  }

  type = "difficulty"

  readonly operator: EqualityOperator
  readonly value: Difficulty[]

  constructor(operator: EqualityOperator, value: string) {
    super()
    this.operator = operator
    this.value = [...value].map(parseDifficulty)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = parseDifficulty(chart.difficulty)

    switch (this.operator) {
      case "=":
        return this.value.includes(chartValue)
      case "!=":
        return !this.value.includes(chartValue)
    }
  }
}

// Suspending Lively support indefinitely.
type Identifier =
  | "buggedbpm"
  | "bpmchanges"
  | "soflan"
  | "hardest"
  | "holds"
  | "floorinfection"
  | "upper"
  | "ura"
  | "omnimix"
  | "lively"
type IdentifierConditionValue = Identifier | `+${Identifier}` | `-${Identifier}`

/**
 * Flag/identifier/label. See list above.
 */
export class IdentifierCondition extends Condition {
  static isValid(tokens: string[]): tokens is [IdentifierConditionValue] {
    if (tokens.length === 1) {
      return this.isValidValue(tokens[0])
    }
    return false
  }

  static fromTokens(tokens: [IdentifierConditionValue]) {
    return new IdentifierCondition(tokens[0])
  }

  private static isValidValue(identifier: string) {
    return [
      "buggedbpm",
      "bpmchanges",
      "soflan",
      "hardest",
      "holds",
      "floorinfection",
      "upper",
      "ura",
      "omnimix",
      "lively",
    ]
      .flatMap(id => [id, `+${id}`, `-${id}`])
      .includes(identifier)
  }

  type = "identifier"

  readonly value: IdentifierConditionValue

  constructor(value: IdentifierConditionValue) {
    super()
    this.value = value
  }

  isSatisfiedByChart(
    chart: ChartConstructorProps,
    allCharts: Array<ChartConstructorProps>,
  ): boolean {
    switch (this.value) {
      case "buggedbpm":
        return isBuggedBpm(chart.bpm)
      case "-buggedbpm":
        return !isBuggedBpm(chart.bpm)
      case "bpmchanges":
      case "soflan":
        return hasBpmChanges(chart.bpm)
      case "-bpmchanges":
      case "-soflan":
        return !hasBpmChanges(chart.bpm)
      case "hardest":
        return isHardestDifficultyForSong(
          parseDifficulty(chart.difficulty),
          chart.songId,
          allCharts,
        )
      case "-hardest":
        return !isHardestDifficultyForSong(
          parseDifficulty(chart.difficulty),
          chart.songId,
          allCharts,
        )
      case "holds":
        return chart.hasHolds
      case "-holds":
        return !chart.hasHolds
      case "floorinfection":
        return chart.songLabels.includes("floor_infection")
      case "-floorinfection":
        return !chart.songLabels.includes("floor_infection")
      case "upper":
        return chart.songLabels.includes("upper")
      case "-upper":
        return !chart.songLabels.includes("upper")
      case "ura":
        return chart.songLabels.includes("ura")
      case "-ura":
        return !chart.songLabels.includes("ura")
      case "omnimix":
        return chart.songLabels.includes("omnimix")
      case "-omnimix":
        return !chart.songLabels.includes("omnimix")
      case "lively":
        return chart.songLabels.includes("lively")
      case "-lively":
        return !chart.songLabels.includes("lively")
      default:
        // +id is a no-op
        // The reason +id exists is because omnimix and lively default to -id.
        return true
    }
  }
}

/**
 * ver = cs0102030405
 */
class VersionFolderCondition extends Condition {
  static REGEX = new RegExp(VERSION_FOLDERS.join("|"), "g")

  static isValid(
    tokens: string[],
  ): tokens is ["ver", EqualityOperator, string] {
    if (tokens.length === 3) {
      const [field, operator, value] = tokens
      return (
        field === "ver" &&
        this.isValidOperator(operator) &&
        this.isValidValue(value)
      )
    }
    return false
  }

  static fromTokens(tokens: ["ver", EqualityOperator, string]) {
    const [_, operator, value] = tokens
    return new VersionFolderCondition(operator, value)
  }

  private static isValidOperator(operator: string) {
    return ["=", "!="].includes(operator)
  }

  private static isValidValue(value: string) {
    return this.REGEX.test(value)
  }

  type = "versionfolder"

  readonly operator: EqualityOperator
  readonly value: VersionFolder[]

  constructor(operator: EqualityOperator, value: string) {
    super()
    this.operator = operator
    this.value = value
      .match(VersionFolderCondition.REGEX)!
      .map(parseVersionFolder)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = parseVersionFolder(chart.songFolder)

    if (this.operator === "=") {
      return this.value.includes(chartValue)
    } else {
      return !this.value.includes(chartValue)
    }
  }
}

export default class ConditionSet {
  static fromQuery = (query: string): ConditionSet => {
    const conditions = query.split(/,/).map(condStr => {
      return Condition.fromString(condStr)
    })
    return new ConditionSet(conditions)
  }

  readonly conditions: Condition[]

  private constructor(conditions: Condition[]) {
    this.conditions = conditions
  }

  isSatisfiedByChart(
    chart: ChartConstructorProps,
    allCharts: Array<ChartConstructorProps>,
  ): boolean {
    if (!this.conditions.length) {
      return false
    }

    return this.conditions.every(condition =>
      condition.isSatisfiedByChart(chart, allCharts),
    )
  }
}
