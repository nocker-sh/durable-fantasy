// Where villager sprite frames come from, cheapest first: memory, IndexedDB (frames drawn in an
// earlier visit, keyed by look), baked strips for residents (see maps.ts), and last a pool of
// workers (sprite.worker.ts). The main thread never renders: it asks, gets null until the frame
// arrives, and shows a stand-in meanwhile. The most recently asked, most urgent request goes next.
import { ANIMS, type Anim, type Item, type Look } from "./figure"
import type { FrameDone, FrameJob } from "./sprite.worker"
import { lookKey } from "./sprite-key"

export { lookKey }

/** Bump when the renderer's output changes, so frames kept in IndexedDB are drawn again. */
const RENDER_VERSION = 2

type Listener = (frame: ImageBitmap) => void
interface Pending {
  job: FrameJob
  score: number
  listeners: Listener[]
}

const ready = new Map<string, ImageBitmap>()
const pending = new Map<string, Pending>()
const running = new Map<string, Pending>()
const idle: Worker[] = []
let workers: Worker[] | null = null
/** grows every animation frame, so fresh requests outrank stale ones */
let clock = 0

function start() {
  if (workers) return
  const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1))
  workers = Array.from({ length: n }, () => {
    const w = new Worker(new URL("./sprite.worker.ts", import.meta.url), { type: "module" })
    w.onmessage = (event: MessageEvent<FrameDone>) => {
      const { key, bitmap, png } = event.data
      finish(key, bitmap)
      void store(key, png)
      idle.push(w)
      pump()
    }
    return w
  })
  idle.push(...workers)
}

function finish(key: string, bitmap: ImageBitmap) {
  ready.set(key, bitmap)
  const p = running.get(key)
  running.delete(key)
  p?.listeners.forEach((fn) => fn(bitmap))
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
    void load(p.job.key).then((bitmap) => {
      if (bitmap) {
        idle.push(worker)
        finish(p.job.key, bitmap)
        pump()
      } else worker.postMessage(p.job)
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
  const done = ready.get(key)
  if (done) return done
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
  return ready.get(`${id}|${anim}|${view}|${f}`) ?? null
}

export const spritesPending = () => pending.size + running.size

// ---------------------------------------------------------------- baked strips

interface StripLoad {
  url: string
  score: number
  listeners: ((strip: ImageBitmap | null) => void)[]
}
const strips = new Map<string, ImageBitmap | null>()
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
        strips.set(s.url, bitmap)
        s.listeners.forEach((fn) => fn(bitmap))
        pumpStrips()
      })
  }
}

/**
 * A baked strip (every frame of one anim from one view, side by side). Undefined while it loads
 * (it is queued), null if it could not be loaded.
 */
export function bakedStrip(url: string, urgency: number, onReady: (strip: ImageBitmap | null) => void): ImageBitmap | null | undefined {
  if (strips.has(url)) return strips.get(url)
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
