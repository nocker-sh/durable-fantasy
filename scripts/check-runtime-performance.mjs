// Real local session: create a character, then measure an idle town and keyboard input.
// CPU throttling does not emulate a slow GPU, limited memory or a mobile device.
import { chromium } from "playwright-core"
import { mkdir, writeFile } from "node:fs/promises"

const seconds = Number(process.env.SAMPLE_SECONDS ?? 15)
if (!Number.isFinite(seconds) || seconds < 5) throw Error("SAMPLE_SECONDS must be at least 5")
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => {
    errors.push(error.message)
    console.error(error.message)
  })
  await page.goto(process.env.BASE ?? "https://durable-fantasy.localhost")
  await page.getByRole("dialog", { name: "キャラクターを作る" }).waitFor({ timeout: 180000 })
  await page.waitForFunction(() => window.game?.state.get().loading === null, null, { timeout: 180000 })
  await page.getByRole("textbox", { name: "名前", exact: true }).fill("エルナ")
  await page.getByRole("button", { name: "この姿で始める" }).click()
  await page.getByRole("button", { name: "町を歩く", exact: true }).click()
  console.log("Character created; town ready")
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Performance.enable")
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]))
  const results = []
  for (const rate of [1, 4]) {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate })
    await page.waitForTimeout(2000)
    const before = await metrics()
    const sample = await page.evaluate(async (seconds) => {
      const frames = []
      const start = performance.now()
      while (performance.now() - start < seconds * 1000) {
        if (game.state.get().online !== "online" || !game.scene.runtime.running) throw Error("Session stopped during sampling")
        frames.push(game.scene.fps())
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      const summary = (values) => {
        const sorted = [...values].sort((a, b) => a - b)
        return { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], max: sorted.at(-1) }
      }
      return { map: game.state.get().map.id, samples: frames.length, fps: summary(frames) }
    }, seconds)
    const after = await metrics()
    // Wall time includes the automation round trip; this is not an INP measurement.
    const started = performance.now()
    await page.keyboard.press("i")
    await page.getByText("持ち物", { exact: true }).first().waitFor()
    const inventoryMs = Math.round(performance.now() - started)
    await page.keyboard.press("Escape")
    const position = await page.evaluate(() => game.scene.playerCell())
    await page.keyboard.down("ArrowRight")
    try {
      await page.waitForFunction((at) => game.scene.playerCell().some((v, i) => v !== at[i]), position, { timeout: 10000 })
    } finally {
      await page.keyboard.up("ArrowRight")
    }
    await page.waitForFunction(() => !game.scene.player().walking)
    const result = { cpuSlowdown: rate, ...sample, mainThreadBusyPercent: 100 * (after.TaskDuration - before.TaskDuration) / (after.Timestamp - before.Timestamp), inventoryMs, movement: "passed" }
    results.push(result)
    console.log(JSON.stringify(result))
  }
  if (errors.length) throw Error(errors.join("\n"))
  await mkdir("public/tmp", { recursive: true })
  await writeFile("public/tmp/runtime-performance.json", JSON.stringify({ scope: "local development server; idle town; keyboard inventory and movement; CPU throttling only", browser: browser.version(), viewport: { width: 1280, height: 800 }, seconds, results }, null, 2))
} finally {
  await browser.close()
}
