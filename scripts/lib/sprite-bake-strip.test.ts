import { afterEach, expect, it } from "vitest"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { commitSpriteBakeStrip } from "./commit-sprite-bake-strip"
const directories: string[] = []
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})
const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), "durable-strip-commit-test-"))
  directories.push(directory)
  return { target: join(directory, "strip.webp"), pngPath: join(directory, "input.png") }
}

it("retains the old target if encoding fails and separates a later run from the abandoned writer", async () => {
  const f = fixture()
  const failure = new Error("encoder failed")
  const old = { pending: "" }
  writeFileSync(f.target, "original")
  await expect(
    commitSpriteBakeStrip({
      ...f,
      token: "old-run",
      encode: (_source, destination) => {
        old.pending = destination
        writeFileSync(destination, "partial")
        throw failure
      },
    }),
  ).rejects.toBe(failure)
  expect(readFileSync(f.target, "utf8")).toBe("original")
  await commitSpriteBakeStrip({
    ...f,
    token: "new-run",
    encode: (_source, destination) => {
      expect(destination).not.toBe(old.pending)
      writeFileSync(destination, "new complete image")
    },
  })
  writeFileSync(old.pending, "late write from the abandoned encoder")
  expect(readFileSync(f.target, "utf8")).toBe("new complete image")
})

it("does not publish a missing or empty encoder output", async () => {
  const f = fixture()
  writeFileSync(f.target, "original")
  await expect(commitSpriteBakeStrip({ ...f, token: "missing", encode: () => {} })).rejects.toThrow("completed strip")
  await expect(commitSpriteBakeStrip({ ...f, token: "empty", encode: (_source, destination) => writeFileSync(destination, "") })).rejects.toThrow("completed strip")
  expect(readFileSync(f.target, "utf8")).toBe("original")
})

it("waits for asynchronous encoding and retains the original on an asynchronous failure", async () => {
  const f = fixture()
  const gate = { finish: () => {}, pending: "" }
  const waiting = new Promise<void>((resolve) => {
    gate.finish = resolve
  })
  writeFileSync(f.target, "original")
  const completion = commitSpriteBakeStrip({
    ...f,
    token: "waiting",
    encode: async (_source, destination) => {
      gate.pending = destination
      writeFileSync(destination, "partial")
      await waiting
      writeFileSync(destination, "complete")
    },
  })
  await Promise.resolve()
  expect(readFileSync(f.target, "utf8")).toBe("original")
  expect(readFileSync(gate.pending, "utf8")).toBe("partial")
  gate.finish()
  await completion
  expect(readFileSync(f.target, "utf8")).toBe("complete")
  const failure = new Error("asynchronous encoding failed")
  await expect(
    commitSpriteBakeStrip({
      ...f,
      token: "rejected",
      encode: async () => {
        throw failure
      },
    }),
  ).rejects.toBe(failure)
  expect(readFileSync(f.target, "utf8")).toBe("complete")
})
