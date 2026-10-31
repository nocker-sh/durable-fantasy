import { mkdtemp, readFile, rm, stat, utimes } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, expect, it } from "vitest"
import { writeAuthoredPlanExport } from "#/scripts/lib/write-authored-plan-export"

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})
it("creates a prepared source once and keeps unchanged output timestamps", async () => {
  const base = await mkdtemp(join(tmpdir(), "authored-output-"))
  roots.push(base)
  const prepared = { id: "test", roomCount: 1, filePath: join(base, "nested/test.ts"), source: "export default {}\n" }
  expect(await writeAuthoredPlanExport(prepared)).toEqual({ id: "test", roomCount: 1, changed: true })
  expect(await readFile(prepared.filePath, "utf8")).toBe(prepared.source)
  await utimes(prepared.filePath, 1000000000, 1000000000)
  const before = (await stat(prepared.filePath)).mtimeMs
  expect(await writeAuthoredPlanExport(prepared)).toEqual({ id: "test", roomCount: 1, changed: false })
  expect((await stat(prepared.filePath)).mtimeMs).toBe(before)
})
it("propagates read failures that are not a missing file", async () => {
  const base = await mkdtemp(join(tmpdir(), "authored-read-error-"))
  roots.push(base)
  await expect(writeAuthoredPlanExport({ id: "test", roomCount: 1, filePath: base, source: "" })).rejects.toThrow()
})
