// Every /dev page, at 1280 and 768 px wide, must fit its width: nothing scrolls sideways (the page,
// the frame, or any box inside), and nothing pokes out past the frame; and the sidebars stay put
// when the page is scrolled to the bottom. Pages are found from the
// sidebar and each list's first row. Run with the dev server up: bun scripts/dev-overflow.ts
import { openDevPage } from "#/scripts/lib/open-dev-page"
import { monitorPageLoad } from "#/scripts/lib/monitor-page-load"
import { chromium, type Page } from "playwright-core"

const BASE = process.env.BASE ?? "https://durable-fantasy.localhost"
const browser = await chromium.launch()
const page = await browser.newPage({ ignoreHTTPSErrors: true })

const monitor = monitorPageLoad(page)

/** Navigation failures end the check with their original diagnostics. */
async function open(p: Page, url: string) {
  const error = await openDevPage({ page: p, url: BASE + url, failures: monitor.failures })
  if (error) throw new Error(`${url}: ${error.message}`, { cause: error })
}

try {
  const urls: string[] = []
  if (process.env.DEV_PAGE) {
    const pathname = new URL(process.env.DEV_PAGE, BASE).pathname
    if ((process.env.DEV_PAGE !== "/dev" && !process.env.DEV_PAGE.startsWith("/dev/")) || (pathname !== "/dev" && !pathname.startsWith("/dev/")))
      throw new Error("DEV_PAGE must be a local dev page path")
    urls.push(process.env.DEV_PAGE)
  } else {
    await open(page, "/dev")
    const lists: string[] = await page.$$eval('[data-sidebar="menu-button"]', (as) => as.map((a) => a.getAttribute("href")!).filter(Boolean))
    urls.push("/dev", "/dev/studio", "/dev/ui", "/dev/eyes", ...lists)
    for (const list of lists) {
      await open(page, list)
      const first = await page.$$eval("tbody a", (links) => links[0]?.getAttribute("href") ?? null)
      if (first) urls.push(first)
    }
  }

  const bad: string[] = []
  for (const width of [1280, 768]) {
    await page.setViewportSize({ width, height: 800 })
    for (const url of urls) {
      const t = Date.now()
      await open(page, url)
      if (process.env.VERBOSE) console.log(width, decodeURIComponent(url), Date.now() - t, "ms")
      const found: string[] = await page.evaluate(() => {
        const out: string[] = []
        const name = (e: Element) =>
          e.tagName.toLowerCase() +
          (e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : "") +
          (e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0, 3).join(".") : "")
        const doc = document.scrollingElement!
        if (doc.scrollWidth > doc.clientWidth) out.push(`document ${doc.scrollWidth}>${doc.clientWidth}`)
        const inset = document.querySelector('[data-slot="sidebar-inset"]')
        for (const e of [inset, inset?.lastElementChild]) if (e && e.scrollWidth > e.clientWidth + 1) out.push(`${name(e)} ${e.scrollWidth}>${e.clientWidth}`)
        for (const e of document.querySelectorAll("*")) {
          const o = getComputedStyle(e).overflowX
          if ((o === "auto" || o === "scroll") && e.scrollWidth > e.clientWidth + 1) out.push(`${name(e)} ${e.scrollWidth}>${e.clientWidth}`)
        }
        return out
      })
      // the sidebars stay where they are while the page scrolls
      const before = await page.$$eval('[data-slot="sidebar"]', (es) => es.map((e) => e.getBoundingClientRect().top))
      await page.evaluate(() => {
        const inset = document.querySelector('[data-slot="sidebar-inset"]')
        inset?.scrollTo(0, inset.scrollHeight)
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(100)
      const after = await page.$$eval('[data-slot="sidebar"]', (es) => es.map((e) => e.getBoundingClientRect().top))
      if (!before.length) found.push("no sidebar")
      before.forEach((t, i) => {
        if (Math.abs(t - after[i]) > 0.5) found.push(`sidebar ${i} moved ${t}→${after[i]}`)
      })
      for (const f of found) bad.push(`${width} ${decodeURIComponent(url)}: ${f}`)
    }
  }
  console.log(`${urls.length} pages × 2 widths`)
  if (bad.length) {
    throw new Error(bad.join("\n"))
  }
  console.log("no sideways scrolling; sidebars stay put")
} finally {
  monitor.stop()
  await browser.close()
}
