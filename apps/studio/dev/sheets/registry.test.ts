import { describe, expect, it } from "vite-plus/test"
import { SHEETS } from "#/dev/sheets/registry"

describe("studio sidebar", () => {
  it("lists each sheet once", () => {
    const ids = SHEETS.map((sheet) => sheet.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it("keys each row of a sheet once, so every row has its own page", () => {
    const repeated: string[] = []
    for (const sheet of SHEETS) {
      const seen = new Set<string>()
      for (const row of sheet.rows()) {
        const key = sheet.key(row)
        if (seen.has(key)) repeated.push(`${sheet.id}/${key}`)
        seen.add(key)
      }
    }
    expect(repeated).toEqual([])
  })
})
