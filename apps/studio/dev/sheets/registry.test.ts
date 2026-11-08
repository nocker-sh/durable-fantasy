import { describe, expect, it } from "vite-plus/test"
import { SHEETS } from "#/dev/sheets/registry"

describe("studio sidebar", () => {
  it("lists each sheet once", () => {
    const ids = SHEETS.map((sheet) => sheet.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })
})
