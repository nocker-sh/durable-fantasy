import { getSpriteBakeHostKey } from "./get-sprite-bake-host-key"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import { join } from "node:path"
import { getSpriteBakeLockDirectory } from "./get-sprite-bake-lock-directory"
import { assertSpriteBakeLockAvailable } from "./assert-sprite-bake-lock-available"
import type { SpriteBakeLease } from "./sprite-bake-types"

export function acquireSpriteBakeLock(output: string): SpriteBakeLease {
  const directory = getSpriteBakeLockDirectory(output)
  mkdirSync(directory, { recursive: true })
  const token = randomUUID()
  const claim = `${process.pid}.${getSpriteBakeHostKey()}.${token}.claim`
  const path = join(directory, claim)
  writeFileSync(path, "", { flag: "wx" })
  try {
    assertSpriteBakeLockAvailable({ directory, claim })
  } catch (error) {
    try {
      rmSync(path, { force: true })
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Sprite lock acquisition and cleanup failed")
    }
    throw error
  }
  return Object.freeze({ token, release: () => rmSync(path, { force: true }) })
}
