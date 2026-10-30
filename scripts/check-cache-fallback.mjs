// An optional graphics cache that never answers must not prevent entry or resuming.
import { chromium } from "playwright-core"
import { mkdir } from "node:fs/promises"
import { createCharacter } from "#resources/scripts/lib/create-character"
import { waitReady } from "#resources/scripts/lib/wait-ready"
const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", { value: { open: () => ({}) }, configurable: true })
  })
  await createCharacter(page)
  // Ask for a real generated frame and wait for its worker result, not just scene readiness.
  await page.evaluate(async () => {
    const { LOOKS } = await import("/world/game")
    const { spriteFrame } = await import("/world/scene/sprite-pool")
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error("Character frame did not render without cache")), 30000)
      const ready = () => {
        clearTimeout(timer)
        resolve()
      }
      if (spriteFrame(LOOKS[0].look, null, "idle", 0, 0, 10000, ready)) ready()
    })
  })
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/cache-fallback.png" })
  await page.reload()
  await waitReady(page)
  if (await page.evaluate(() => game.state.get().player.name !== "エルナ" || !game.state.get().player.profileComplete)) throw Error("Character did not resume")
  if (errors.length) throw Error(errors.join("\n"))
  console.log("Created, rendered a character frame and resumed with an unresponsive graphics cache")
} finally {
  await browser.close()
}
