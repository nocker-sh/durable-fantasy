import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

import type { Stock } from "#/world/scene/construction/furnishings"
const HANGING: Record<string, string[]> = {
  bakery: ["garlic"],
  apothecary: ["herb", "herb", "garlic"],
  tavern: ["sausage", "garlic"],
  inn: ["garlic"],
  general: ["garlic"],
}

const STOCK: Record<string, Stock> = { bakery: "bread", apothecary: "jars", crystal: "jars", tavern: "bottles", inn: "bottles", general: "sundries" }

const shelfPaper = colorMat(0xece4d0)

const windowMat = new THREE.MeshLambertMaterial({ color: 0x9ab8d0, emissive: new THREE.Color(0x6a88a8), emissiveIntensity: 0.5 })
import { parkedCart } from "#/world/scene/construction/parked-cart"
import { canUseNamedFurnishing } from "#/world/scene/can-use-named-furnishing"
import { waterJar } from "#/world/scene/construction/water-jar"
import { addInteriorHearth } from "#/world/scene/construction/add-interior-hearth"
import { storedToolParts } from "#/world/town/stored-tool"
import { flueWalls } from "#/world/town/flue-walls"
import { flueCorbelParts } from "#/world/town/flue-corbel"
import { storageBox } from "#/world/scene/construction/storage-box"
import { shelfParts } from "#/world/town/shelf-parts"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { shelfLidHandle } from "#/world/town/shelf-lid-handle"
import { addMeasuredBed } from "#/world/scene/construction/add-measured-bed"
import { INTERIOR_CLOTH as cloth } from "#/world/scene/construction/interior-cloth-materials"
import { workTable } from "#/world/scene/construction/work-table"
import { chair } from "#/world/scene/construction/chair"
import { hangingLantern } from "#/world/scene/construction/hanging-lantern"
import { subtractRectangles } from "#/lib/engine/rectangle-subtraction"
import { authoredStair } from "#/world/scene/construction/authored-stair"
import { workshopContainer } from "#/world/scene/construction/workshop-container"
import { basketry } from "#/world/scene/construction/basketry"
import { pottersWheel } from "#/world/scene/construction/potters-wheel"
import { whetstone } from "#/world/scene/construction/whetstone"
import { ceramicVessel } from "#/world/scene/construction/ceramic-vessel"
import { spinningWheel } from "#/world/scene/construction/spinning-wheel"
import { indoorLaundry } from "#/world/scene/construction/indoor-laundry"

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { bench } from "#/world/scene/construction/bench"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { table } from "#/world/scene/construction/table"
import { glowMats } from "#/world/scene/construction/registry"
import { M } from "#/world/scene/construction/materials"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { hanging } from "#/world/scene/hanging"
import { GPPU } from "#/world/scene/goods"
import { blocked } from "#/world/scene/world"
import { WN } from "#/world/maps/ground/rules"
import { groundH } from "#/world/scene/ground-h"
import { setWalkSurfaces } from "#/world/scene/set-walk-surfaces"
import { interiorRows } from "#/world/town/interior-rows"
import type { Interior } from "#/world/town/interiors"
import { Kit } from "#/world/scene/construction/kit"
import { furnish } from "#/world/scene/construction/furnish"
import { stockShelf } from "#/world/scene/construction/stock-shelf"
import { topOf } from "#/world/scene/construction/top-of"
import { wood } from "#/world/scene/construction/wood"
import { hang as hangOn } from "#/world/scene/construction/hang"
import { lying } from "#/world/scene/construction/lying"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { WALL_H, COUNTER_H, cutaways, WALL_SCALE } from "#/world/scene/interior"

import { bolts } from "#/world/scene/helpers/interior/bolts"
import { counter } from "#/world/scene/helpers/interior/counter"
import { counterGoods } from "#/world/scene/helpers/interior/counter-goods"
import { spotOf } from "#/world/scene/helpers/interior/spot-of"
import { fireLight } from "#/world/scene/helpers/interior/fire-light"
import { dress } from "#/world/scene/helpers/interior/dress"
import { woodFor } from "#/world/scene/helpers/interior/wood-for"
import { workbench } from "#/world/scene/helpers/interior/workbench"
import { rack } from "#/world/scene/helpers/interior/rack"
import { loom } from "#/world/scene/helpers/interior/loom"
import { chest } from "#/world/scene/helpers/interior/chest"
import { rug } from "#/world/scene/helpers/interior/rug"
import { lamp } from "#/world/scene/helpers/interior/lamp"
import { stair } from "#/world/scene/helpers/interior/stair"
import { partition } from "#/world/scene/helpers/interior/partition"
import { trace } from "#/world/scene/helpers/interior/trace"
import { noticeBoard } from "#/world/scene/helpers/interior/notice-board"
import { shellWalls } from "#/world/scene/helpers/interior/shell-walls"
import { floorboards } from "#/world/scene/helpers/interior/floorboards"

/** The builder for one room. */
export function buildInterior(it: Interior) {
  return (root: THREE.Group) => {
    const y0 = groundH(it.x0 + 1, it.z0 + 1) + 0.02
    const shop = it.house.shop
    const seed = it.house.seed
    cutaways.length = 0
    if (it.below) {
      const lower = new THREE.Group(),
        base = y0 - it.below.drop,
        below = it.below.interior
      lower.name = "lower-floor-context"
      floorboards({ root: lower, it: below, y0: base, name: "lower-floorboards" })
      shellWalls(lower, below, base)
      for (const f of below.furniture) if (f.kind === "partition" || f.kind === "lowwall" || f.kind === "curtain") partition(lower, f, base)
      root.add(lower)
    }
    floorboards({ root: root, it: it, y0: y0, name: "interior-floor" })
    setWalkSurfaces(subtractRectangles({ x0: it.x0, z0: it.z0, x1: it.x1, z1: it.z1 }, it.floorOpenings ?? []).map((r) => ({ rect: [r.x0, r.z0, r.x1, r.z1] as const, height: y0 })))
    for (const section of it.stairSections ?? []) root.add(authoredStair({ section: section, floor: it.floor, floorY: y0, scale: ROOM_SCALE }))
    const wallHeight = it.wallHeight ?? WALL_H
    const supports = new GB()
    for (const shaft of it.flues ?? []) {
      const top = shaft.upperFloor === it.floor ? y0 - (it.floorThickness ?? 0.1) : shaft.lowerFloor === it.floor ? y0 + wallHeight : undefined
      if (top === undefined) continue
      for (const part of flueCorbelParts(shaft, top, { x0: it.x0, z0: it.z0, x1: it.x1, z1: it.z1 }))
        supports.box({ side: M.stone, top: M.stone, x0: part.x0, y0: part.bottom, z0: part.z0, x1: part.x1, y1: part.top, z1: part.z1, repeat: 2, bottom: true })
    }
    const corbels = supports.build()
    corbels.name = "flue-floor-support"
    root.add(corbels)
    const backWall = shellWalls(root, it, y0)
    // windows on the back wall, glowing a little with the light outside
    const wb = new GB()
    for (const wx of it.authored ? [] : [it.x0 + (it.x1 - it.x0) * 0.3, it.x0 + (it.x1 - it.x0) * 0.7]) {
      wb.box({ side: windowMat, top: null, x0: wx - 0.35, y0: y0 + 1.1, z0: it.z0 + 0.005, x1: wx + 0.35, y1: y0 + 1.7, z1: it.z0 + 0.02, repeat: 1 })
      wb.box({ side: M.woodDark, top: null, x0: wx - 0.03, y0: y0 + 1.1, z0: it.z0 + 0.02, x1: wx + 0.03, y1: y0 + 1.7, z1: it.z0 + 0.04, repeat: 1 })
      wb.box({ side: M.woodDark, top: null, x0: wx - 0.4, y0: y0 + 1.05, z0: it.z0 + 0.01, x1: wx + 0.4, y1: y0 + 1.1, z1: it.z0 + 0.08, repeat: 1 })
    }
    const windows = wb.build()
    windows.name = "interior-windows"
    root.add(windows)
    backWall.details = [...(backWall.details ?? []), windows]
    glowMats.push(windowMat)
    // a door mat inside the door
    if (it.floor === 0 && !it.authored) {
      const doorX = (it.door[0] + 0.5) / 2
      const dm = new GB()
      dm.box({ side: M.sack, top: M.sack, x0: doorX - 0.45, y0: y0, z0: it.z1 - 0.7, x1: doorX + 0.45, y1: y0 + 0.012, z1: it.z1 - 0.15, repeat: 2 })
      root.add(dm.build())
    }

    const props = new GB()
    const shelves = { value: 0 }
    const woodOfPiece = woodFor(it)
    it.furniture.forEach((f, k) => {
      // a piece drawn as itself (construction/furnishings.ts); the rest by its kind below
      const own = f.name && canUseNamedFurnishing(f, !!it.authored)
      const spot = spotOf(it, f, y0)
      if (own && furnish({ gb: props, name: f.name!, spot: spot, w: wood(woodOfPiece(f.name!)), seed: seed + k * 13 })) {
        if (f.kind === "counter") counterGoods({ root: root, f: f, y0: y0, shop: shop, seed: seed })
        if (f.kind === "hearth") fireLight(root, spot)
        return
      }
      switch (f.kind) {
        case "chimney-shaft": {
          const shaft = new GB()
          const section = it.flues?.find((s) => s.upperFloor === it.floor && Math.abs((s.x0 + s.x1) / 2 - f.x) < 1e-6 && Math.abs((s.z0 + s.z1) / 2 - f.z) < 1e-6)
          if (!section) throw new Error("Chimney shaft has no dimensioned flue section")
          for (const part of flueWalls(section, section.wallThickness).walls)
            shaft.box({ side: M.stone, top: M.stoneDark, x0: part.x0, y0: y0, z0: part.z0, x1: part.x1, y1: y0 + wallHeight, z1: part.z1, repeat: 4, bottom: true })
          const mesh = shaft.build()
          mesh.name = "chimney-shaft"
          root.add(mesh)
          break
        }
        case "wall-board": {
          const board = new GB(),
            mount = f.wallMount,
            side = mount?.side,
            alongX = side ? side === "n" || side === "s" : f.w >= f.d
          const height = mount?.height ?? Math.min(1.1, Math.max(0.55, Math.max(f.w, f.d) * 0.5)),
            bottom = mount?.bottom ?? 0.8
          const thickness = 0.04 * ROOM_SCALE
          const bx = side === "w" ? f.x - f.w / 2 + thickness / 2 : side === "e" ? f.x + f.w / 2 - thickness / 2 : f.x
          const bz = side === "n" ? f.z - f.d / 2 + thickness / 2 : side === "s" ? f.z + f.d / 2 - thickness / 2 : f.z
          const dx = alongX ? f.w / 2 : thickness / 2,
            dz = alongX ? thickness / 2 : f.d / 2
          board.box({ side: M.woodDark, top: M.wood, x0: bx - dx, y0: y0 + bottom, z0: bz - dz, x1: bx + dx, y1: y0 + bottom + height, z1: bz + dz, repeat: 2 })
          root.add(board.build())
          break
        }
        case "counter":
          counter({ root: root, f: f, y0: y0, shop: shop, seed: seed })
          break
        case "shelf":
          if (f.shelf) {
            for (const part of shelfParts({ x: f.x, z: f.z, width: f.w, depth: f.d, floor: y0, shelf: f.shelf }))
              props.box({ side: M.woodDark, top: M.wood, x0: part.x0, y0: part.y0, z0: part.z0, x1: part.x1, y1: part.y1, z1: part.z1, repeat: 2 })
            shelfItemParts({ x: f.x, z: f.z, width: f.w, depth: f.d, floor: y0, shelf: f.shelf }).forEach((part, i) => {
              const item = f.shelf!.items![i]
              if (item.kind === "box") storageBox({ builder: props, bounds: part, wall: item.wall!, lid: item.lid!, lift: 0, material: item.boxMaterial, handle: shelfLidHandle(f.shelf!, item) })
              else if (item.kind === "tool")
                for (const piece of storedToolParts(part, item.tool!))
                  props.box({ side: M.iron, top: M.iron, x0: piece.x0, y0: piece.y0, z0: piece.z0, x1: piece.x1, y1: piece.y1, z1: piece.z1, repeat: 1, bottom: true })
              else {
                const material = item.kind === "papers" ? shelfPaper : cloth[2]
                props.box({ side: material, top: material, x0: part.x0, y0: part.y0, z0: part.z0, x1: part.x1, y1: part.y1, z1: part.z1, repeat: 1 })
              }
            })
            break
          }
          if (shop === "tailor" || it.house.plan.workshop?.includes("機織り")) bolts({ root: root, f: f, y0: y0, seed: seed + shelves.value })
          else
            stockShelf({
              gb: props,
              spot: f.name === "棚" ? { x: f.x, z: f.z, w: f.w, d: f.d, y: y0, face: 0 } : spot,
              wd: wood(woodOfPiece(f.name ?? "棚")),
              seed: seed + shelves.value * 11,
              stock: STOCK[shop ?? ""] ?? "stores",
            })
          shelves.value++
          break
        case "hearth":
          {
            const error = addInteriorHearth({
              root,
              furniture: f,
              floor: y0,
              height: wallHeight,
              shaft: it.flues?.find((s) => s.lowerFloor === it.floor && s.x0 >= f.x - f.w / 2 && s.x1 <= f.x + f.w / 2 && s.z0 >= f.z - f.d / 2 && s.z1 <= f.z + f.d / 2) ?? null,
            })
            if (error) throw error
          }
          break
        case "table":
          if (f.workSurface) workTable(props, f, y0)
          else table({ gb: props, x: f.x, z: f.z, w: f.w, d: f.d })
          break
        case "bed": {
          if (f.bed) {
            addMeasuredBed({ builder: props, at: [f.x, f.z], size: [f.w, f.d], floor: y0, bed: f.bed, mattress: cloth[2] })
            break
          }
          const x0 = f.x - f.w / 2,
            x1 = f.x + f.w / 2
          const z0 = f.z - f.d / 2,
            z1 = f.z + f.d / 2
          props.box({ side: M.woodDark, top: M.woodDark, x0: x0, y0: y0 + 0.12, z0: z0, x1: x1, y1: y0 + 0.3, z1: z1, repeat: 2 })
          props.box({ side: cloth[2], top: cloth[2], x0: x0 + 0.04, y0: y0 + 0.3, z0: z0 + 0.04, x1: x1 - 0.04, y1: y0 + 0.4, z1: z1 - 0.04, repeat: 2 })
          props.box({ side: cloth[1], top: cloth[1], x0: x0 + 0.04, y0: y0 + 0.4, z0: z0 + f.d * 0.3, x1: x1 - 0.04, y1: y0 + 0.43, z1: z1 - 0.04, repeat: 2 })
          props.box({ side: M.woodV, top: M.woodV, x0: x0, y0: y0, z0: z0, x1: x1, y1: y0 + 0.65, z1: z0 + 0.07, repeat: 2 })
          break
        }
        case "bench":
          bench({ gb: props, x: f.x, z: f.z, w: f.w })
          break
        case "barrel":
          barrel({ gb: props, x: f.x, z: f.z })
          break
        case "crate":
          crate({ gb: props, x: f.x, z: f.z, s: 0.55 })
          sack({ gb: props, x: f.x - 0.55, z: f.z + 0.1 })
          break
        case "workbench":
          workbench(root, f, y0)
          break
        case "rack":
          rack({ root: root, f: f, y0: y0, seed: seed })
          break
        case "loom":
          loom(root, f, y0)
          break
        case "potters-wheel":
          root.add(pottersWheel(f, y0))
          break
        case "yarn-basket":
        case "unfinished-basket":
        case "willow-bundle":
          root.add(basketry(f, y0, f.kind))
          break
        case "wax-pot":
        case "lye-tub":
        case "ash-sack":
        case "tinker-toolbox":
          root.add(workshopContainer(f, y0, f.kind))
          break
        case "whetstone":
          root.add(whetstone(f, y0))
          break
        case "parked-cart": {
          const cart = parkedCart({ at: [f.x, f.z], size: [f.w, f.d], floor: y0 })
          if (cart instanceof Error) throw cart
          root.add(cart)
          break
        }
        case "water-jar": {
          const jar = waterJar({ at: [f.x, f.z], size: [f.w, f.d], floor: y0 })
          if (jar instanceof Error) throw jar
          root.add(jar)
          break
        }
        case "tea-jar":
          root.add(ceramicVessel(f, y0, "tea"))
          break
        case "oil-jar":
          root.add(ceramicVessel(f, y0, "oil"))
          break
        case "glaze-jar":
          root.add(ceramicVessel(f, y0, "glaze"))
          break
        case "spinning-wheel":
          root.add(spinningWheel(f, y0))
          break
        case "chest":
          chest(root, f, y0)
          break
        case "rug":
          rug(root, f, y0)
          break
        case "chair":
          chair(props, f, y0)
          break
        case "stair":
          if (!it.stairSections?.length) stair(root, f, y0)
          break
        case "partition":
        case "lowwall":
        case "curtain":
          partition(root, f, y0)
          break
        case "trace":
          // Surface and wall details need their support height, resolved below.
          break
        default:
          throw new Error(`Missing furniture renderer: ${f.kind satisfies never}`)
      }
    })
    // the traces of the life lived here, where the plan lays them
    const tops = it.furniture.filter((f) => f.kind === "table" || f.kind === "workbench" || f.kind === "counter" || f.kind === "hearth")
    const heightAt = (x: number, z: number) => {
      const t = tops.find((f) => Math.abs(x - f.x) <= f.w / 2 + 0.05 && Math.abs(z - f.z) <= f.d / 2 + 0.05)
      return y0 + (!t ? 0.02 : t.kind === "hearth" ? 1.06 : t.kind === "counter" ? COUNTER_H : t.kind === "workbench" ? 0.82 : (t.workSurface?.height ?? topOf(t.name ?? "") ?? 0.62))
    }
    it.furniture
      .filter((f) => f.kind === "trace")
      .forEach((f, k) => {
        const onWall = f.z - it.z0 < 0.3
        const name = f.name ?? ""
        // flecks on the floor stay flecks; anything else is drawn as what it is, on a shelf if it is on a wall
        if (!it.authored && !/床/.test(name) && !/くず|跡|粉|藁|羽根|籾/.test(name)) {
          const y = onWall ? y0 + 1.3 : heightAt(f.x, f.z)
          if (onWall && /前掛け|外套|服|帽子|膝掛け|皮/.test(name)) {
            if (
              hangOn({
                k: new Kit(props, { x: f.x, z: it.z0, w: 1, d: 0.2, y: y + 0.5, face: 0 }, WALL_SCALE),
                wd: wood(woodOfPiece("")),
                what: { piece: /皮/.test(name) ? "干した皮" : "吊るした服" },
                seed: seed + k,
              })
            )
              return
          }
          if (onWall) props.box({ side: M.wood, top: M.wood, x0: f.x - 0.3, y0: y - 0.035, z0: it.z0, x1: f.x + 0.3, y1: y, z1: it.z0 + 0.22, repeat: 1 })
          if (lying(new Kit(props, { x: f.x, z: onWall ? it.z0 + 0.11 : f.z, w: 0.5, d: 0.3, y, face: 0 }, 1.3), name, seed + k * 11)) return
        }
        trace({ root: root, props: props, f: f, y0: y0, seed: seed + k * 11, onTable: (x, z) => (onWall ? y0 + 1.3 : heightAt(x, z)) })
      })
    if (!it.authored) dress({ root: root, gb: props, it: it, y0: y0, seed: seed, wd: wood(woodOfPiece("")) })
    const furnishings = props.build()
    furnishings.name = "interior-furniture"
    root.add(furnishings)
    if (it.drying) {
      const line = indoorLaundry(it.drying.z1 - it.drying.z0, seed)
      line.rotation.y = Math.PI / 2
      line.position.set(it.drying.x, y0 + 1.9, (it.drying.z0 + it.drying.z1) / 2)
      root.add(line)
    }
    // what hangs from the beams
    const hang = HANGING[shop ?? ""] ?? []
    hang.forEach((k, i) => {
      const g = new THREE.Group()
      g.position.set(it.x0 + 0.8 + i * 0.5, 0, it.z0 + 0.3)
      root.add(g)
      addSprite({ root: g, b: hanging(k, seed + i), x: 0, y: y0 + WALL_H - 34 / GPPU, z: 0 })
    })
    if (it.authored) for (const fixture of it.lamps ?? []) root.add(hangingLantern({ f: fixture, floorY: y0, scale: ROOM_SCALE, house: it.house.id }))
    else lamp({ root: root, x: (it.x0 + it.x1) / 2, z: (it.z0 + it.z1) / 2 + 0.6, y0: y0 })
    if (it.house.id === "h-m5" && !it.authored) noticeBoard({ root: root, x: (it.keeper[0] + 0.5) / 2, z: it.z0 + 0.06, y0: y0 })

    // the walk grid is the server's, exactly
    const rows = interiorRows(it)
    for (const j = { value: 0 }; j.value < WN; j.value++) for (const i = { value: 0 }; i.value < WN; i.value++) blocked[j.value * WN + i.value] = rows[j.value]?.[i.value] === "." ? 0 : 1
  }
}
