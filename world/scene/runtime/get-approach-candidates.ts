import { getIntegerRange } from "#/lib/engine/get-integer-range"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{ from: V2; at: V2; radii: readonly number[]; normalize?: boolean }>
const steps = getIntegerRange(0, 8)

/** 来た側から左右へ交互に探し、近い半径を使い切ってから外側へ進む。 */
export function* getApproachCandidates(props: Props): Generator<V2> {
  const dx = props.from[0] - props.at[0]
  const dz = props.from[1] - props.at[1]
  const scale = props.normalize ? Math.hypot(dx, dz) || 1 : 1
  const angle = Math.atan2(dz / scale, dx / scale)
  for (const radius of props.radii)
    for (const step of steps) {
      const turn = angle + (step % 2 ? 1 : -1) * Math.ceil(step / 2) * (Math.PI / 4)
      yield [props.at[0] + Math.cos(turn) * radius, props.at[1] + Math.sin(turn) * radius]
    }
}
