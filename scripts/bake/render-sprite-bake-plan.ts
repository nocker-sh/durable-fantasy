import { assertSpriteWebpEncoder } from "./assert-sprite-webp-encoder"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { withScopedCleanup } from "#/lib/engine/with-scoped-cleanup"
import { renderSpriteBakeBrowser } from "./render-sprite-bake-browser"
import type { SpriteBakePageContext } from "./types"
type Props = Omit<SpriteBakePageContext, "browser" | "pageIndex" | "temporaryDirectory" | "onDone"> & Readonly<{ prepare: () => void }>

export async function renderSpriteBakePlan(props: Props): Promise<void> {
  assertSpriteWebpEncoder()
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "sprite-bake-"))
  const progress = { done: 0 }
  await withScopedCleanup(
    () =>
      renderSpriteBakeBrowser({
        ...props,
        temporaryDirectory,
        onDone: () => {
          if (++progress.done % 50 === 0) console.log(`${progress.done}/${props.jobs.length}`)
        },
      }),
    () => rmSync(temporaryDirectory, { recursive: true, force: true }),
  )
}
