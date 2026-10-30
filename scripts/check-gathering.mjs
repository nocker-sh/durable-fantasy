// Fresh character walks through real exits and gathers with server distance checks.
import { configureCpu } from "#resources/scripts/lib/configure-cpu"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { waitReady } from "#resources/scripts/lib/wait-ready"
import { walkToMap } from "#resources/scripts/lib/walk-to-map"
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
let page
try {
  page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const cpuSlowdown = await configureCpu(page)
  console.log(`CPU slowdown: ${cpuSlowdown}`)
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await createCharacter(page)
  const ready = () => waitReady(page)
  const route = await walkToMap(page, "south-meadow")
  const before = await page.evaluate(() => game.state.get().player.life.foraging)
  await page.evaluate(() => game.scene.walkTo(30.5 / 2, 67.5 / 2))
  await page.waitForFunction(
    () => {
      const at = game.scene.playerCell()
      return at && Math.hypot(at[0] - 30, at[1] - 66) <= 2 && !game.scene.player().walking
    },
    null,
    { timeout: 120000 },
  )
  const gathered = await page.evaluate(() => game.gather("south-meadow-herbs-1"))
  if (!gathered) {
    const state = await page.evaluate(() => ({
      busy: game.state.get().busy,
      engaged: game.session.engaged !== null,
      online: game.state.get().online,
      notices: game.state.get().notices.map((n) => n.text),
    }))
    throw Error(`Gathering was not accepted: ${JSON.stringify(state)}`)
  }
  await page.waitForFunction((before) => game.state.get().player.life.foraging > before, before, { timeout: 15000 })
  const result = await page.evaluate(() => ({
    map: game.state.get().map.id,
    cell: game.scene.playerCell(),
    life: game.state.get().player.life.foraging,
    herbs: game.state
      .get()
      .player.bag.filter((s) => s?.item === "herb")
      .reduce((n, s) => n + s.count, 0),
  }))
  if (result.herbs < 1) throw Error("No herb received")
  await page.reload()
  await ready()
  const restored = await page.evaluate(() => ({
    map: game.state.get().map.id,
    life: game.state.get().player.life.foraging,
    herbs: game.state
      .get()
      .player.bag.filter((s) => s?.item === "herb")
      .reduce((n, s) => n + s.count, 0),
  }))
  if (restored.map !== result.map || restored.life !== result.life || restored.herbs !== result.herbs) throw Error("Gathering progress did not persist")
  if (errors.length) throw Error(errors.join("\n"))
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/gathering.png" })
  await writeFile("public/tmp/gathering.json", JSON.stringify({ cpuSlowdown, route, result, restored }, null, 2))
  console.log(JSON.stringify({ cpuSlowdown, route, result, restored }))
} catch (error) {
  await mkdir("public/tmp", { recursive: true })
  await page?.screenshot({ path: "public/tmp/gathering-failure.png" })
  console.error(
    await page?.evaluate(() => (window.game ? { map: game.state.get().map, cell: game.scene?.playerCell(), loading: game.state.get().loading, notices: game.state.get().notices } : { game: false })),
  )
  throw error
} finally {
  await browser.close()
}
