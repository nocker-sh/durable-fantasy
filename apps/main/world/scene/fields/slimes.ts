import * as THREE from "three"
const SLIME_COLOURS = [0x6ab0a0, 0x8ac06a, 0x6a9ac8, 0xc8a06a]

import { critters } from "#/world/scene/critters"
import { Slime } from "#/world/scene/fields/slime"

type Props = {
  root: THREE.Group
  count: number
  area: [number, number, number, number]
  seed: number
}

export function slimes(props: Props) {
  for (const i = { value: 0 }; i.value < props.count; i.value++)
    critters.push(new Slime({ root: props.root, area: props.area, seed: props.seed + i.value, color: SLIME_COLOURS[(props.seed + i.value) % SLIME_COLOURS.length] }))
}
