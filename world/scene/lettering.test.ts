import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { BOARDS, KIND_SIGN, LETTERS, SHOP_SIGN, WORDS } from "./lettering.ts"

describe("what is written in the world (town.md「町の文字」)", () => {
  it("is all in the town's letters: capitals without marks, no Japanese", () => {
    for (const w of [...Object.values(WORDS), ...Object.values(SHOP_SIGN), ...Object.values(KIND_SIGN), ...Object.values(BOARDS).flat()]) expect(w, w).toMatch(LETTERS)
  })

  it("is written only through lettering.ts, so nothing on a board slips past it", () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : /\.tsx?$/.test(e.name) && !e.name.includes(".test.") ? [join(dir, e.name)] : []))
    for (const f of walk(join(import.meta.dirname, ".."))) if (!f.endsWith("lettering.ts")) expect(readFileSync(f, "utf8").includes("fillText("), f).toBe(false)
  })
})
