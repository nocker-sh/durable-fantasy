import { hash2 } from "./hash2"
import type { NoiseInput as Props } from "./noise-types"

export function vnoise(props: Props): number {
  const u = props.x * props.scale
  const v = props.y * props.scale
  const iu = Math.floor(u)
  const iv = Math.floor(v)
  const fractionU = u - iu
  const fractionV = v - iv
  const fu = fractionU * fractionU * (3 - 2 * fractionU)
  const fv = fractionV * fractionV * (3 - 2 * fractionV)
  const sample = (a: number, b: number) => hash2(a + 5000, b + 5000, props.seed)
  return sample(iu, iv) * (1 - fu) * (1 - fv) + sample(iu + 1, iv) * fu * (1 - fv) + sample(iu, iv + 1) * (1 - fu) * fv + sample(iu + 1, iv + 1) * fu * fv
}
