import type { DoorSwing } from "#/scripts/lib/door-swing"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"

/** A clear leaf does not imply a clear body path while another person uses nearby furniture. */
type Props = {
  swing: DoorSwing
  operation: DoorOperation
  furniture: readonly { symbol: string; use_space?: { rect: number[] }[] }[]
  scale: number
}

export function auditOperatorSpaces(props: Props): string[] {
  const errors: string[] = [],
    waits = props.operation.waits_for ?? [],
    keys = new Set(waits.map((wait) => `${wait.furniture}/${wait.space_index}`))
  const overlaps = new Set<string>()
  for (const item of props.furniture)
    for (const entry of (item.use_space ?? []).entries()) {
      const index = entry[0]
      const space = entry[1]
      if (
        operatorRectDistance(
          props.swing,
          props.operation,
          space.rect.map((value) => value * props.scale),
        ) <
        props.operation.body_radius_m - 1e-9
      )
        overlaps.add(`${item.symbol}/${index}`)
    }
  if (keys.size !== waits.length) errors.push("operator has a duplicate waiting condition")
  for (const key of keys) if (!overlaps.has(key)) errors.push(`operator waiting condition has no conflicting space ${key}`)
  for (const key of overlaps) if (!keys.has(key)) errors.push(`operator path conflicts with operating space ${key}`)
  return errors
}
