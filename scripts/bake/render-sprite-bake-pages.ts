import { renderSpriteBakePage } from "#/scripts/bake/render-sprite-bake-page"
import type { SpriteBakePageContext } from "#/scripts/bake/types"
type Props = Omit<SpriteBakePageContext, "pageIndex">

/** 全てのページが片付くまで待ち、先頭の失敗で他のページの理由を捨てない。 */
export async function renderSpriteBakePages(props: Props): Promise<void> {
  const outcomes = await Promise.allSettled(Array.from({ length: props.pageCount }, (_unused, pageIndex) => renderSpriteBakePage({ ...props, pageIndex })))
  const errors: unknown[] = outcomes.flatMap((outcome) => (outcome.status === "rejected" ? [outcome.reason] : []))
  if (errors.length === 1) throw errors[0]
  if (errors.length) throw new AggregateError(errors, "Sprite rendering pages failed")
}
