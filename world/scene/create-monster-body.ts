import { hareBody } from "#/world/scene/fields/hare-body"
import { slimeBody } from "#/world/scene/fields/slime-body"
import type { MonsterKind } from "#/world/core/monster-types"
import type { Group } from "three"
type Props = Pick<MonsterKind, "look" | "color" | "size">

/** The live scene and definition viewer use the same archetype, palette and authored scale. */
export function createMonsterBody(kind: Props): Group {
  if (kind.look === "slime") {
    const body = slimeBody(kind.color ?? 0x8ac06a)
    body.scale.setScalar(kind.size ?? 1)
    return body
  }

  const body = hareBody(kind.color)
  body.scale.setScalar(kind.size ?? 1)
  return body
}
