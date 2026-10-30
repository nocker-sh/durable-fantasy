import * as THREE from "three"

const WALL_T = 0.22
import { framedWindow } from "#/world/scene/construction/framed-window"

import type { Interior } from "#/world/town/interiors"
import { WALL_H, cutaways } from "#/world/scene/interior"
import { wall } from "#/world/scene/helpers/interior/wall"
import type { Cutaway } from "#/world/scene/interior"

/** Walls share their base pivot, including levels below the currently inspected floor. */
export function shellWalls(root: THREE.Group, it: Interior, y0: number) {
  const wallHeight = it.wallHeight ?? WALL_H
  const cx = (it.x0 + it.x1) / 2,
    cz = (it.z0 + it.z1) / 2
  const entrance = it.entrance ?? { point: [(it.door[0] + 0.5) / 2, it.z1], outward: [0, 1] }
  const outer = it.shellInset ? { x0: it.x0, z0: it.z0, x1: it.x1, z1: it.z1 } : { x0: it.x0 - WALL_T, z0: it.z0 - WALL_T, x1: it.x1 + WALL_T, z1: it.z1 + WALL_T }
  const inner = it.shellInset ? { x0: it.x0 + it.shellInset, z0: it.z0 + it.shellInset, x1: it.x1 - it.shellInset, z1: it.z1 - it.shellInset } : it
  const halfDoor = (it.doorWidth ?? 1.1) / 2
  const doorCuts = (nx: number, nz: number) =>
    it.floor === 0 && entrance.outward[0] === nx && entrance.outward[1] === nz ? [[entrance.point[nz ? 0 : 1] - halfDoor, entrance.point[nz ? 0 : 1] + halfDoor] as [number, number]] : []
  const cutsFor = (nx: number, nz: number) =>
    (it.windows ?? [])
      .filter((w) => w.outward[0] === nx && w.outward[1] === nz)
      .map((w) => ({ from: (nz ? w.point[0] : w.point[1]) - w.width / 2, to: (nz ? w.point[0] : w.point[1]) + w.width / 2, bottom: w.sill, top: w.sill + w.height }))
  const firstWall = cutaways.length
  const backWall: Cutaway = {
    floor: it.floor,
    obj: wall({
      root: root,
      x0: outer.x0,
      z0: outer.z0,
      x1: outer.x1,
      z1: inner.z0,
      y0: y0,
      holes: doorCuts(0, -1),
      height: wallHeight,
      openingHeight: it.doorHeight ?? 1.75,
      apertures: cutsFor(0, -1),
    }),
    at: [cx, it.z0],
    normal: [0, -1],
  }
  cutaways.push(
    backWall,
    {
      floor: it.floor,
      obj: wall({
        root: root,
        x0: outer.x0,
        z0: inner.z1,
        x1: outer.x1,
        z1: outer.z1,
        y0: y0,
        holes: doorCuts(0, 1),
        height: wallHeight,
        openingHeight: it.doorHeight ?? 1.75,
        apertures: cutsFor(0, 1),
      }),
      at: [cx, it.z1],
      normal: [0, 1],
    },
    {
      floor: it.floor,
      obj: wall({
        root: root,
        x0: outer.x0,
        z0: inner.z0,
        x1: inner.x0,
        z1: inner.z1,
        y0: y0,
        holes: doorCuts(-1, 0),
        height: wallHeight,
        openingHeight: it.doorHeight ?? 1.75,
        apertures: cutsFor(-1, 0),
      }),
      at: [it.x0, cz],
      normal: [-1, 0],
    },
    {
      floor: it.floor,
      obj: wall({
        root: root,
        x0: inner.x1,
        z0: inner.z0,
        x1: outer.x1,
        z1: inner.z1,
        y0: y0,
        holes: doorCuts(1, 0),
        height: wallHeight,
        openingHeight: it.doorHeight ?? 1.75,
        apertures: cutsFor(1, 0),
      }),
      at: [it.x1, cz],
      normal: [1, 0],
    },
  )
  for (const wall of cutaways.slice(firstWall)) {
    wall.details = (it.windows ?? [])
      .filter((w) => w.outward[0] === wall.normal[0] && w.outward[1] === wall.normal[1])
      .map((w) => {
        const fixture = framedWindow(w, y0)
        root.add(fixture)
        return fixture
      })
  }
  return backWall
}
