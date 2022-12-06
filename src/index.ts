import { Chart as ChartClass } from "./Chart"

export const Chart = {
  find: async (id: string): Promise<ChartClass | null> => {
    return ChartClass.find(id)
  },
}
