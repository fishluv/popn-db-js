export default function hasBpmChanges(bpmStr: string | null): boolean {
  if (bpmStr === null) {
    return false
  }

  const bpms = bpmStr.match(/\d+/g) || []
  return bpms.length > 1
}
