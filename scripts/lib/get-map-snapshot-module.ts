import { readdirSync } from "node:fs"

export function getMapSnapshotModule(directory: string): string {
  const sources = readdirSync(directory).filter((file) => file.replace(/\.[^.]+$/, "") === "map-snapshot")
  if (sources.length !== 1) throw new Error("Expected one map snapshot source")
  return `/dev/${sources[0]}`
}
