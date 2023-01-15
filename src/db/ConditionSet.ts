import { parseSranLevel, SranLevel } from "../models"
import { ChartConstructorProps } from "../models/Chart"
import Difficulty, { parseDifficulty } from "../models/Difficulty"
import { isValidSranLevel } from "../models/SranLevel"
import isBuggedBpm from "./isBuggedBpm"
import isHardestDifficultyForSong from "./isHardestDifficultyForSong"

type EqualityOperator = "=" | "!="
type NumericalOperator = "=" | "!=" | ">" | ">=" | "<" | "<="

// Need to put longer tokens first or else:
//   ">=" will get matched as ">" and "="
//   "2a" will get matched as "2" and "a"
//   etc.
const TOKEN_REGEX =
  /(!=|>=|<=|=|>|<|0?(1|2)(a|-|弱|b|\+|強)|!?[a-z]+|[+-\d.]+)/g

abstract class Condition {
  static fromString(condStr: string): Condition {
    const tokens = condStr
      .toLowerCase()
      .replace(TOKEN_REGEX, " $1 ")
      .split(/\s+/)
      .filter(Boolean)

    if (LevelCondition.isValid(tokens)) {
      return LevelCondition.fromTokens(tokens)
    } else if (RatingCondition.isValid(tokens)) {
      return RatingCondition.fromTokens(tokens)
    } else if (SranLevelCondition.isValid(tokens)) {
      return SranLevelCondition.fromTokens(tokens)
    } else if (DifficultyCondition.isValid(tokens)) {
      return DifficultyCondition.fromTokens(tokens)
    } else if (IdentifierCondition.isValid(tokens)) {
      return IdentifierCondition.fromTokens(tokens)
    }

    throw new Error(`Invalid condition: [${condStr}]`)
  }

  abstract isSatisfiedByChart(chart: ChartConstructorProps): boolean
}

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

  readonly operator: EqualityOperator
  readonly value: Difficulty[]

  constructor(operator: EqualityOperator, value: string) {
    super()
    this.operator = operator
    this.value = [...value].map(parseDifficulty)
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    const chartValue = chart.difficulty

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
  | "hardest"
  | "holds"
  | "floorinfection"
  | "upper"
  | "ura"
type IdentifierConditionValue = Identifier | `!${Identifier}`

class IdentifierCondition extends Condition {
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
      "!buggedbpm",
      "hardest",
      "!hardest",
      "holds",
      "!holds",
      "floorinfection",
      "!floorinfection",
      "upper",
      "!upper",
      "ura",
      "!ura",
    ].includes(identifier)
  }

  readonly value: IdentifierConditionValue

  constructor(value: IdentifierConditionValue) {
    super()
    this.value = value
  }

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    switch (this.value) {
      case "buggedbpm":
        return isBuggedBpm(chart.bpm)
      case "!buggedbpm":
        return !isBuggedBpm(chart.bpm)
      case "hardest":
        return isHardestDifficultyForSong(chart.difficulty, chart.songId)
      case "!hardest":
        return !isHardestDifficultyForSong(chart.difficulty, chart.songId)
      case "holds":
        return chart.hasHolds
      case "!holds":
        return !chart.hasHolds
      case "floorinfection":
        return chart.songLabels.includes("floor_infection")
      case "!floorinfection":
        return !chart.songLabels.includes("floor_infection")
      case "upper":
        return chart.songLabels.includes("upper")
      case "!upper":
        return !chart.songLabels.includes("upper")
      case "ura":
        return chart.songLabels.includes("ura")
      case "!ura":
        return !chart.songLabels.includes("ura")
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

  isSatisfiedByChart(chart: ChartConstructorProps): boolean {
    if (!this.conditions.length) {
      return false
    }

    return this.conditions.every(condition =>
      condition.isSatisfiedByChart(chart),
    )
  }
}
