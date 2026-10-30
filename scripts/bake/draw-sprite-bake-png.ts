import type { Page } from "playwright-core"
import type { SpriteBakeDrawInput } from "../lib/sprite-bake-types"

export async function drawSpriteBakePng(page: Page, input: SpriteBakeDrawInput): Promise<number[]> {
  return page.evaluate(async (measured) => {
    const renderer = await import("/scripts/bake/render-sprite-bake-png")
    return renderer.renderSpriteBakePng(measured)
  }, input)
}
