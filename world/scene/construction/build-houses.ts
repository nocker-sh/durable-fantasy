import { authoredBuilding } from "#/world/scene/construction/authored-building"
import { addWalkSurfaces } from "#/world/scene/add-walk-surfaces"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import * as THREE from "three"
import { HOUSES } from "#/world/town/houses"
import { enterable } from "#/world/town/enterable"
import { floorsOf } from "#/world/town/floors-of"
import { houseStyle } from "#/world/town/house-style"
import { chimneys, places } from "#/world/scene/construction/registry"
import { occluder } from "#/world/scene/construction/occluder"
import { oriels, leanTos } from "#/world/scene/construction/houses"
import { leanTo } from "#/world/scene/construction/helpers/houses/lean-to"
import { house } from "#/world/scene/construction/house"

export function buildHouses(root: THREE.Group, map: string) {
  oriels.length = 0
  leanTos.length = 0
  for (const h of HOUSES) {
    if (h.map !== map) continue
    if (h.authored?.exterior) {
      const site = h.authored.exterior,
        group = authoredBuilding(root, site, groundH)
      occluder(group, 0.22, false)
      blockRect({ x0: h.x0, z0: h.z0, x1: h.x1, z1: h.z1 })
      addWalkSurfaces(site.steps)
      const xState = site.door.point,
        x = xState[0],
        z = xState[1],
        nxState = site.door.outward,
        nx = nxState[0],
        nz = nxState[1]
      places[h.id] = [x + nx * 0.55, z + nz * 0.55]
      for (const flue of site.chimneys) chimneys.push(new THREE.Vector3((flue.rect[0] + flue.rect[2]) / 2, flue.top, (flue.rect[1] + flue.rect[3]) / 2))
    } else house(root, { ...h, floors: floorsOf(h), chimney: h.plan.hearth, name: h.id, private: !enterable(h), style: houseStyle(h) })
  }
  // the lean-tos go up once every house stands, so each can keep clear of all the others
  for (const h of HOUSES) if (h.map === map && h.kind !== "vacant" && h.seed % 2 === 0) leanTo(root, h, map)
}
