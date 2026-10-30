import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vite-plus/test"
import { NOT_TABLES, SOURCES } from "#/dev/sources"

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) && !/\.test\./.test(f) ? [p] : []
  })
}

/** Every exported upper-case constant in the game (and the studio's) that is not a plain number, string or flag. */
const exported = [
  ...new Set(
    [...files("world"), ...files("dev/studio")].flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(/^export const ([A-Z][A-Z0-9_]+)\b[^=]*= *([^\n]*)/gm)].filter((m) => !/^(-?\d|["'`]|true|false|new )/.test(m[2])).map((m) => m[1]),
    ),
  ),
]

describe("/dev shows every table in the game", () => {
  it("each exported table is a sheet's source or named as not a table", () => {
    const known = new Set([...Object.values(SOURCES).flat(), ...NOT_TABLES])
    expect(exported.filter((x) => !known.has(x))).toEqual([])
  })

  it("names no table that is gone", () => {
    const all = new Set(exported)
    expect([...Object.values(SOURCES).flat(), ...NOT_TABLES].filter((x) => !all.has(x))).toEqual([])
  })

  it("the sheets are the ones the sources list", () => {
    const ids = [
      ...files("dev/sheets")
        .map((file) => readFileSync(file, "utf8"))
        .join("\n")
        .matchAll(/^const \w+ = sheet(?:<[^>]+>)?\(\{\n?\s*id: "([^"]+)"/gm),
    ].map((m) => m[1])
    expect(ids.sort()).toEqual(Object.keys(SOURCES).sort())
  })
})
