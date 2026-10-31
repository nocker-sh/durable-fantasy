import type { mapSnapshot } from "#/dev/map-snapshot"

type Props = Readonly<{ map: string; snapshot: ReturnType<typeof mapSnapshot> }>

/** Validate the scene snapshot before publishing its deterministic walk grid. */
export function serializeMapSnapshot(props: Props): string {
  const data = props.snapshot
  if (data.id !== props.map) throw new Error(`Refusing grid for a different map: ${data.id}`)
  if (!Number.isInteger(data.size) || data.size <= 0 || data.blocked.length !== data.size * data.size || /[^01]/.test(data.blocked)) throw new Error(`Invalid walk grid: ${props.map}`)
  const rows: string[] = []
  for (const row of Array.from({ length: data.size }, (_, index) => index)) {
    rows.push(
      data.blocked
        .slice(row * data.size, (row + 1) * data.size)
        .replace(/1/g, "#")
        .replace(/0/g, "."),
    )
  }
  return JSON.stringify({ size: data.size, rows, places: data.places }, null, 1) + "\n"
}
