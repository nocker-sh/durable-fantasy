import { readRuntimeModuleUrl } from "#resources/scripts/lib/read-runtime-module-url"
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
  const modules = await Promise.all(["/world/town/travellers", "/world/scene/sprite-frame"].map((path) => readRuntimeModuleUrl(page, path)))
  await page.evaluate(async (modules) => {
    const travellers = await import(modules[0])
    const sprites = await import(modules[1])
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
        if (sprites.spriteFrame({ look: travellers.LOOKS[0].look, item: null, anim: "idle", view: 0, f: 0, urgency: 10000, onReady: ready })) ready()
      }
      poll = setInterval(request, 100)
      request()
    })
    if (spriteWorkerFaults.construction !== 1 || spriteWorkerFaults.execution !== 1) throw Error("Worker faults were not exercised")
  }, modules)
  await mkdir("public/tmp", { recursive: true })
  await page.screenshot({ path: "public/tmp/sprite-worker-recovery.png" })
  if (errors.length) throw Error(errors.join("\n"))
  console.log("Created a character and rendered a frame after worker construction and execution failures")
} finally {
  await browser.close()
}
