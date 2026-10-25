// A map's ground picture, cheapest first: memory, IndexedDB (kept from an earlier visit, keyed by
// the map and the painting code itself, so a change to the code paints it afresh), and last painted
// in bands by a few workers at once (ground.worker.ts).
import { PixBuf } from "./pix";
import { GROUND_PX, paintRows } from "./terrain";
import { hasFields, primeFields, setLayout, type Fields } from "./world";
import { layoutOf } from "../maps/layouts.ts";
import type { GroundDone, GroundJob } from "./ground.worker";
import terrainSrc from "./terrain.ts?raw";
import worldSrc from "./world.ts?raw";
import pixSrc from "./pix.ts?raw";
import texturesSrc from "./textures.ts?raw";
import layoutsSrc from "../maps/ground-layouts.ts?raw";
import layoutSrc from "../maps/layout.ts?raw";
// The painter also depends on these reusable calculations; include their source in the cache key.
const engineSources = import.meta.glob<string>(["../../lib/engine/{math,noise,random,polyline,scalar-field}.ts", "../../lib/graphics/pixel-buffer.ts", "./textures/*.ts"], {
  query: "?raw",
  import: "default",
  eager: true,
});

/** what the picture is painted from: if any of it changes, the kept pictures are not used */
const VERSION = hash(terrainSrc + worldSrc + pixSrc + texturesSrc + layoutsSrc + layoutSrc + Object.values(engineSources).join(""));
const memory = new Map<string, Promise<PixBuf>>();

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** The ground of a map; asking twice gives the same picture. Only the map being entered is held in memory. */
export function groundOf(map: string): Promise<PixBuf> {
  let p = memory.get(map);
  if (!p) {
    memory.clear();
    p = load(map).then(
      (kept) =>
        kept ??
        paint(map).then((buf) => {
          void keep(map, buf);
          return buf;
        }),
    );
    memory.set(map, p);
  }
  return p;
}

const kept = new Set<string>();
let queue: Promise<void> = Promise.resolve();
/** Paint a map's ground ahead of time and keep it in IndexedDB (the maps one step away), one map at a time. */
export function prefetchGround(map: string) {
  if (kept.has(map) || memory.has(map)) return;
  kept.add(map);
  queue = queue
    .then(async () => {
      if (memory.has(map) || (await has(map))) return;
      await keep(map, await paint(map, false));
    })
    .catch(() => {});
}

/** `here`: this is the map being entered, so a band whose worker fails may be painted on the main thread (whose layout is this map's). */
function paint(map: string, here = true): Promise<PixBuf> {
  const n = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1));
  const buf = new PixBuf(GROUND_PX, GROUND_PX);
  const band = Math.ceil(GROUND_PX / n);
  return Promise.all(
    Array.from(
      { length: n },
      (_, k) =>
        new Promise<void>((resolve, reject) => {
          const w = new Worker(new URL("./ground.worker.ts", import.meta.url), { type: "module" });
          w.onmessage = (event: MessageEvent<GroundDone>) => {
            buf.data.set(event.data.data, event.data.y0 * GROUND_PX * 4);
            if (event.data.fields) {
              primeFields(layoutOf(map), event.data.fields);
              void keepFields(map, event.data.fields);
            }
            w.terminate();
            resolve();
          };
          const job: GroundJob = { map, y0: k * band, y1: Math.min(GROUND_PX, (k + 1) * band) };
          // a worker that cannot start (its code failed to load) leaves its band to the main thread
          w.onerror = (e) => {
            e.preventDefault();
            w.terminate();
            if (!here) {
              reject(e);
              return;
            }
            try {
              setLayout(layoutOf(map));
              const part = new PixBuf(GROUND_PX, job.y1 - job.y0);
              paintRows(part, job.y0, job.y1);
              buf.data.set(part.data, job.y0 * GROUND_PX * 4);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          w.postMessage(job);
        }),
    ),
  ).then(() => buf);
}

// ---------------------------------------------------------------- IndexedDB
const DB = "df-ground",
  STORE = "ground";
function db(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
async function load(map: string): Promise<PixBuf | null> {
  const d = await db();
  if (!d) return null;
  await loadFields(d, map);
  const data = await new Promise<Uint8ClampedArray | null>((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}`);
    req.onsuccess = () => resolve((req.result as Uint8ClampedArray | undefined) ?? null);
    req.onerror = () => resolve(null);
  });
  if (!data || data.length !== GROUND_PX * GROUND_PX * 4) return null;
  const buf = new PixBuf(GROUND_PX, GROUND_PX);
  buf.data.set(data);
  return buf;
}
/** The plan's fields kept with its ground, put where setLayout finds them. */
function loadFields(d: IDBDatabase, map: string): Promise<void> {
  const l = layoutOf(map);
  if (hasFields(l)) return Promise.resolve();
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(`${map}:${VERSION}:fields`);
    req.onsuccess = () => {
      if (req.result) primeFields(l, req.result as Fields);
      resolve();
    };
    req.onerror = () => resolve();
  });
}
async function keepFields(map: string, f: Fields) {
  const d = await db();
  d?.transaction(STORE, "readwrite").objectStore(STORE).put(f, `${map}:${VERSION}:fields`);
}

async function has(map: string): Promise<boolean> {
  const d = await db();
  if (!d) return false;
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).count(`${map}:${VERSION}`);
    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => resolve(false);
  });
}
async function keep(map: string, buf: PixBuf) {
  const d = await db();
  if (!d) return;
  const tx = d.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  // only this version is kept: older pictures of every map go
  const all = store.getAllKeys();
  all.onsuccess = () => {
    for (const k of all.result) if (!String(k).includes(`:${VERSION}`)) store.delete(k);
    store.put(buf.data, `${map}:${VERSION}`);
  };
}
