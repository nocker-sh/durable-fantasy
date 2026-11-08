import { blocked, blockedBy } from "#/world/scene/world"
import { WR, WN } from "#/world/maps/ground/rules"
import { who } from "#/world/scene/helpers/world/who"

type Props = {
  x0: number
  z0: number
  x1: number
  z1: number
}

export function blockRect(props: Props) {
  const by = who()
  for (const j = { value: Math.floor(props.z0 * WR) }; j.value < Math.ceil(props.z1 * WR); j.value++)
    for (const i = { value: Math.floor(props.x0 * WR) }; i.value < Math.ceil(props.x1 * WR); i.value++)
      if (i.value >= 0 && j.value >= 0 && i.value < WN && j.value < WN) {
        blocked[j.value * WN + i.value] = 1
        if (by) blockedBy.set(j.value * WN + i.value, by)
      }
}
