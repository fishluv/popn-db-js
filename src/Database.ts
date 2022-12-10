import { readFileSync } from "fs"
import { resolve } from "path"
import initSqlJs = require("sql.js")

export class Database {
  private static instance: Database

  static get get(): Database {
    return this.instance || (this.instance = new this())
  }

  private db: initSqlJs.Database | null

  private constructor() {
    this.db = null
  }

  private async init(): Promise<void> {
    if (this.db === null) {
      const SQL = await initSqlJs()
      const filename = resolve(__dirname, "../assets/2022061300.sqlite3")
      const fileBuffer = readFileSync(filename)
      this.db = new SQL.Database(fileBuffer)
    }
  }

  exec = async (
    sql: string,
    params?: initSqlJs.BindParams,
  ): Promise<Record<string, string | null>[]> => {
    await this.init()
    // `result` is [] if no results
    const result = this.db!.exec(sql, params)[0]
    if (result) {
      return this.toRecords(result)
    } else {
      return []
    }
  }

  private toRecords = (result: initSqlJs.QueryExecResult) => {
    const [cols, rows] = [result.columns, result.values]
    return rows.map(vals => {
      return vals.reduce((ret, v, i) => ({ ...ret, [cols[i]]: v }), {})
    })
  }
}
