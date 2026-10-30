import { join } from "node:path"
import { withScopedCleanup } from "#/lib/engine/with-scoped-cleanup"
import { renderSpriteBakeJob } from "#/scripts/bake/render-sprite-bake-job"
import type { SpriteBakePageContext as Props } from "#/scripts/bake/types"

export async function renderSpriteBakePage(props: Props): Promise<void> {
  const context = await props.browser.newContext({ ignoreHTTPSErrors: true })
  return withScopedCleanup(
    async () => {
      const page = await context.newPage()
      await page.route("**/__bake", (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html>" }))
      await page.goto(new URL("/__bake", props.serverUrl).href)
      for (const job of props.jobs.filter((_job, index) => index % props.pageCount === props.pageIndex)) {
        await renderSpriteBakeJob({ ...props, page, job, pngPath: join(props.temporaryDirectory, `${props.pageIndex}.png`) })
        props.onDone()
      }
    },
    () => context.close(),
  )
}
