import { chromium } from "playwright-core"
import { mkdir } from "node:fs/promises"
import { createCharacter } from "#resources/scripts/lib/create-character"

const browser = await chromium.launch({ channel: "chrome", args: ["--disable-http2"] })
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    const NativeWorker = window.Worker
    const faults = { construction: 0, execution: 0 }
    window.spriteWorkerFaults = faults
    window.Worker = class extends NativeWorker {
      constructor(url, options) {
        const sprite = String(url).includes("sprite.worker")
        if (sprite && !faults.construction) {
          faults.construction++
          throw Error("Test worker construction failure")
        }
        super(url, options)
        this.sprite = sprite
      }
      postMessage(...args) {
        if (this.sprite && !faults.execution) {
          faults.execution++
          queueMicrotask(() => this.dispatchEvent(new Event("error")))
          return
        }
        return super.postMessage(...args)
      }
    }
  })
  await createCharacter(page)
  await page.evaluate(async () => {
    const { LOOKS } = await import("/world/game")
    const { spriteFrame } = await import("/world/scene/sprite-pool")
    await new Promise((resolve, reject) => {
      let poll
      const deadline = setTimeout(() => {
        clearInterval(poll)
        reject(Error("Character frame did not recover"))
      }, 30000)
      const ready = () => {
        clearTimeout(deadline)
        clearInterval(poll)
        resolve()
      }
      const request = () => {
        if (spriteFrame(LOOKS[0].look, null, "idle", 0, 0, 10000, ready)) ready()
      }
      poll = setInterval(request, 100)
      request()
    })
    if (spriteWorkerFaults.construction !== 1 || spriteWorkerFaults.execution !== 1) throw Error("Worker faults were not exercised")
  })
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/sprite-worker-recovery.png" })
  if (errors.length) throw Error(errors.join("\n"))
  console.log("Created a character and rendered a frame after worker construction and execution failures")
} finally {
  await browser.close()
}
