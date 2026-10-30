import { expect, it } from "vitest"
import { MinPriorityQueue } from "#/lib/engine/min-priority-queue"

it("pops the minimum across alternating insertions and removals", () => {
  const queue = new MinPriorityQueue<string>()
  expect(queue.pop()).toBeNull()
  queue.push(3, "third")
  queue.push(1, "first")
  expect(queue.pop()).toBe("first")
  queue.push(2, "second")
  queue.push(-1, "before")
  expect(queue.size).toBe(3)
  expect([queue.pop(), queue.pop(), queue.pop(), queue.pop()]).toEqual(["before", "second", "third", null])
  expect(queue.size).toBe(0)
})

it("keeps the search heap's equal-priority tie order", () => {
  const queue = new MinPriorityQueue<string>()
  for (const value of ["a", "b", "c"]) queue.push(1, value)
  expect([queue.pop(), queue.pop(), queue.pop()]).toEqual(["a", "c", "b"])
})

it("rejects invalid priorities without changing pending work", () => {
  const queue = new MinPriorityQueue<number>()
  queue.push(0, 0)
  for (const priority of [NaN, Infinity, -Infinity]) expect(() => queue.push(priority, 1)).toThrow(RangeError)
  expect(queue.size).toBe(1)
  expect(queue.pop()).toBe(0)
  expect(Object.isFrozen(queue)).toBe(true)
})
