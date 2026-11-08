/** How long a settled request is kept to answer a resent copy of it (a lost reply is retried within seconds). */
export const FINISHED_JOB_TTL_MS = 60 * 60_000

type Finished = { phase: string; doneAt?: number }

/**
 * Drop the requests that were settled long ago from a shared object's record (market, exchange,
 * nature, wild). They are kept per player and the whole record is saved again on every call, so
 * without this the record grows with everyone who ever played until a save no longer fits.
 * A request still pending is never dropped. The time of settling is noted the first time it is seen.
 */
export function pruneFinishedJobs<Job extends Finished>(jobs: Record<string, Job>, now: number): void {
  for (const owner of Object.keys(jobs)) {
    const job = jobs[owner]
    if (job.phase === "pending") continue
    if (job.doneAt === undefined) jobs[owner] = { ...job, doneAt: now }
    else if (now - job.doneAt > FINISHED_JOB_TTL_MS) delete jobs[owner]
  }
}
