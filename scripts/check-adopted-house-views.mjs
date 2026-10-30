import { chromium } from "playwright-core"
const browser = await chromium.launch({ channel: "chrome" })
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } })
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
await page.addInitScript(() => {
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => raf(() => cb(15200))
})
try {
  for (const id of ["h10", "h-m5"]) {
    await page.goto(`http://127.0.0.1:4027/dev/houses/${id}`)
    await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 180000 })
    await page.locator('canvas[data-ready="1"]').evaluate((c) => {
      Object.assign(c.parentElement.style, { height: "1000px", maxHeight: "none", aspectRatio: "auto" })
    })
    for (const night of [false, true]) {
      await page.getByRole("checkbox", { name: "夜の照明" }).setChecked(night)
      await page.locator('canvas[data-ready="1"]').waitFor({ timeout: 60000 })
      await page.locator('canvas[data-ready="1"]').screenshot({ path: `public/tmp/checks/${id}-adopted-${night ? "night" : "day"}.png` })
    }
  }
  if (errors.length) throw new Error(JSON.stringify(errors))
  console.log("Both adopted hall and reachable prayer table: day/night views, no page errors")
} finally {
  await browser.close()
}
