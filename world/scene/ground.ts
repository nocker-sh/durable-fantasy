// A map's ground picture, cheapest first: memory, IndexedDB (kept from an earlier visit, keyed by
// the map and the painting code itself, so a change to the code paints it afresh), and last painted
// in bands by a few workers at once (ground.worker.ts).
import { OptionalCacheAccess } from "../../lib/engine/optional-cache-access.ts"
import { PixBuf } from "./pix"
import { GROUND_PX, paintRows } from "./terrain"
import { hasFields, primeFields, setLayout, currentLayout, type Fields } from "./world"
import { layoutOf } from "../maps/layouts.ts"
import type { GroundDone, GroundJob } from "./ground.worker"
import terrainSrc from "./terrain.ts?raw"
import worldSrc from "./world.ts?raw"
import pixSrc from "./pix.ts?raw"
import texturesSrc from "./textures.ts?raw"
import layoutsSrc from "../maps/ground-layouts.ts?raw"
import layoutSrc from "../maps/layout.ts?raw"
import layoutOfSrc from "../maps/layouts.ts?raw"
// The painter also depends on these reusable calculations; include their source in the cache key.
// (the town's houses too: the ways worn to their doors are painted)
const engineSources = import.meta.glob<string>(["../../lib/engine/{math,noise,random,polyline,scalar-field}.ts", "../../lib/graphics/pixel-buffer.ts", "./textures/*.ts", "../town/houses/*.ts"], {
  query: "?raw",
  import: "default",
  eager: true,
})

/** what the picture is painted from: if any of it changes, the kept pictures are not used */
const VERSION = hash(terrainSrc + worldSrc + pixSrc + texturesSrc + layoutsSrc + layoutSrc + layoutOfSrc + Object.values(engineSources).join(""))
const memory = new Map<string, Promise<PixBuf>>()
const cacheReads = new OptionalCacheAccess(5000)
const cacheWrites = new OptionalCacheAccess(5000)

function hash(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

interface GroundJobState {
  foreground: boolean
  promise: Promise<PixBuf>
}
const active = new Map<string, GroundJobState>()

/** Share loading and painting, including a prefetch promoted to the current map. */
function obtain(map: string, foreground: boolean): Promise<PixBuf> {
  const existing = active.get(map)
  if (existing) {
    existing.foreground ||= foreground
    return existing.promise
  }
  let saving: Promise<void> = Promise.resolve()
  const job: GroundJobState = {
    foreground,
    promise: Promise.resolve()
      .then(async () => {
        const cached = await cacheReads.run(() => load(map), null)
        if (cached) return cached
        const buf = await paint(map, () => job.foreground)
        saving = cacheWrites.run(() => keep(map, buf), undefined)
        return buf
      })
      .finally(() => {
        // Display ready pixels immediately, but share them until persistence finishes.
        void saving.then(() => {
          if (active.get(map) === job) active.delete(map)
        })
      }),
  }
  active.set(map, job)
  return job.promise
}

/** The ground of a map; only the map being entered is retained after loading. */
export function groundOf(map: string): Promise<PixBuf> {
  let p = memory.get(map)
  if (!p) {
    memory.clear()
    p = obtain(map, true)
    memory.set(map, p)
    void p.catch(() => {
      if (memory.get(map) === p) memory.delete(map)
    })
  }
  return p
}

const kept = new Set<string>()
let queue: Promise<void> = Promise.resolve()
/** Prefetch one map at a time. Entering a queued map starts it immediately. */
export function prefetchGround(map: string) {
  if (kept.has(map) || memory.has(map)) return
  kept.add(map)
  queue = queue
    .then(async () => {
      if (!memory.has(map) && !(await cacheReads.run(() => has(map), false))) await obtain(map, false)
    })
    .catch(() => {
      kept.delete(map)
    })
}

/** Only the current map may fall back to main-thread painting if a worker fails. */
function paint(map: string, foreground: () => boolean): Promise<PixBuf> {
  const n = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1))
  const buf = new PixBuf(GROUND_PX, GROUND_PX)
  const band = Math.ceil(GROUND_PX / n)
  return Promise.all(
    Array.from(
      { length: n },
      (_, k) =>
        new Promise<void>((resolve, reject) => {
          const w = new Worker(new URL("./ground.worker.ts", import.meta.url), { type: "module" })
          w.onmessage = (event: MessageEvent<GroundDone>) => {
            buf.data.set(event.data.data, event.data.y0 * GROUND_PX * 4)
            if (event.data.fields) {
              primeFields(layoutOf(map), event.data.fields)
              void cacheWrites.run(() => keepFields(map, event.data.fields!), undefined)
            }
            w.terminate()
            resolve()
          }
          const job: GroundJob = { map, y0: k * band, y1: Math.min(GROUND_PX, (k + 1) * band) }
          // a worker that cannot start (its code failed to load) leaves its band to the main thread
          w.onerror = (e) => {
            e.preventDefault()
            w.terminate()
            if (!foreground()) {
              reject(e)
              return
            }
            const previous = currentLayout()
            try {
              setLayout(layoutOf(map))
              const part = new PixBuf(GROUND_PX, job.y1 - job.y0)
              paintRows(part, job.y0, job.y1)
              buf.data.set(part.data, job.y0 * GROUND_PX * 4)
              resolve()
            } catch (error) {
              reject(error)
            } finally {
              setLayout(previous)
            }
          }
          w.postMessage(job)
        }),
    ),
  ).then(() => buf)
}

// ---------------------------------------------------------------- IndexedDB
const DB = "df-ground",
  STORE = "ground"
let database: Promise<IDBDatabase | null> | null = null
function db(): Promise<IDBDatabase | null> {
  return (database ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => {
        req.result.onversionchange = () => {
          req.result.close()
          database = null
        }
        resolve(req.result)
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  }))
}
async function load(map: string): Promise<PixBuf | null> {
  const d = await db()
  if (!d) return null
  await loadFields(d, map)
  const data = await new Promise<Uint8ClampedArray | null>((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}`)
    req.onsuccess = () => resolve((req.result as Uint8ClampedArray | undefined) ?? null)
    req.onerror = () => resolve(null)
  })
  if (!data || data.length !== GROUND_PX * GROUND_PX * 4) return null
  const buf = new PixBuf(GROUND_PX, GROUND_PX)
  buf.data.set(data)
  return buf
}
/** The plan's fields kept with its ground, put where setLayout finds them. */
function loadFields(d: IDBDatabase, map: string): Promise<void> {
  const l = layoutOf(map)
  if (hasFields(l)) return Promise.resolve()
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}:fields`)
    req.onsuccess = () => {
      if (req.result) primeFields(l, req.result as Fields)
      resolve()
    }
    req.onerror = () => resolve()
  })
}
async function keepFields(map: string, f: Fields) {
  const d = await db()
  d?.transaction(STORE, "readwrite").objectStore(STORE).put(f, `${map}:${VERSION}:fields`)
}

/** Check saved prefetches without decoding their full-size pixel buffers. */
async function has(map: string): Promise<boolean> {
  const d = await db()
  if (!d) return false
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).count(`${map}:${VERSION}`)
    req.onsuccess = () => resolve(req.result > 0)
    req.onerror = () => resolve(false)
  })
}
async function keep(map: string, buf: PixBuf) {
  const d = await db()
  if (!d) return
  const tx = d.transaction(STORE, "readwrite")
  const done = new Promise<void>((resolve) => {
    tx.oncomplete = () => resolve()
    tx.onerror = tx.onabort = () => resolve()
  })
  const store = tx.objectStore(STORE)
  // only this version is kept: older pictures of every map go
  const all = store.getAllKeys()
  all.onsuccess = () => {
    for (const k of all.result) if (!String(k).includes(`:${VERSION}`)) store.delete(k)
    store.put(buf.data, `${map}:${VERSION}`)
  }
  await done
}
