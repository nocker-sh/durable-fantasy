// Measure scene entry through the real client and server, without speculative loading.
// Direct entry excludes the preceding warp request; it does not measure walking across an exit.
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"

const base = process.env.BASE ?? "https://durable-fantasy.localhost"
const maps = process.argv.slice(2)
if (!maps.length) maps.push("deep-forest", "south-meadow", "phanthiet-market")
if (maps.length < 2 || new Set(maps).size !== maps.length || maps.includes("phanthiet")) throw Error("Choose at least two distinct maps, excluding the initial town phanthiet")
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
const results = []
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  let disabledPrefetch = false
  await page.route("**/world/scene/ground.ts*", async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const changed = source.replace(/function prefetchGround\(map\)\s*\{/, "$& return;")
    if (changed !== source) disabledPrefetch = true
    await route.fulfill({ response, body: changed })
  })
  await page.goto(`${base}/?map=phanthiet`)
  const waitReady = () =>
    page.waitForFunction(() => window.game?.scene?.runtime?.running && window.game.state.get().loading === null && window.game.state.get().online === "online", null, { timeout: 180000 })
  await waitReady()
  if (!disabledPrefetch) throw Error("Could not disable ground prefetch; timings would be misleading")
  // Close any speculative socket and prevent future room preconnections.
  await page.evaluate(() => {
    window.game.session.rooms.take("phanthiet", 1)
    window.game.session.rooms.standBy = () => {}
  })
  // A fresh browser context has no persistent ground cache. Revisit after a different map
  // to measure the persistent cache, rather than just the current-map memory entry.
  for (const visit of ["cold", "revisit"]) {
    for (const map of maps) {
      if ((await page.evaluate(() => window.game.state.get().map.id)) === map) throw Error("Choose distinct maps, excluding the initial town")
      await page.evaluate((id) => {
        window.__loadStart = performance.now()
        window.game.enterMap(id, null)
      }, map)
      await waitReady()
      const result = await page.evaluate(() => ({
        map: window.game.state.get().map.id,
        observedMs: Math.round(performance.now() - window.__loadStart),
        laps: window.__laps.at(-1),
      }))
      if (result.map !== map) throw Error(`Unexpected map: ${result.map}`)
      results.push({ visit, ...result })
      console.log(JSON.stringify(results.at(-1)))
    }
  }
  if (errors.length) throw Error(errors.join("\n"))
  await mkdir("public/tmp", { recursive: true })
  await writeFile("public/tmp/map-loading.json", JSON.stringify({ scope: "direct entry; no ground prefetch or room preconnection; local browser", results }, null, 2))
} finally {
  await browser.close()
}
