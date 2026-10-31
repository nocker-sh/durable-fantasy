import type { Browser } from "playwright-core"

type Props = Readonly<{ browser: Browser; base: string; map: string; module: string }>

/** Build a map in an isolated document and always release its browser context. */
export async function readSceneMapSnapshot(props: Props) {
  const context = await props.browser.newContext({ ignoreHTTPSErrors: true })
  try {
    const page = await context.newPage()
    const harness = new URL("/__map-export", props.base).href
    await page.route(harness, (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Map export</title>" }))
    await page.goto(harness)
    return await page.evaluate(
      async (input) => {
        const source: typeof import("#/dev/map-snapshot") = await import(input.module)
        return source.mapSnapshot(input.id)
      },
      { id: props.map, module: props.module },
    )
  } finally {
    await context.close()
  }
}
