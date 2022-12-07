import { Database } from "./Database"

type Type = "chart" | "song"

export class Label {
  static forRecord = async (
    recordType: Type,
    recordId: string,
  ): Promise<string[]> => {
    const query =
      "select value from labels where record_type = $recordType and record_id = $recordId"
    const labelRows = await Database.get.exec(query, {
      $recordType: recordType,
      $recordId: recordId,
    })
    return labelRows.map(row => row["value"]!)
  }
}
