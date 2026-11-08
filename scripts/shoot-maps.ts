// Every map as the studio's /view draws it, for its /maps/<id> page: outdoor maps by day, by night and from the far
// side, rooms whole and close. Writes JPEGs to public/dev/maps/<id>-<view>.jpg (kept out of git).
// Heavy (a browser per picture): run it on a cloud machine, not on the Mac you play on.
// With the dev server up: node scripts/shoot-maps.ts [map …]
// BASE: the dev server (https://dev.durable-fantasy.localhost); CHROME: a Chromium to use instead of Chrome.
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright-core"

const BASE = process.env.BASE ?? "https://dev.durable-fantasy.localhost"
const dev = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "dev", "maps")
mkdirSync(dev, { recursive: true })

/** What each kind of map is shot as; the same views as SHOTS in dev/sheets/maps.tsx. */
const OUTDOOR = [
  { view: "day", query: "time=12:00&zoom=0" },
  { view: "night", query: "time=21:00&zoom=0" },
  { view: "back", query: "time=12:00&zoom=0&turn=4" },
]
const INDOOR = [
  { view: "whole", query: "time=12:00&zoom=1" },
  { view: "close", query: "time=12:00&zoom=2" },
]
// the meeting hall is too big for the room views above
const BIG_ROOM = [
  { view: "whole", query: "time=12:00&zoom=0" },
  { view: "close", query: "time=12:00&zoom=1" },
]

const browser = await chromium.launch({
  ...(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: "chrome" }),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
})
// the maps, as the dev server has them
const list = await browser.newPage({ ignoreHTTPSErrors: true })
await list.goto(`${BASE}/view?map=-&ui=0`, { waitUntil: "domcontentloaded" })
await list.waitForFunction(() => document.body.dataset.ready === "missing", undefined, { timeout: 120_000 })
const all: { id: string; kind: string }[] = await list.evaluate(async () => {
  const { MAPS } = await import("/world/maps/index.ts")
  return Object.values(MAPS as Record<string, { id: string; kind: string }>).map((m) => ({ id: m.id, kind: m.kind }))
})
await list.close()
const only = process.argv.slice(2)
const maps = all.filter((m) => !only.length || only.includes(m.id))
for (const m of maps) {
  const shots = m.kind !== "indoor" ? OUTDOOR : m.id.startsWith("phanthiet-in-h-m5") ? BIG_ROOM : INDOOR
  for (const shot of shots) {
    const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
    await page.goto(`${BASE}/view?map=${m.id}&${shot.query}&blur=0&ui=0`, { waitUntil: "domcontentloaded" })
    const ready = await page
      .waitForFunction(() => document.body.dataset.ready === "1", undefined, { timeout: 240_000 })
      .then(
        () => true,
        () => false,
      )
    await page.waitForTimeout(1500)
    await page.screenshot({ path: join(dev, `${m.id}-${shot.view}.jpg`), type: "jpeg", quality: 84 })
    console.log(m.id, shot.view, ready ? "" : "(not ready)")
    await page.close()
  }
}
await browser.close()
