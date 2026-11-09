import { BoxGeometry, Group, Mesh, MeshBasicMaterial, RingGeometry } from "three"
import { walkH } from "#/world/scene/walk-h"
import { center } from "#/world/scene/runtime/center"
import type { Cell } from "#/world/scene/runtime/types"
import type { GatheringSpot } from "#/world/scene/runtime/gathering-types"

type Station = Readonly<{ id: string; cell: Readonly<Cell> }>

export function createStationSpot(town: Group, station: Station): GatheringSpot {
  const at = center(station.cell)
  const full = new Group()
  const spent = new Group()
  const hit = new Mesh(new BoxGeometry(1.1, 1.4, 1.1), new MeshBasicMaterial({ visible: false }))
  hit.position.set(at[0], walkH(at[0], at[1]) + 0.7, at[1])
  const glow = new Mesh(new RingGeometry(0.55, 0.62, 20), new MeshBasicMaterial({ color: 0xf0d078, transparent: true, opacity: 0.5, depthWrite: false }))
  glow.rotation.x = -Math.PI / 2
  glow.position.set(at[0], walkH(at[0], at[1]) + 0.04, at[1])
  full.add(hit, glow)
  full.userData.node = `station:${station.id}`
  town.add(full, spent)
  return { full, spent, at }
}
