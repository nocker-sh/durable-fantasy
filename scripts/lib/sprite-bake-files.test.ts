import { afterEach, expect, it } from "vitest"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createSpriteBakePlan } from "#/scripts/lib/create-sprite-bake-plan"
import { prepareSpriteBake } from "#/scripts/lib/prepare-sprite-bake"
import { completeSpriteBake } from "#/scripts/lib/complete-sprite-bake"
import { getSpriteBakeJobs } from "#/scripts/lib/get-sprite-bake-jobs"
import { isCompleteSpriteStrip } from "#/scripts/lib/is-complete-sprite-strip"
import { getSpriteStripFilename } from "#/world/scene/get-sprite-strip-filename"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"

const directories: string[] = []
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})
const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), "durable-sprite-plan-test-"))
  directories.push(directory)
  const source = {
    rendererVersion: 6,
    frame: [80, 96],
    residents: [
      { name: "アントン", key: "a", anims: { idle: 2 } },
      { name: "ベルタ", key: "b", anims: { idle: 2 } },
    ],
  } satisfies SpriteManifest
  return { directory, source }
}

it("resumes a new full bake without needing a previously published manifest", () => {
  const f = fixture()
  const plan = createSpriteBakePlan({ source: f.source, previous: null, only: null })
  if (plan instanceof Error) throw plan
  prepareSpriteBake({ directory: f.directory, plan, resume: false })
  expect(existsSync(join(f.directory, "sprites.json"))).toBe(false)
  const first = join(f.directory, "0-idle-0.webp")
  writeFileSync(first, "completed strip fixture")
  prepareSpriteBake({ directory: f.directory, plan, resume: true })
  expect(readFileSync(first, "utf8")).toBe("completed strip fixture")
  expect(() => completeSpriteBake({ directory: f.directory, plan })).toThrow("unfinished strips")
  expect(existsSync(join(f.directory, ".bake-plan.json"))).toBe(true)
  expect(existsSync(join(f.directory, "sprites.json"))).toBe(false)
  for (const job of getSpriteBakeJobs(plan)) writeFileSync(join(f.directory, getSpriteStripFilename(job.resident, job.anim, job.view)), "completed strip fixture")
  completeSpriteBake({ directory: f.directory, plan })
  expect(JSON.parse(readFileSync(join(f.directory, "sprites.json"), "utf8"))).toEqual(plan.output)
  expect(existsSync(join(f.directory, ".bake-plan.json"))).toBe(false)
})

it("rejects changed input and missing pending state before modifying any completed strip", () => {
  const f = fixture()
  const plan = createSpriteBakePlan({ source: f.source, previous: null, only: null })
  if (plan instanceof Error) throw plan
  writeFileSync(join(f.directory, "sentinel"), "keep")
  expect(() => prepareSpriteBake({ directory: f.directory, plan, resume: true })).toThrow("pending plan")
  expect(readFileSync(join(f.directory, "sentinel"), "utf8")).toBe("keep")
  prepareSpriteBake({ directory: f.directory, plan, resume: false })
  const pending = readFileSync(join(f.directory, ".bake-plan.json"), "utf8")
  writeFileSync(join(f.directory, "0-idle-0.webp"), "keep strip")
  f.source.residents[0].key = "changed"
  const changed = createSpriteBakePlan({ source: f.source, previous: null, only: null })
  if (changed instanceof Error) throw changed
  expect(() => prepareSpriteBake({ directory: f.directory, plan: changed, resume: true })).toThrow("generation changed")
  expect(readFileSync(join(f.directory, ".bake-plan.json"), "utf8")).toBe(pending)
  expect(readFileSync(join(f.directory, "0-idle-0.webp"), "utf8")).toBe("keep strip")
})

it("clears only the selected strips and preserves ungenerated files and metadata until publication", () => {
  const f = fixture()
  const previous = structuredClone(f.source)
  f.source.residents[0].key = "new-a"
  f.source.residents[1].key = "new-b"
  const plan = createSpriteBakePlan({ source: f.source, previous, only: ["アントン"] })
  if (plan instanceof Error) throw plan
  const manifestPath = join(f.directory, "sprites.json")
  writeFileSync(manifestPath, JSON.stringify(previous))
  writeFileSync(join(f.directory, "0-idle-0.webp"), "old selected")
  writeFileSync(join(f.directory, "1-idle-0.webp"), "old unselected")
  prepareSpriteBake({ directory: f.directory, plan, resume: false })
  expect(existsSync(join(f.directory, "0-idle-0.webp"))).toBe(false)
  expect(readFileSync(join(f.directory, "1-idle-0.webp"), "utf8")).toBe("old unselected")
  expect(JSON.parse(readFileSync(manifestPath, "utf8"))).toEqual(previous)
  for (const job of getSpriteBakeJobs(plan)) writeFileSync(join(f.directory, getSpriteStripFilename(job.resident, job.anim, job.view)), "new selected")
  completeSpriteBake({ directory: f.directory, plan })
  const published: unknown = JSON.parse(readFileSync(manifestPath, "utf8"))
  expect(published).toEqual(plan.output)
  expect(plan.output.residents[1].key).toBe("b")
  expect(readFileSync(join(f.directory, "1-idle-0.webp"), "utf8")).toBe("old unselected")
})

it("does not treat a pending encoder output, an empty file or a directory as a completed strip", () => {
  const f = fixture()
  const target = join(f.directory, "strip.webp")
  writeFileSync(`${target}.pending`, "partial encoder output")
  expect(isCompleteSpriteStrip(target)).toBe(false)
  writeFileSync(target, "")
  expect(isCompleteSpriteStrip(target)).toBe(false)
  rmSync(target)
  mkdirSync(target)
  expect(isCompleteSpriteStrip(target)).toBe(false)
  rmSync(target, { recursive: true })
  writeFileSync(target, "completed strip fixture")
  expect(isCompleteSpriteStrip(target)).toBe(true)
})

it("does not publish completed filenames under a replaced pending plan", () => {
  const f = fixture()
  const plan = createSpriteBakePlan({ source: f.source, previous: f.source, only: ["アントン"] })
  if (plan instanceof Error) throw plan
  const published = JSON.stringify(f.source)
  writeFileSync(join(f.directory, "sprites.json"), published)
  prepareSpriteBake({ directory: f.directory, plan, resume: false })
  for (const job of getSpriteBakeJobs(plan)) writeFileSync(join(f.directory, getSpriteStripFilename(job.resident, job.anim, job.view)), "completed strip fixture")
  writeFileSync(join(f.directory, ".bake-plan.json"), JSON.stringify({ ...plan, selected: [1] }))
  expect(() => completeSpriteBake({ directory: f.directory, plan })).toThrow("generation changed")
  expect(readFileSync(join(f.directory, "sprites.json"), "utf8")).toBe(published)
})
