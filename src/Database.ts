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
    const SQL = await initSqlJs()
    const filename = resolve(__dirname, "../assets/2022061300.sqlite3")
    const fileBuffer = readFileSync(filename)
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
