import { expect, it } from "vitest"
import { KeyedQueue } from "#/lib/engine/keyed-queue"

it("orders one connection while other connections continue", async () => {
  const queue = new KeyedQueue()
  let finish!: () => void
  const wait = new Promise<void>((resolve) => {
    finish = resolve
  })
  const events: string[] = []
  const first = queue.run("one", async () => {
    await wait
    events.push("first")
  })
  const second = queue.run("one", async () => {
    events.push("second")
  })
  await queue.run("two", async () => {
    events.push("other")
  })
  expect(events).toEqual(["other"])
  finish()
  await Promise.all([first, second])
  expect(events).toEqual(["other", "first", "second"])
})

it("continues after a failed request without hiding its error", async () => {
  const queue = new KeyedQueue()
  const failed = queue.run("one", async () => {
    throw new Error("failed")
  })
  const next = queue.run("one", async () => "next")
  await expect(failed).rejects.toThrow("failed")
  await expect(next).resolves.toBe("next")
  await expect(queue.run("one", async () => "again")).resolves.toBe("again")
})
