// Where villager sprite frames come from, cheapest first: memory, IndexedDB (frames drawn in an
// earlier visit, keyed by look), baked strips for residents (see maps.ts), and last a pool of
// workers (sprite.worker.ts). The main thread never renders: it asks, gets null until the frame
// arrives, and shows a stand-in meanwhile. The most recently asked, most urgent request goes next.
import { OptionalCacheAccess } from "../../lib/engine/optional-cache-access.ts"
import { BitmapCache } from "../../lib/graphics/bitmap-cache.ts"
import { ANIMS, type Anim, type Item, type Look } from "./figure"
import type { FrameResult, FrameJob } from "./sprite.worker"
import { lookKey } from "./sprite-key"

export { lookKey }

/** Bump when the renderer's output changes, so frames kept in IndexedDB are drawn again. */
const RENDER_VERSION = 2
const cacheReads = new OptionalCacheAccess(5000)
const cacheWrites = new OptionalCacheAccess(5000)

type Listener = (frame: ImageBitmap) => void
interface Pending {
  job: FrameJob
  score: number
  listeners: Listener[]
}

// One budget for decoded frames and baked strips; canvases copy them synchronously.
const decoded = new BitmapCache(64 * 1024 * 1024, 512)
const pending = new Map<string, Pending>()
const running = new Map<string, Pending>()
const idle: Worker[] = []
const failedUntil = new Map<string, number>()
const FRAME_RETRY_MS = 5000
const FAILED_FRAMES = 512
const workers = new Set<Worker>()
const assigned = new Map<Worker, Pending>()
let started = false
/** grows every animation frame, so fresh requests outrank stale ones */
let clock = 0

function start() {
  if (started) return
  started = true
  const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1))
  for (let i = 0; i < n; i++) spawnWorker()
}

function failFrame(key: string) {
  running.delete(key)
  failedUntil.delete(key)
  failedUntil.set(key, performance.now() + FRAME_RETRY_MS)
  if (failedUntil.size > FAILED_FRAMES) failedUntil.delete(failedUntil.keys().next().value!)
}

/** Each lost slot schedules one replacement, even if several error events arrive. */
function retireWorker(worker: Worker) {
  if (!workers.delete(worker)) return
  const index = idle.indexOf(worker)
  if (index !== -1) idle.splice(index, 1)
  const job = assigned.get(worker)
  assigned.delete(worker)
  if (job) failFrame(job.job.key)
  worker.terminate()
  setTimeout(spawnWorker, FRAME_RETRY_MS)
}

function spawnWorker() {
  let worker: Worker
  try {
    worker = new Worker(new URL("./sprite.worker.ts", import.meta.url), { type: "module" })
  } catch {
    setTimeout(spawnWorker, FRAME_RETRY_MS)
    return
  }
  workers.add(worker)
  worker.onerror = () => retireWorker(worker)
  worker.onmessageerror = () => retireWorker(worker)
  worker.onmessage = (event: MessageEvent<FrameResult>) => {
    const result = event.data
    if (!workers.has(worker) || assigned.get(worker)?.job.key !== result.key) {
      if (!("failed" in result)) result.bitmap.close()
      return
    }
    assigned.delete(worker)
    if ("failed" in result) failFrame(result.key)
    else {
      const { key, bitmap, png } = result
      finish(key, bitmap)
      if (png) void cacheWrites.run(() => store(key, png), undefined)
    }
    idle.push(worker)
    pump()
  }
  idle.push(worker)
  pump()
}

function finish(key: string, bitmap: ImageBitmap) {
  const p = running.get(key)
  running.delete(key)
  p?.listeners.forEach((fn) => fn(bitmap))
  decoded.set(`frame:${key}`, bitmap)
}

/** Hand the most urgent waiting frames to free workers, after checking IndexedDB for each. */
function pump() {
  while (idle.length && pending.size) {
    let best: Pending | null = null
    for (const p of pending.values()) if (!best || p.score > best.score) best = p
    const p = best!
    pending.delete(p.job.key)
    running.set(p.job.key, p)
    const worker = idle.pop()!
    assigned.set(worker, p)
    void cacheReads
      .run(
        () => load(p.job.key),
        null,
        (bitmap) => bitmap?.close(),
      )
      .then((bitmap) => {
        // The worker may have failed while its cache read was pending.
        if (assigned.get(worker) !== p) {
          bitmap?.close()
          return
        }
        if (bitmap) {
          assigned.delete(worker)
          idle.push(worker)
          finish(p.job.key, bitmap)
          pump()
        } else {
          try {
            worker.postMessage(p.job)
          } catch {
            retireWorker(worker)
          }
        }
      })
  }
}

// ---------------------------------------------------------------- IndexedDB

let db: Promise<IDBDatabase | null> | null = null
function open(): Promise<IDBDatabase | null> {
  db ??= new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null)
    const req = indexedDB.open("durable-fantasy-sprites", 1)
    req.onupgradeneeded = () => req.result.createObjectStore("frames")
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
  return db
}

async function load(key: string): Promise<ImageBitmap | null> {
  const d = await open()
  if (!d) return null
  const blob = await new Promise<Blob | undefined>((resolve) => {
    const req = d.transaction("frames").objectStore("frames").get(`${RENDER_VERSION}|${key}`)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => resolve(undefined)
  })
  return blob ? createImageBitmap(blob).catch(() => null) : null
}

async function store(key: string, png: Blob) {
  const d = await open()
  d?.transaction("frames", "readwrite").objectStore("frames").put(png, `${RENDER_VERSION}|${key}`)
}

// ---------------------------------------------------------------- frames

/** Call once per animation frame so newer requests win over older ones. */
export function tickSprites() {
  clock++
}

/**
 * The frame if it is ready; otherwise null, and it is queued. `urgency` orders requests made in
 * the same animation frame (higher first); `onReady` runs when the frame arrives.
 */
export function spriteFrame(look: Look, item: Item, anim: Anim, view: number, f: number, urgency = 0, onReady?: Listener, id = lookKey(look, item)): ImageBitmap | null {
  const key = `${id}|${anim}|${view}|${f}`
  const done = decoded.get(`frame:${key}`)
  if (done) return done
  const retryAt = failedUntil.get(key)
  if (retryAt !== undefined) {
    if (performance.now() < retryAt) return null
    failedUntil.delete(key)
  }
  start()
  const score = clock * 1000 + urgency
  const run = running.get(key)
  if (run) {
    if (onReady && !run.listeners.includes(onReady)) run.listeners.push(onReady)
    return null
  }
  const p = pending.get(key)
  if (p) {
    p.score = Math.max(p.score, score)
    if (onReady && !p.listeners.includes(onReady)) p.listeners.push(onReady)
    return null
  }
  pending.set(key, { job: { key, look, anim, spec: ANIMS[anim], item, view, f }, score, listeners: onReady ? [onReady] : [] })
  pump()
  return null
}

/** The frame if it has been drawn, without asking for it. */
export function readyFrame(look: Look, item: Item, anim: Anim, view: number, f: number, id = lookKey(look, item)): ImageBitmap | null {
  return decoded.get(`frame:${id}|${anim}|${view}|${f}`) ?? null
}

export const spritesPending = () => pending.size + running.size

// ---------------------------------------------------------------- baked strips

interface StripLoad {
  url: string
  score: number
  listeners: ((strip: ImageBitmap | null) => void)[]
}
const stripQueue = new Map<string, StripLoad>()
const stripsLoading = new Map<string, StripLoad>()
let loading = 0
const STRIP_FETCHES = 6

function pumpStrips() {
  while (loading < STRIP_FETCHES && stripQueue.size) {
    let best: StripLoad | null = null
    for (const s of stripQueue.values()) if (!best || s.score > best.score) best = s
    const s = best!
    stripQueue.delete(s.url)
    stripsLoading.set(s.url, s)
    loading++
    fetch(s.url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => createImageBitmap(blob))
      .catch(() => null)
      .then((bitmap) => {
        loading--
        stripsLoading.delete(s.url)
        s.listeners.forEach((fn) => fn(bitmap))
        decoded.set(`strip:${s.url}`, bitmap)
        pumpStrips()
      })
  }
}

/**
 * A baked strip (every frame of one anim from one view, side by side). Undefined while it loads
 * (it is queued), null if it could not be loaded.
 */
export function bakedStrip(url: string, urgency: number, onReady: (strip: ImageBitmap | null) => void): ImageBitmap | null | undefined {
  const cached = decoded.get(`strip:${url}`)
  if (cached !== undefined) return cached
  const inflight = stripsLoading.get(url)
  if (inflight) {
    if (!inflight.listeners.includes(onReady)) inflight.listeners.push(onReady)
    return undefined
  }
  const score = clock * 1000 + urgency
  const q = stripQueue.get(url)
  if (q) {
    q.score = Math.max(q.score, score)
    if (!q.listeners.includes(onReady)) q.listeners.push(onReady)
  } else stripQueue.set(url, { url, score, listeners: [onReady] })
  pumpStrips()
  return undefined
}
