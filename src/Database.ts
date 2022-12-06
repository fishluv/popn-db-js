import { readFileSync } from "fs"
import initSqlJs = require("sql.js")
import APP_ROOT = require("app-root-path")

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
    const SQL = await initSqlJs()
    const fileBuffer = readFileSync(`${APP_ROOT}/assets/2022061300.sqlite3`)
    this.db = new SQL.Database(fileBuffer)
  }

  exec = async (
    sql: string,
    params?: initSqlJs.BindParams,
  ): Promise<initSqlJs.QueryExecResult[]> => {
    await this.init()
    return this.db!.exec(sql, params)
  }
}
