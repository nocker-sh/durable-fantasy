import { getBridgeDeckHeight } from "#/world/maps/ground/get-bridge-deck-height"
import { layout } from "#/world/scene/world"
import { groundH } from "#/world/scene/ground-h"

export function bridgeDeckH(x: number): number {
  return getBridgeDeckHeight({ x, bridge: layout.value.bridge, groundHeight: groundH })
}
