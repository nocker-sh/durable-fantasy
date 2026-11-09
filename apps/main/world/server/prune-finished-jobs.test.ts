import { expect, it } from "vitest"
import { FINISHED_JOB_TTL_MS, pruneFinishedJobs } from "#/world/server/prune-finished-jobs"

type Job = { phase: "pending" | "done" | "refused"; doneAt?: number; id: number }

it("keeps pending requests, notes when settled ones were first seen, and drops them only after the window", () => {
  const jobs: Record<string, Job> = { waiting: { phase: "pending", id: 1 }, bought: { phase: "done", id: 2 }, refused: { phase: "refused", id: 3 } }
  pruneFinishedJobs(jobs, 1000)
  expect(jobs).toEqual({ waiting: { phase: "pending", id: 1 }, bought: { phase: "done", id: 2, doneAt: 1000 }, refused: { phase: "refused", id: 3, doneAt: 1000 } })
  pruneFinishedJobs(jobs, 1000 + FINISHED_JOB_TTL_MS)
  expect(Object.keys(jobs).sort()).toEqual(["bought", "refused", "waiting"])
  pruneFinishedJobs(jobs, 1001 + FINISHED_JOB_TTL_MS)
  expect(jobs).toEqual({ waiting: { phase: "pending", id: 1 } })
})

it("a record of many past players shrinks back to those still at it", () => {
  const jobs: Record<string, Job> = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => [`p${index}`, { phase: "done" as const, id: index, doneAt: 0 }]))
  jobs.now = { phase: "pending", id: 1000 }
  pruneFinishedJobs(jobs, FINISHED_JOB_TTL_MS + 1)
  expect(Object.keys(jobs)).toEqual(["now"])
})
