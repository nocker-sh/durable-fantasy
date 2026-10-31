import path from "node:path"
import { describe, expect, it } from "vitest"
import { getSettingDocumentPath } from "#/scripts/lib/get-setting-document-path"

describe.each([
  { name: "POSIX", paths: path.posix, base: "/project/.docs/settings", outside: "/other/document.md" },
  { name: "Windows", paths: path.win32, base: "C:\\project\\.docs\\settings", outside: "D:\\other\\document.md" },
  { name: "UNC", paths: path.win32, base: "\\\\host\\share\\settings", outside: "\\\\other\\share\\document.md" },
])("setting document paths on $name", (environment) => {
  it("resolves indexed files and harmless normalization within the base", () => {
    const expected = environment.paths.join(environment.base, "rooms", "room-test.md")
    expect(getSettingDocumentPath(environment.base, "rooms/room-test.md", environment.paths)).toBe(expected)
    expect(getSettingDocumentPath(environment.base, "rooms/../rooms/room-test.md", environment.paths)).toBe(expected)
    expect(getSettingDocumentPath(environment.base, expected, environment.paths)).toBe(expected)
  })

  it.each(["", ".", "..", "../document.md", "../settings-copy/document.md", "rooms/../../document.md"])("rejects base or escaping path %j", (file) => {
    expect(() => getSettingDocumentPath(environment.base, file, environment.paths)).toThrow("Document path outside settings")
  })

  it("rejects absolute paths outside the base, including other drives and shares", () => {
    expect(() => getSettingDocumentPath(environment.base, environment.outside, environment.paths)).toThrow("Document path outside settings")
  })
})

it("uses the host path rules by default", () => {
  const base = path.resolve(".docs/settings")
  expect(getSettingDocumentPath(base, "rooms/room-test.md")).toBe(path.join(base, "rooms", "room-test.md"))
})
