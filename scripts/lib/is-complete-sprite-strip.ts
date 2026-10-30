import { statSync } from "node:fs"

export function isCompleteSpriteStrip(path: string): boolean {
  const file = statSync(path, { throwIfNoEntry: false })
  return !!file?.isFile() && file.size > 0
}
