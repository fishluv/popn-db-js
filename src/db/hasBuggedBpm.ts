export default function hasBuggedBpm(bpmSteps: number[]): boolean {
  return bpmSteps.some(bpm => {
    const dividend = 3600 / bpm
    return dividend === Math.floor(dividend)
  })
}
