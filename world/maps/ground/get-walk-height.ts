import { inRect } from "#/lib/engine/in-rect"
import { getBridgeDeckHeight } from "#/world/maps/ground/get-bridge-deck-height"
import type { Rect } from "#/world/maps/layout-types"
import type { HeightSampler, WalkSurface } from "#/world/maps/ground/types"

type Props = Readonly<{ x: number; z: number; bridge: Readonly<Rect>; groundHeight: HeightSampler; surfaces: readonly WalkSurface[] }>

/** All registered walk surfaces participate, including surfaces above the bridge deck. */
export function getWalkHeight(props: Props): number {
  const height = { value: props.groundHeight(props.x, props.z) }
  if (inRect({ x: props.x, z: props.z, r: props.bridge })) height.value = Math.max(height.value, getBridgeDeckHeight({ x: props.x, bridge: props.bridge, groundHeight: props.groundHeight }))
  for (const surface of props.surfaces) {
    if (props.x >= surface.rect[0] && props.x < surface.rect[2] && props.z >= surface.rect[1] && props.z < surface.rect[3]) height.value = Math.max(height.value, surface.height)
  }
  return height.value
}
