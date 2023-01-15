export default function isBuggedBpm(bpmStr: string | null): boolean {
  if (bpmStr === null) {
    return false
  }

  const bpms = bpmStr.match(/\d+/g) || []
  const bpmNums = bpms.map(Number)
  return bpmNums.some(bpm => {
    const dividend = 3600 / bpm
    return dividend === Math.floor(dividend)
  })
}
