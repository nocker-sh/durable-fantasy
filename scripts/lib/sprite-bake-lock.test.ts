import { afterEach, expect, it } from "vitest"
import { acquireSpriteBakeLock } from "#/scripts/lib/acquire-sprite-bake-lock"
import { withSpriteBakeLock } from "#/scripts/lib/with-sprite-bake-lock"
import { getSpriteBakeLockDirectory } from "#/scripts/lib/get-sprite-bake-lock-directory"
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
const directories: string[] = []
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), "durable-sprite-lock-test-"))
  directories.push(root)
  const output = join(root, "sprites")
  mkdirSync(output)
  return { root, output }
}

it("keeps a live owner exclusive even after its timestamp ages or the output is recreated", () => {
  const f = fixture()
  const lease = acquireSpriteBakeLock(f.output)
  try {
    const claims = getSpriteBakeLockDirectory(f.output)
    for (const name of readdirSync(claims)) utimesSync(join(claims, name), 0, 0)
    expect(() => acquireSpriteBakeLock(f.output + "/../sprites")).toThrow("Sprite output is locked")
    const parentAlias = join(f.root, "parent-alias")
    symlinkSync(f.root, parentAlias, "junction")
    expect(() => acquireSpriteBakeLock(join(parentAlias, "sprites"))).toThrow("Sprite output is locked")
    rmSync(f.output, { recursive: true })
    mkdirSync(f.output)
    expect(() => acquireSpriteBakeLock(f.output)).toThrow("Sprite output is locked")
    expect(readdirSync(claims)).toHaveLength(1)
  } finally {
    lease.release()
  }
})

it("releases only its own claim and cannot release a later owner", () => {
  const f = fixture()
  const first = acquireSpriteBakeLock(f.output)
  first.release()
  const second = acquireSpriteBakeLock(f.output)
  try {
    first.release()
    expect(first.token).not.toBe(second.token)
    expect(() => acquireSpriteBakeLock(f.output)).toThrow("Sprite output is locked")
  } finally {
    second.release()
  }
  const next = acquireSpriteBakeLock(f.output)
  next.release()
})

it("keeps different outputs independent and rejects unknown claim records", () => {
  const f = fixture()
  const first = acquireSpriteBakeLock(f.output)
  const second = acquireSpriteBakeLock(join(f.root, "other"))
  first.release()
  second.release()
  const claims = getSpriteBakeLockDirectory(f.output)
  writeFileSync(join(claims, "unknown"), "")
  expect(() => acquireSpriteBakeLock(f.output)).toThrow("Sprite output is locked")
  expect(readdirSync(claims)).toEqual(["unknown"])
})

it("rejects non-directories and output symlinks without altering them", () => {
  const f = fixture()
  const alias = join(f.root, "alias")
  symlinkSync(f.output, alias, "junction")
  expect(() => acquireSpriteBakeLock(alias)).toThrow("real directory")
  const file = join(f.root, "existing-file")
  writeFileSync(file, "keep")
  expect(() => acquireSpriteBakeLock(file)).toThrow("real directory")
  expect(readFileSync(file, "utf8")).toBe("keep")
})

it("releases on success and failure while preserving the work result or original error", async () => {
  const f = fixture()
  expect(await withSpriteBakeLock(f.output, async () => 42)).toBe(42)
  const failure = new Error("generation failed")
  await expect(
    withSpriteBakeLock(f.output, async () => {
      throw failure
    }),
  ).rejects.toBe(failure)
  const next = acquireSpriteBakeLock(f.output)
  next.release()
})

it("retains both a generation failure and a failed claim cleanup", async () => {
  const f = fixture()
  const original = new Error("render failed")
  const observed = await withSpriteBakeLock(f.output, async () => {
    const claims = getSpriteBakeLockDirectory(f.output)
    const path = join(claims, readdirSync(claims)[0])
    rmSync(path)
    mkdirSync(path)
    throw original
  }).then(
    () => null,
    (error: unknown) => error,
  )
  expect(observed).toBeInstanceOf(AggregateError)
  if (!(observed instanceof AggregateError)) throw new Error("Missing aggregate failure")
  expect(observed.errors[0]).toBe(original)
  expect(observed.errors[1]).toBeInstanceOf(Error)
})
