// Fresh character walks through real exits and gathers with server distance checks.
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
let page
try {
  page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("エルナ")
  await page.getByRole("button", { name: "この姿で始める" }).click()
  await page.getByRole("button", { name: "町を歩く", exact: true }).click()
  const ready = () => page.waitForFunction(() => window.game?.scene?.ready && game.state.get().loading === null && game.state.get().online === "online", null, { timeout: 180000 })
  await ready()
  const route = await page.evaluate(async () => {
    const { MAPS } = await import("/world/maps/index.ts")
    const start = game.state.get().map.id
    const queue = [[start]]
    const seen = new Set([start])
    while (queue.length) {
      const path = queue.shift()
      const map = path.at(-1)
      if (map === "south-meadow") return path.slice(1)
      for (const warp of MAPS[map].warps)
        if (!seen.has(warp.to.map)) {
          seen.add(warp.to.map)
          queue.push([...path, warp.to.map])
        }
    }
    throw Error("No route to the meadow")
  })
  for (const next of route) {
    await page.evaluate(async (next) => {
      const { MAPS } = await import("/world/maps/index.ts")
      const at = game.scene.playerCell()
      const exits = MAPS[game.state.get().map.id].warps.filter((w) => w.to.map === next)
      exits.sort((a, b) => Math.hypot(a.at[0] - at[0], a.at[1] - at[1]) - Math.hypot(b.at[0] - at[0], b.at[1] - at[1]))
      const cell = exits[0].at
      game.scene.walkTo((cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2)
    }, next)
    await page.waitForFunction((next) => game.state.get().map.id === next, next, { timeout: 120000 })
    await ready()
    console.log("walked to", next)
  }
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
  await page.evaluate(() => game.gather("south-meadow-herbs-1"))
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
  await writeFile("public/tmp/gathering.json", JSON.stringify({ route, result, restored }, null, 2))
  console.log(JSON.stringify({ route, result, restored }))
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
