import { ChartConstructorProps } from "../models/Chart"

const NUMERICAL_OPERATORS = ["=", "!=", ">", ">=", "<", "<="] as const
type NumericalOperator = typeof NUMERICAL_OPERATORS[number]

// Need to put longer operators first or else e.g. ">=" will get matched as ">" and "=".
const TOKEN_REGEX = /(!=|>=|<=|=|>|<|[a-z]+|[-\d.]+)/g

abstract class Condition {
  static fromString(condStr: string): Condition {
    const spacedOut = condStr.replace(TOKEN_REGEX, " $1 ")
    const tokens = spacedOut.split(/\s+/).filter(Boolean)

    if (LevelCondition.isValid(tokens)) {
      return LevelCondition.fromTokens(tokens)
    }
    // TODO: Add other conditions here.

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
    switch (this.operator) {
      case "=":
        return chart.level === this.value
      case "!=":
        return chart.level !== this.value
      case ">":
        return chart.level > this.value
      case ">=":
        return chart.level >= this.value
      case "<":
        return chart.level < this.value
      case "<=":
        return chart.level <= this.value
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
