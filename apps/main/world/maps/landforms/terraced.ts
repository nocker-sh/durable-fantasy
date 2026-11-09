import { smooth } from "#/lib/engine/smooth"
type Props = Readonly<{ x: number; z: number; edges: readonly number[]; step: number; rampX: number; rampW: number; seed: number }>

/** Terraces stepping up `step` at each of `edges`, with a ramp `rampW` wide at `rampX` running up through them. */
export function terraced(props: Props): number {
  const x = props.x,
    z = props.z,
    edges = props.edges,
    step = props.step,
    rampX = props.rampX,
    rampW = props.rampW,
    seed = props.seed
  const ramp = smooth(rampW + 1, rampW, Math.abs(x - rampX))
  let h = 0
  edges.forEach((e, k) => {
    const at = e + Math.sin(x * 0.45 + k * 1.7 + seed) * 0.6
    const half = 0.16 + ramp * 1.6
    h += step * smooth(at - half, at + half, z)
  })
  return h
}
