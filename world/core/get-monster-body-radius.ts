import { HARE_BODY_PARTS, SLIME_BODY_RADIUS, SLIME_MOVING_SQUASH, SLIME_RESTING_SQUASH } from "#/world/core/monster-body-shapes"
import type { MonsterKind } from "#/world/core/monster-types"
type Props = { kind: Pick<MonsterKind, "look" | "size"> }
/** Covers every yaw and registered squash phase; Float32 vertex storage gets an outward rounding allowance. */
export function getMonsterBodyRadius(props: Props): number | Error {
  const size = props.kind.size ?? 1
  if (!Number.isFinite(size) || size <= 0) return new Error("Invalid monster body size")

  const rounding = 1 + 2 ** -22
  if (props.kind.look === "slime") return (SLIME_BODY_RADIUS * size * rounding) / Math.sqrt(1 - Math.max(SLIME_MOVING_SQUASH, SLIME_RESTING_SQUASH))
  const radii = HARE_BODY_PARTS.map((part) => Math.hypot(Math.abs(part.position[0]) + part.dimensions[0] / 2, Math.abs(part.position[2]) + part.dimensions[2] / 2))
  return Math.max(...radii) * size * rounding
}
