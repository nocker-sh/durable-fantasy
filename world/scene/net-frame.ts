import * as THREE from "three"

import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"

import { leafTex } from "#/world/scene/textures/leaves"

const net = mat(leafTex("cGray", 51), { side: THREE.DoubleSide })
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  gb: GB
  x: number
  z: number
  alongX: boolean
}

export function netFrame(props: Props) {
  // a net spread to dry on two poles
  const y = groundH(props.x, props.z)
  const axState = props.alongX ? [props.x - 0.8, props.z, props.x + 0.8, props.z] : [props.x, props.z - 0.8, props.x, props.z + 0.8],
    ax = axState[0],
    az = axState[1],
    bx = axState[2],
    bz = axState[3]
  for (const entry of [
    [ax, az],
    [bx, bz],
  ]) {
    const px = entry[0]
    const pz = entry[1]
    props.gb.box({ side: M.woodDark, top: null, x0: px - 0.04, y0: y, z0: pz - 0.04, x1: px + 0.04, y1: y + 1.5, z1: pz + 0.04, repeat: 2 })
  }
  if (props.alongX) props.gb.box({ side: net, top: null, x0: ax, y0: y + 0.4, z0: props.z - 0.01, x1: bx, y1: y + 1.45, z1: props.z + 0.01, repeat: 1 })
  else props.gb.box({ side: net, top: null, x0: props.x - 0.01, y0: y + 0.4, z0: az, x1: props.x + 0.01, y1: y + 1.45, z1: bz, repeat: 1 })
  blockRect({ x0: Math.min(ax, bx) - 0.1, z0: Math.min(az, bz) - 0.1, x1: Math.max(ax, bx) + 0.1, z1: Math.max(az, bz) + 0.1 })
}
