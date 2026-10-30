// Every outdoor map by day and by night, from where you come in, zoomed out: for checking how
// the maps look (town.md). Writes PNGs to ~/Pictures/durable-fantasy-maps/ and small JPEGs for
// /dev/maps/<id> to public/dev/maps/. Run with the dev server up: bun scripts/shoot-maps.ts [map …]
import { mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { chromium } from "playwright-core"
import { MAPS } from "../world/maps/index"

const BASE = process.env.BASE ?? "https://durable-fantasy.localhost"
const out = join(homedir(), "Pictures", "durable-fantasy-maps"),
  dev = join(import.meta.dir, "..", "public", "dev", "maps")
mkdirSync(out, { recursive: true })
mkdirSync(dev, { recursive: true })
const only = process.argv.slice(2)
const maps = Object.values(MAPS).filter((m) => m.kind !== "indoor" && (!only.length || only.includes(m.id)))
const browser = await chromium.launch({
  headless: false,
  channel: "chrome",
  args: ["--use-angle=metal", "--window-size=1280,860", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
})
for (const m of maps)
  for (const entry of [
    ["day", "12:00"],
    ["night", "21:00"],
  ] as const) {
    const when = entry[0]
    const time = entry[1]

    // a fresh page each time: a running game page is slow to let go of
    const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
    const xState = [m.size / 4, m.size / 4],
      x = xState[0],
      z = xState[1]
    for (let tries = 0; tries < 3; tries++) {
      await page.goto(`${BASE}/?map=${m.id}&x=${x}&z=${z}&time=${time}`, { waitUntil: "domcontentloaded" })
      if (
        await page
          .waitForFunction(() => document.body.dataset.ready === "1", undefined, { timeout: 60_000 })
          .then(
            () => true,
            () => false,
          )
      )
        break
      console.log(m.id, when, "not ready, again")
    }
    // the screen between maps gone
    await page.waitForFunction(() => !document.querySelector(".z-\\[90\\]"), undefined, { timeout: 30_000 }).catch(() => console.log(m.id, when, "cover still up"))
    // the windows out of the way, and the view pulled back
    for (let i = 0; i < 4; i++) await page.keyboard.press("Escape")
    await page.mouse.move(640, 400)
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 300)
      await page.waitForTimeout(250)
    }
    // the log and the chat out of the picture
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("*")) {
        if (el.children.length || !/^(システムログ|チャット)$/.test(el.textContent ?? "")) continue
        const buttons = el.parentElement?.querySelectorAll("button") ?? []
        ;(buttons[buttons.length - 1] as HTMLElement | undefined)?.click()
      }
    })

    await page.waitForTimeout(3000)
    await page.screenshot({ path: join(out, `${m.id}-${when}.png`) })
    await page.screenshot({ path: join(dev, `${m.id}-${when}.jpg`), type: "jpeg", quality: 70 })
    console.log(m.id, when)
    await page.close()
  }
await browser.close()
