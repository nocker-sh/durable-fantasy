import * as THREE from "three"

import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { wallTex } from "#/world/scene/textures/wall-tex"
import { houseShutters } from "#/world/scene/construction/registry"
import { glowOwner } from "#/world/scene/construction/houses"
import { glowify } from "#/world/scene/construction/helpers/houses/glowify"

type Props = {
  w: number
  h: number
  seed: number
  opts?: Partial<Parameters<typeof wallTex>[0]>
}

export function wallMat(props: Props) {
  const opts = props.opts === undefined ? {} : props.opts

  const all = { w: props.w, h: props.h, floors: 1, timber: true, seed: props.seed, flowers: true, ...opts }
  const bState = wallTex(all),
    b = bState[0],
    g = bState[1]
  const m = glowify(new THREE.MeshLambertMaterial({ map: toTex(b, false) }), g)
  // a household's house can shut its windows: the same wall with the shutters closed, swapped in by the hour
  if (glowOwner.value && all.windows) houseShutters.push({ house: glowOwner.value, mat: m, open: m.map!, shut: toTex(wallTex({ ...all, shut: true })[0], false) })
  return m
}
