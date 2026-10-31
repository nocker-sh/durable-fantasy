import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, expect, it } from "vitest"
import { readIndexedSetting } from "#/scripts/lib/read-indexed-setting"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})
async function fixture(id = "map-test", kind = "maps") {
  const base = await mkdtemp(join(tmpdir(), "authored-index-"))
  roots.push(base)
  await mkdir(join(base, "maps"))
  const document = { id, kind, title: "検査用の資料", status: "設計中", source: "fixture.ts", design_gate: "未通過", issues: [] }
  await writeFile(join(base, "maps/map-test.md"), `---\n${JSON.stringify(document)}\n---\n# 検査用の資料\n\n参照の照合に使う。\n`)
  const entries: SettingIndexEntry[] = [{ id: "map-test", kind: "maps", file: "maps/map-test.md" }]
  return { base, entries, id: "map-test", kind: entries[0].kind }
}
it("reads the canonical indexed document", async () => {
  const props = await fixture()
  expect(await readIndexedSetting(props)).toMatchObject({ id: props.id, kind: props.kind })
})
it.each([
  { id: "map-other", kind: "maps" },
  { id: "map-test", kind: "towns" },
])("rejects indexed content whose identity differs: %j", async (input) => {
  await expect(readIndexedSetting(await fixture(input.id, input.kind))).rejects.toThrow("Indexed setting identity disagrees")
})
it("requires one reference of the requested kind", async () => {
  const props = await fixture()
  await expect(readIndexedSetting({ ...props, entries: [] })).rejects.toThrow("missing or ambiguous")
  await expect(readIndexedSetting({ ...props, entries: [...props.entries, ...props.entries] })).rejects.toThrow("missing or ambiguous")
  await expect(readIndexedSetting({ ...props, kind: "rooms" })).rejects.toThrow("missing or ambiguous")
})
it("validates indexed paths rather than reading a derived or escaping filename", async () => {
  const props = await fixture()
  await expect(readIndexedSetting({ ...props, entries: [{ ...props.entries[0], file: "../maps/map-test.md" }] })).rejects.toThrow("Invalid settings identity or file path")
})
