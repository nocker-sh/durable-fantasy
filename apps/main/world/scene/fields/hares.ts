import * as THREE from "three"
import { critters } from "#/world/scene/critters"
import { Hare } from "#/world/scene/fields/hare"

type Props = {
  root: THREE.Group
  count: number
  area: [number, number, number, number]
  seed: number
}

export function hares(props: Props) {
  for (const i = { value: 0 }; i.value < props.count; i.value++) critters.push(new Hare(props.root, props.area, props.seed + i.value))
}
