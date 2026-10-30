import { lstatSync, mkdirSync, realpathSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"

/** 出力の全消去でも消えない親へ置き、同じ親への別表記も一つに揃える。 */
export function getSpriteBakeLockDirectory(directory: string): string {
  const absolute = resolve(directory)
  const existing = lstatSync(absolute, { throwIfNoEntry: false })
  if (existing && (existing.isSymbolicLink() || !existing.isDirectory())) throw new Error("Sprite output must be a real directory")
  mkdirSync(dirname(absolute), { recursive: true })
  return join(realpathSync(dirname(absolute)), `.${basename(absolute)}.bake-locks`)
}
