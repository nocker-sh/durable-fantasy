import { readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"

/** The studio's map snapshot source, by the URL its dev server serves apps/studio/dev at (dev-source-modules.ts). */
export function getMapSnapshotModule(): string {
  const directory = fileURLToPath(new URL("../../apps/studio/dev", import.meta.url))
  const sources = readdirSync(directory).filter((file) => file.replace(/\.[^.]+$/, "") === "map-snapshot")
  if (sources.length !== 1) throw new Error("Expected one map snapshot source")
  return `/dev/${sources[0]}`
}
