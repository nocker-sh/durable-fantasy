import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { clusters } from "#/world/scene/fields/clusters"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { birches } from "#/world/scene/fields/birches"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { fallenPetals } from "#/world/scene/fields/fallen-petals"
import { fallenColumns } from "#/world/scene/fields/fallen-columns"
import { ruinedArch } from "#/world/scene/fields/ruined-arch"
import { ruinedHouse } from "#/world/scene/fields/ruined-house"
import { warWreck } from "#/world/scene/fields/war-wreck"
import { rustedWeapons } from "#/world/scene/fields/rusted-weapons"
import { brokenCart } from "#/world/scene/fields/broken-cart"
import { shipRibs } from "#/world/scene/fields/ship-ribs"
import { beastBones } from "#/world/scene/fields/beast-bones"
import { standingStones } from "#/world/scene/fields/standing-stones"
import { greatTree } from "#/world/scene/fields/great-tree"
import { ropeSwing } from "#/world/scene/fields/rope-swing"
import { scarecrow } from "#/world/scene/fields/scarecrow"
import { fallenBell } from "#/world/scene/fields/fallen-bell"
import { oldWell } from "#/world/scene/fields/old-well"
import { milestones } from "#/world/scene/fields/milestones"
import { brokenLamp } from "#/world/scene/fields/broken-lamp"
import { anchor } from "#/world/scene/fields/anchor"
import { fishingFloats } from "#/world/scene/fields/fishing-floats"
import { rainbow } from "#/world/scene/fields/rainbow"
import { warGraves } from "#/world/scene/fields/war-graves"
import { rubble } from "#/world/scene/fields/rubble"
import { scrap } from "#/world/scene/fields/scrap"

type At = readonly [number, number][]

/** Fallen stones gathered round the places they fell from. */
const stones = (root: THREE.Group, seed: number, near: At) => rubble(root, clusters(seed, 0, 9, 2.6, 0.6, 1.1, offRoad(0.5), [...near]))
/** The small iron of the war, gathered round what it came off. */
const iron = (root: THREE.Group, seed: number, near: At) => scrap(root, clusters(seed, 0, 8, 2.8, 0.7, 1.2, offRoad(0.5), [...near]))
/** Wild trees in flower, each with its petals under it. */
const inFlower = (root: THREE.Group, trees: readonly (readonly [number, number, number])[]) => {
  broadleaves(
    root,
    trees.map((t, i) => ({ x: t[0], z: t[1], s: t[2], r: i * 1.9 })),
    M.blossom,
  )
  for (const t of trees) fallenPetals(root, t[0], t[1])
}
/** A stand of birches round each place. */
const birchStand = (root: THREE.Group, seed: number, near: At) => birches(root, clusters(seed, 0, 5, 2.3, 0.8, 1.15, offRoad(1.6), [...near]))

/**
 * What time and people have left on each field outside town, beyond its main sights (landscape.md
 * 「何を美しいとするか」: 人と時間の跡): things of the war and of the goddess's day, broken and grown
 * over; things somebody lost or gave up on; and a few things still in use. Each stands on ground
 * the field's own builder left open, so the builder's trees and stones stay where they were.
 */
const RELICS: Record<string, (root: THREE.Group) => void> = {
  "south-meadow": (root) => {
    // the old farm on the open grass north of the lone tree: the house, its well, the cart that never
    // came back up the road. All of it stands clear of the ground the meadow's creatures keep (monsters.ts)
    ruinedHouse({ root: root, x: 29.6, z: 6, rot: 0.1, seed: 301 })
    oldWell(root, [33.6, 5.4], 0.5)
    brokenCart({ root: root, x: 26.5, z: 19.4, rot: 0.9 })
    // what Otto and the children have put up
    scarecrow(root, [14.8, 18.6], -0.6)
    ropeSwing({ root: root, x: 34, z: 13, rot: -Math.PI / 4 })
    // the hollow: more of the engine's company, and the blades of those who fought beside it
    warWreck({ root: root, x: 25.9, z: 38.6, rot: 0.5, kind: "gear" })
    warWreck({ root: root, x: 26.7, z: 43, rot: 2.1, kind: "plates" })
    rustedWeapons(root, [40.6, 35.6], 302)
    iron(root, 303, [
      [41, 37.2],
      [38, 41.6],
    ])
    stones(root, 304, [
      [27.4, 4.6],
      [32, 7.6],
    ])
    brokenLamp(root, [20.4, 22], 0.4)
    brokenLamp(root, [25.6, 30], 2.6)
    inFlower(root, [
      [30.5, 20.3, 1.0],
      [5.6, 21, 0.9],
      [15.6, 4.2, 1.0],
    ])
    birchStand(root, 305, [[38.5, 5.6]])
    milestones(root, "south-meadow")
  },
  "red-dunes": (root) => {
    // the bones of a war beast across the dune's foot, and the engines that went down with it
    beastBones({ root: root, x: 13.5, z: 32.5, rot: 1.1 })
    warWreck({ root: root, x: 30.5, z: 9.5, rot: 0.4, kind: "leg" })
    warWreck({ root: root, x: 31.5, z: 40.6, rot: 0.9, kind: "boiler" })
    warWreck({ root: root, x: 7, z: 21.4, rot: 2.2, kind: "gun" })
    warWreck({ root: root, x: 20.2, z: 14.4, rot: 0.3, kind: "plates" })
    warWreck({ root: root, x: 37.5, z: 27.3, rot: 1.4, kind: "gear" })
    ruinedArch({ root: root, x: 8.5, z: 7.3, rot: 0.2, seed: 311 })
    rustedWeapons(root, [24.5, 31], 312)
    rustedWeapons(root, [8.6, 14.6], 313)
    iron(root, 314, [
      [34, 36.2],
      [15, 12.8],
      [30, 12.4],
      [22, 33],
    ])
    stones(root, 315, [[10, 9.6]])
    milestones(root, "red-dunes")
  },
  "sea-cliff": (root) => {
    // a colonnade that looked out to sea, a gate of the fort the tower belonged to, a gun still on its cliff
    fallenColumns({ root: root, x: 13, z: 20.4, rot: -0.3, seed: 31 })
    ruinedArch({ root: root, x: 17.5, z: 38.3, rot: 0.15, seed: 321 })
    warWreck({ root: root, x: 30.6, z: 12.5, rot: Math.PI / 2, kind: "gun" })
    warGraves(root, [8.8, 29.9], 322)
    rustedWeapons(root, [32.6, 30.2], 323)
    brokenLamp(root, [24.6, 33], 0.3)
    brokenLamp(root, [22.6, 8], 2.9)
    stones(root, 324, [
      [30.6, 26.6],
      [13.4, 22.6],
      [17, 40],
    ])
    milestones(root, "sea-cliff")
  },
  "net-sheds": (root) => {
    // the wreck on the north beach and its anchor; a cottage inland nobody fishes from any more
    shipRibs({ root: root, x: 31.2, z: 12, rot: 0.3 })
    anchor(root, [32.6, 18.4], 1.0)
    ruinedHouse({ root: root, x: 10, z: 36.5, rot: 0.08, seed: 331 })
    oldWell(root, [14.6, 39.6], 1.2)
    // the sheds' own gear, in use
    fishingFloats(root, [31.4, 27.4], 332)
    fishingFloats(root, [31.2, 36.6], 333)
    stones(root, 334, [[10, 39.4]])
    milestones(root, "net-sheds")
  },
  "forest-edge": (root) => {
    // the path into the wood still goes through the gate of a fort that is otherwise gone
    ruinedArch({ root: root, x: 31.5, z: 9.6, rot: 1.97, seed: 341 })
    ruinedHouse({ root: root, x: 7.4, z: 33.1, rot: 0.05, seed: 342 })
    brokenCart({ root: root, x: 33, z: 20, rot: 2.4 })
    warWreck({ root: root, x: 39.5, z: 36.4, rot: 0.8, kind: "gear" })
    warWreck({ root: root, x: 10.5, z: 37.5, rot: 1.7, kind: "plates" })
    brokenLamp(root, [20.6, 15], 0.2)
    brokenLamp(root, [27.4, 34], 3.3)
    stones(root, 343, [
      [33.6, 11.6],
      [30, 7.6],
      [8, 36],
    ])
    birchStand(root, 344, [
      [37.5, 25.5],
      [41, 15.5],
    ])
    milestones(root, "forest-edge")
  },
  "deep-forest": (root) => {
    // the old great tree in its clearing, a ring of toadstools, and what the fort left under the moss
    greatTree(root, 23.4, 20.2)
    const ring: { x: number; z: number; s: number; r: number }[] = []
    for (let k = 0; k < 11; k++) ring.push({ x: 8.8 + Math.cos((k / 11) * Math.PI * 2) * 1.4, z: 20.3 + Math.sin((k / 11) * Math.PI * 2) * 1.4, s: 1 + (k % 3) * 0.15, r: k * 1.3 })
    mushrooms(root, ring)
    ruinedArch({ root: root, x: 12.5, z: 16.5, rot: Math.PI, seed: 351 })
    fallenColumns({ root: root, x: 37, z: 36.7, rot: Math.PI, seed: 44 })
    warWreck({ root: root, x: 40, z: 17.2, rot: 3.6, kind: "gun" })
    warWreck({ root: root, x: 14.8, z: 8.4, rot: 0.7, kind: "plates" })
    rustedWeapons(root, [16.2, 30.6], 352)
    rustedWeapons(root, [34, 16.8], 353)
    brokenLamp(root, [26.4, 38.4], 1.9)
    stones(root, 354, [
      [10, 35.6],
      [16.6, 31.4],
      [33, 15.6],
      [39, 12],
      [14, 18],
    ])
    milestones(root, "deep-forest")
  },
  "mountain-pass": (root) => {
    // the chapel that stood across the road from the altar: its bell, its dead, its gate
    fallenBell({ root: root, x: 29.2, z: 9.6, rot: Math.PI / 2 })
    warGraves(root, [20.6, 7.2], 361)
    ruinedArch({ root: root, x: 36.8, z: 32.6, rot: 0.05, seed: 362 })
    warWreck({ root: root, x: 28.8, z: 16.2, rot: 0.9, kind: "plates" })
    rustedWeapons(root, [20.4, 16.4], 363)
    brokenLamp(root, [31.5, 22.4], 2.4)
    stones(root, 364, [
      [28.6, 12.4],
      [35.6, 34.4],
    ])
    milestones(root, "mountain-pass")
  },
  "grass-highland": (root) => {
    // the stone ring on the open down, the fallen colonnade in the south, the dead of the giant's fight
    standingStones(root, [37, 10.6], 7)
    fallenColumns({ root: root, x: 10.5, z: 37.6, rot: 0, seed: 11 })
    warWreck({ root: root, x: 22.5, z: 8.5, rot: 0.3, kind: "leg" })
    warWreck({ root: root, x: 8.4, z: 21.2, rot: 1.1, kind: "gear" })
    warWreck({ root: root, x: 20.4, z: 14.2, rot: 2.5, kind: "plates" })
    warGraves(root, [38.5, 29.4], 371)
    rustedWeapons(root, [25, 15.5], 372)
    rustedWeapons(root, [9.5, 25], 373)
    iron(root, 374, [
      [16.4, 10.6],
      [11, 15.8],
      [23, 11],
    ])
    stones(root, 375, [
      [13.6, 39.6],
      [34, 13.6],
    ])
    birchStand(root, 376, [
      [42, 18],
      [5.6, 26.6],
    ])
    milestones(root, "grass-highland")
  },
  "lily-marsh": (root) => {
    // columns going down into the wet ground, a marsh house given up to the water, a boiler in the mud
    fallenColumns({ root: root, x: 10, z: 8, rot: 0, seed: 53 })
    ruinedHouse({ root: root, x: 33.4, z: 23, rot: 0.05, seed: 381 })
    oldWell(root, [38.6, 24.6], 2.0)
    warWreck({ root: root, x: 19.6, z: 26.2, rot: 1.2, kind: "boiler" })
    warWreck({ root: root, x: 6.2, z: 9.2, rot: 0.2, kind: "plates" })
    rustedWeapons(root, [40.5, 22], 382)
    brokenLamp(root, [20.6, 12.4], 0.5)
    brokenLamp(root, [26.2, 34.5], 3.4)
    stones(root, 383, [
      [12.6, 9.8],
      [35.6, 25.6],
    ])
    milestones(root, "lily-marsh")
  },
  "falls-valley": (root) => {
    // the bow in the spray of the lower fall; the mill house below it, and a cart that went no further
    rainbow(root, [30.4, 33.9], 2.7)
    ruinedHouse({ root: root, x: 28, z: 39.6, rot: 0.3, seed: 391 })
    brokenCart({ root: root, x: 30.6, z: 42.8, rot: 1.3 })
    rustedWeapons(root, [22.6, 40.6], 392)
    brokenLamp(root, [40.2, 27.3], 1.0)
    inFlower(root, [
      [39.5, 33.5, 1.0],
      [23.6, 41.6, 0.9],
    ])
    stones(root, 393, [[25.4, 41]])
    milestones(root, "falls-valley")
  },
  "salt-flats": (root) => {
    // a hull on the dry salt, from when the brine reached this far; engines the salt has eaten into
    shipRibs({ root: root, x: 17, z: 37, rot: 0.8 })
    anchor(root, [22.6, 40.4], 0.5)
    warWreck({ root: root, x: 22.5, z: 8.2, rot: 0.4, kind: "boiler" })
    warWreck({ root: root, x: 20.5, z: 20.5, rot: 0.6, kind: "leg" })
    brokenCart({ root: root, x: 35, z: 21.6, rot: 0.6 })
    rustedWeapons(root, [38.4, 24.4], 401)
    iron(root, 402, [
      [22, 10.8],
      [22.4, 22],
    ])
    milestones(root, "salt-flats")
  },
  "quynhon-gate": (root) => {
    // the road to the shut gate: its lamps out, a cart left where the carter gave up waiting
    brokenLamp(root, [20.9, 15.5], 0.3)
    brokenLamp(root, [26.4, 21], 3.0)
    brokenLamp(root, [20.9, 26.5], 0.6)
    brokenCart({ root: root, x: 29.5, z: 24.5, rot: 1.0 })
    milestones(root, "quynhon-gate")
  },
  "hue-gate": (root) => {
    // the gun that covered the gate, plates off the engine it stopped, the road's dead lamps
    warWreck({ root: root, x: 33.4, z: 16.6, rot: 0.2, kind: "gun" })
    warWreck({ root: root, x: 15.4, z: 20.4, rot: 1.3, kind: "plates" })
    rustedWeapons(root, [36, 26], 411)
    brokenLamp(root, [20.9, 15], 0.3)
    brokenLamp(root, [26.6, 20.5], 3.0)
    brokenLamp(root, [20.9, 23.5], 0.6)
    iron(root, 412, [[17, 22.6]])
    milestones(root, "hue-gate")
  },
}

/** Set a field's relics on it; a field without any is left as it is. */
export function relics(root: THREE.Group, id: string) {
  RELICS[id]?.(root)
}
