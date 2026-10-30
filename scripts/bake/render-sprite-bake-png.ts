import { FW, FH } from "#/world/scene/figure/render"
import { FRAMES } from "#/world/scene/figure/animation"
import { buildSheetStrip } from "#/world/scene/figure/build-sheet-strip"
import { RESIDENTS, RESIDENT_LOOKS, RESIDENT_ANIMS } from "#/world/town/residents"
import { lookKey } from "#/world/scene/sprite-key"
import { SPRITE_RENDER_VERSION } from "#/world/scene/sprite-render-version"
import type { SpriteBakeDrawInput } from "#/scripts/lib/sprite-bake-types"

/** ブラウザーの定義が計画と同じ時だけ、元の画素を PNG へ変換する。 */
export async function renderSpriteBakePng(input: SpriteBakeDrawInput): Promise<number[]> {
  const animation = RESIDENT_ANIMS.find((candidate) => candidate === input.anim)
  const resident = RESIDENTS[input.resident]
  const look = RESIDENT_LOOKS[input.resident]
  if (
    !animation ||
    !resident ||
    !look ||
    SPRITE_RENDER_VERSION !== input.rendererVersion ||
    FW !== input.frame[0] ||
    FH !== input.frame[1] ||
    FRAMES[animation] !== input.frames ||
    resident.name !== input.residentName ||
    lookKey(look, resident.item) !== input.lookKey
  )
    throw new Error("Sprite generation inputs changed before drawing")
  const strip = buildSheetStrip({ L: look, anim: animation, item: resident.item, view: input.view })
  const canvas = new OffscreenCanvas(strip.w, strip.h)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Sprite PNG canvas could not be initialized")
  context.putImageData(new ImageData(strip.data, strip.w, strip.h), 0, 0)
  const blob = await canvas.convertToBlob({ type: "image/png" })
  return Array.from(new Uint8Array(await blob.arrayBuffer()))
}
