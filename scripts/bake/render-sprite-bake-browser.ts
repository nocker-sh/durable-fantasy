import { chromium } from "playwright-core"
import { withScopedCleanup } from "#/lib/engine/with-scoped-cleanup"
import { renderSpriteBakePages } from "#/scripts/bake/render-sprite-bake-pages"
import type { SpriteBakePageContext } from "#/scripts/bake/types"

type Props = Omit<SpriteBakePageContext, "browser" | "pageIndex"> & Readonly<{ prepare: () => void }>

/** ブラウザーを確保してから出力を準備し、全ページの終了後に閉じる。 */
export async function renderSpriteBakeBrowser(props: Props): Promise<void> {
  const browser = await chromium.launch()
  await withScopedCleanup(
    async () => {
      props.prepare()
      await renderSpriteBakePages({ ...props, browser })
    },
    () => browser.close(),
  )
}
