import * as THREE from "three"
import type { V2 } from "#/world/scene/construction/registry"
import { groundH } from "#/world/scene/ground-h"
import type { HouseDef } from "#/world/town/house-types"
import { OUT, shopBoards } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"
import { openMat } from "#/world/scene/helpers/dressing/open-mat"
import { shutMat } from "#/world/scene/helpers/dressing/shut-mat"

/** A little board hung by the door of a shop. */
export function shopBoard(root: THREE.Group, h: HouseDef) {
  if (!h.shop) return
  const xState = doorPoint(h),
    x = xState[0],
    z = xState[1]
  const oxState = OUT[h.door.side],
    ox = oxState[0],
    oz = oxState[1]
  // beside the door, against the wall, facing out
  const side: V2 = h.door.side === "n" || h.door.side === "s" ? [0.85, 0] : [0, 0.85]
  const bx = x + side[0] - ox * 0.35,
    bz = z + side[1] - oz * 0.35
  const y = groundH(bx, bz) + 1.0
  const rot = Math.atan2(ox, oz)
  const make = (m: THREE.Material) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.3), m)
    b.position.set(bx, y, bz)
    b.rotation.y = rot
    root.add(b)
    return b
  }
  const open = make(openMat()),
    shut = make(shutMat())
  shut.visible = false
  shopBoards.push({ shop: h.shop, open, shut })
}
