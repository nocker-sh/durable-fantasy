import { afterEach, expect, it } from "vitest"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createInterface } from "node:readline"
import { stripTypeScriptTypes } from "node:module"
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { getSpriteBakeLockDirectory } from "#/scripts/lib/get-sprite-bake-lock-directory"
import type { ChildProcess } from "node:child_process"

const directories: string[] = []
const children: ChildProcess[] = []
afterEach(async () => {
  await Promise.all(
    children.splice(0).map(async (child) => {
      if (!child.pid || child.exitCode !== null || child.signalCode !== null) return
      const exited = once(child, "exit")
      child.kill("SIGKILL")
      await exited
    }),
  )
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), "durable-sprite-process-test-"))
  directories.push(root)
  const compiled = join(root, "compiled")
  mkdirSync(compiled)
  writeFileSync(join(compiled, "package.json"), JSON.stringify({ type: "module" }))
  // The isolated Node fixture has no Vite/Bun alias resolver; link its copied modules locally.
  for (const name of [
    "acquire-sprite-bake-lock",
    "assert-sprite-bake-lock-available",
    "get-sprite-bake-lock-directory",
    "get-sprite-bake-host-key",
    "is-sprite-bake-claim-blocking",
    "sprite-bake-lock-process.fixture",
  ]) {
    const source = readFileSync(new URL(`./${name}.ts`, import.meta.url), "utf8")
    writeFileSync(join(compiled, name.endsWith(".fixture") ? "process.mjs" : name), stripTypeScriptTypes(source).replaceAll('"#/scripts/lib/', '"./'))
  }
  const output = join(root, "sprites")
  mkdirSync(output)
  return { output, executable: join(compiled, "process.mjs") }
}
const start = (f: ReturnType<typeof fixture>, mode: string) => {
  const child = spawn(process.execPath, [f.executable, f.output, mode])
  children.push(child)
  const reader = createInterface({ input: child.stdout })[Symbol.asyncIterator]()
  const diagnostics: string[] = []
  child.stderr.on("data", (chunk: Buffer) => diagnostics.push(chunk.toString()))
  return { child, reader, mode, state: { status: "" }, diagnostics }
}
const line = async (process: ReturnType<typeof start>) => {
  const read = await process.reader.next()
  if (read.done) throw new Error(`Lock fixture exited without a status: ${process.diagnostics.join("")}`)
  process.state.status = read.value
  return read.value
}
const finish = async (process: ReturnType<typeof start>, signal = false) => {
  if (process.child.exitCode !== null || process.child.signalCode !== null) return
  const exited = once(process.child, "exit")
  if (signal) process.child.kill("SIGKILL")
  else if (process.mode !== "try" && process.state.status === "acquired") process.child.stdin.write("release\n")
  await exited
}

it("rejects another process until the live owner releases", async () => {
  const f = fixture()
  const owner = start(f, "hold")
  expect(await line(owner)).toBe("acquired")
  const contender = start(f, "try")
  expect(await line(contender)).toBe("rejected")
  await finish(owner)
  const next = start(f, "try")
  expect(await line(next)).toBe("acquired")
})

it("recovers a terminated process's unique claim only after observing its exit", async () => {
  const f = fixture()
  const owner = start(f, "hold")
  expect(await line(owner)).toBe("acquired")
  const locks = getSpriteBakeLockDirectory(f.output)
  expect(readdirSync(locks)).toHaveLength(1)
  await finish(owner, true)
  const name = readdirSync(locks)[0]
  const fields = name.split(".")
  fields[1] = (fields[1][0] === "0" ? "1" : "0") + fields[1].slice(1)
  const foreign = fields.join(".")
  renameSync(join(locks, name), join(locks, foreign))
  const unverified = start(f, "try")
  expect(await line(unverified)).toBe("rejected")
  await finish(unverified)
  expect(readdirSync(locks)).toEqual([foreign])
  renameSync(join(locks, foreign), join(locks, name))
  const next = start(f, "try")
  expect(await line(next)).toBe("acquired")
  await finish(next)
  expect(readdirSync(locks)).toEqual([])
})

it("admits at most one of simultaneous claimants and allows a retry after contention", async () => {
  const f = fixture()
  const processes = Array.from({ length: 8 }, () => start(f, "race"))
  expect(await Promise.all(processes.map(line))).toEqual(Array.from({ length: 8 }, () => "ready"))
  const statuses = processes.map(line)
  for (const process of processes) process.child.stdin.write("compete\n")
  const results = await Promise.all(statuses)
  expect(results.every((status) => status === "acquired" || status === "rejected")).toBe(true)
  expect(results.filter((status) => status === "acquired").length).toBeLessThanOrEqual(1)
  await Promise.all(processes.map((process) => finish(process)))
  const next = start(f, "try")
  expect(await line(next)).toBe("acquired")
})
