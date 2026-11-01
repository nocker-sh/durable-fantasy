import { unrepresentedRooms } from "#/world/town/floorplan/room-inventory"
import { enterable } from "#/world/town/enterable"
import { floorsOf } from "#/world/town/floors-of"
import type { HouseDef, Room } from "#/world/town/house-types"
import { TILE_M } from "#/world/town/fit"
import { TRACES } from "#/world/town/traces"
import type { FloorPlan, PRoom, Divider, Rect, DividerKind, Use, Placed } from "#/world/town/floorplan/types"
import { WALL, STAIR, DIV, DOORWAY, ELBOW_M } from "#/world/town/floorplan/geometry"
import { centre } from "#/world/town/floorplan/centre"
import { rect } from "#/world/town/floorplan/rect"
import { inside } from "#/world/town/floorplan/inside"
import { overlap } from "#/world/town/floorplan/overlap"
import { entries } from "#/world/town/floorplan/entries"
import { COUNTERS, WORK, TABLES, SEATS, SHELVES } from "#/world/town/floorplan/furniture"
import { useOf } from "#/world/town/floorplan/use-of"
import { sizeOf } from "#/world/town/floorplan/size-of"
import { split } from "#/world/town/floorplan/split"
import { across } from "#/world/town/floorplan/across"
import { along } from "#/world/town/floorplan/along"
import { Floor } from "#/world/town/floorplan/placement"

function layout(h: HouseDef, shopDepth: number, fire: "auto" | "wall" | "centre"): FloorPlan {
  // the wall with the door is the front: a door in the east or west wall turns the inside a quarter round,
  // so the room is as wide along its door wall, and as deep behind it, as the house outside
  const sideways = h.door.side === "e" || h.door.side === "w"
  const W = (sideways ? h.z1 - h.z0 : h.x1 - h.x0) * TILE_M - 2 * WALL,
    D = (sideways ? h.x1 - h.x0 : h.z1 - h.z0) * TILE_M - 2 * WALL
  const floors = floorsOf(h)
  const walkIn = enterable(h)
  const farm = h.kind === "farm"
  // the door stands where it does outside: `u` along the door wall from its left corner, seen from outside
  const door = Math.min(W - 0.8, Math.max(0.8, h.door.u * TILE_M - WALL))
  const rooms: PRoom[] = []
  const dividers: Divider[] = []
  /** the ways through partitions, kept clear */
  const gaps: Rect[] = []
  const unplaced: string[] = []
  const all = entries(h)
  const ground = h.plan.rooms.filter((r) => r.floor === 0)
  const upper = h.plan.rooms.filter((r) => r.floor > 0)
  const sleeps = (r: Room) => (r.beds ?? 0) > 0

  // ---------------------------------------------------------------- the ground floor
  // the front: the shop floor, the hall or the earth-floored entry; the back: kitchen, workshop, stores
  const hasCounter = all.some((e) => COUNTERS.test(e.name))
  const hall = ground.some((r) => /食堂|酒場|集会/.test(r.name))
  // a shop floor at the front with the work and the stores behind it
  const shopFront = !hall && (hasCounter || /店先|売り場|買取場|預かり場/.test(ground[0]?.name ?? ""))
  // one workroom with the hearth in the middle of it (a workshop with no counter)
  const oneRoom = !hall && !shopFront && (walkIn || h.kind === "workshop")
  const front = hall ? D * Math.min(0.78, shopDepth + 0.14) : shopFront ? Math.min(3.4, Math.max(1.8, D * shopDepth)) : Math.max(1.1, Math.min(1.6, D * 0.3) * (shopDepth / 0.48))
  // one comes in two steps inside the door (half a tile each): in a building one walks into, that has to be in front
  // of the partition, and in front of a counter set in it
  const step = TILE_M / 2
  const arrive = step / 2 + step * Math.floor((D - step / 2) / step) - 2 * step
  const counterDepth = Math.max(0, ...all.filter((e) => COUNTERS.test(e.name)).map((e) => Math.min(sizeOf(e.name)?.w ?? 0, sizeOf(e.name)?.d ?? 0)))
  const split0 = !walkIn || !(hall || shopFront) ? D - front : Math.min(D - front, arrive - step / 2 - 0.01, shopFront ? arrive - counterDepth / 2 - ELBOW_M - 0.01 : D)
  /** The middle of the step nearest `v` that lies within [lo, hi]: a doorway centred there can be walked through step by step. */
  const onStep = (v: number, lo: number, hi: number) =>
    [Math.floor((v - step / 2) / step), Math.ceil((v - step / 2) / step), Math.floor((v - step / 2) / step) - 1, Math.ceil((v - step / 2) / step) + 1]
      .map((k) => step / 2 + step * k)
      .filter((c) => c >= lo - 1e-6 && c <= hi + 1e-6)
      .sort((a, b) => Math.abs(a - v) - Math.abs(b - v))[0] ?? v
  // the stair rises along the east wall at the back, or along the back wall where the back room is too shallow to
  // hold it and the space at its foot short of the partition (its foot never opens through the partition onto the shop)
  const deep = !(hall || shopFront) || split0 - DIV / 2 >= STAIR.d + STAIR.front
  const stairRect: Rect | null = floors < 2 ? null : deep ? { x0: W - STAIR.w, z0: 0, x1: W, z1: STAIR.d } : { x0: W - STAIR.d, z0: 0, x1: W, z1: STAIR.w }
  const stairFoot: Rect | null = !stairRect
    ? null
    : deep
      ? { x0: W - STAIR.w - 0.1, z0: STAIR.d, x1: W, z1: STAIR.d + STAIR.front }
      : { x0: W - STAIR.d - STAIR.front, z0: 0, x1: W - STAIR.d, z1: STAIR.w + 0.1 }
  const backRooms = ground.length > 1 ? ground.slice(1) : []
  const frontRoom = ground[0]
  /** the room they live or work in, round the hearth; the household's other rooms on this floor open off it */
  const main = { value: null as PRoom | null }
  const side: Room[] = []
  if (farm) {
    // a farm building's rooms stand side by side across it, a low wall between each that stops short of the front,
    // where one walks from the door to all of them
    const named = ground.length ? ground : [{ name: "納屋", floor: 0 }]
    const parts = split(0, W, named.length)
    named.forEach((r, k) => rooms.push({ name: r.name, use: useOf(r.name), floor: 0, x0: parts[k][0], z0: 0, x1: parts[k][1], z1: D }))
    for (let k = 1; k < parts.length; k++) dividers.push(...along({ floor: 0, kind: "腰壁", z0: 0, z1: Math.max(0.5, D - 1.3), x: parts[k][0] - DIV / 2, gz: null }))
  } else if (oneRoom) {
    // one workroom over the whole floor, the household's other rooms off it along the back wall
    const work = ground.find((r) => !sleeps(r)) ?? frontRoom
    main.value = { name: work?.name ?? "仕事場", use: useOf(work?.name ?? "仕事場"), floor: 0, x0: 0, z0: 0, x1: W, z1: D }
    rooms.push(main.value)
    side.push(...ground.filter((r) => r !== work))
  } else if (hall || shopFront) {
    rooms.push({ name: frontRoom.name, use: useOf(frontRoom.name), floor: 0, x0: 0, z0: split0, x1: W, z1: D })
    // the shop is closed off from the back by a partition (shelves in a shop, a wall in a workshop), a doorway at the west end
    const kind: DividerKind = hall ? "腰壁" : h.shop ? "棚" : "壁"
    dividers.push(...across({ floor: 0, kind: kind, x0: 0, x1: W, z: split0, gx: 0.75, gap: 1.0 }))
    gaps.push({ x0: 0.25, z0: split0 - 0.7, x1: 1.25, z1: split0 + 0.7 })
    // where customers come in, a curtain hangs in that doorway: the back is the household's
    if (walkIn) dividers.push({ floor: 0, kind: "カーテン", staff: true, x0: 0.25, x1: 1.25, z0: split0 - DIV / 2, z1: split0 + DIV / 2 })
    const parts = backRooms.length ? split(0, W, backRooms.length) : [[0, W] as [number, number]]
    ;(backRooms.length ? backRooms : [{ name: "奥の仕事場", floor: 0 }]).forEach((r, k) =>
      rooms.push({ name: r.name, use: useOf(r.name), floor: 0, x0: parts[k][0], z0: 0, x1: parts[k][1], z1: split0 - DIV / 2 }),
    )
    for (let k = 1; k < parts.length; k++)
      dividers.push(...along({ floor: 0, kind: "腰壁", z0: 0, z1: split0 - DIV / 2, x: parts[k][0] - DIV / 2, gz: onStep(split0 * 0.6, 0.5, split0 - DIV / 2 - 0.5), gap: 0.9 }))
  } else {
    // a home: the earth-floored entry at the front behind a low wall (named as the plan names it), the room round
    // the hearth behind it, and the household's other rooms on this floor off that room along the back wall
    const entryRoom = ground.find((r) => /土間/.test(r.name) && !sleeps(r))
    const living = ground.find((r) => r !== entryRoom && !sleeps(r) && /居間/.test(r.name)) ?? ground.find((r) => r !== entryRoom && !sleeps(r)) ?? ground.find((r) => r !== entryRoom)
    rooms.push({ name: entryRoom?.name ?? "土間", use: "土間", floor: 0, x0: 0, z0: split0, x1: W, z1: D })
    main.value = { name: living?.name ?? "居間兼台所", use: useOf(living?.name ?? "居間"), floor: 0, x0: 0, z0: 0, x1: W, z1: split0 - DIV / 2 }
    rooms.push(main.value)
    // the low wall runs from the side away from the door, leaving the way in open
    const wallFromWest = door > W / 2
    dividers.push(...across({ floor: 0, kind: "腰壁", x0: wallFromWest ? 0 : W * 0.55, x1: wallFromWest ? W * 0.45 : W, z: split0, gx: null }))
    side.push(...ground.filter((r) => r !== entryRoom && r !== living))
  }
  // the other rooms stand side by side along the back wall, from the side away from the stair (which rises by the
  // east wall) or, on one floor, away from the door; each is walled (curtained, for a sleeping corner) with a doorway
  // into the main room, and the main room's things keep out of them
  const alcoves: PRoom[] = []
  const shut = new Map<PRoom, Rect>()
  if (main.value && side.length) {
    const room = main.value
    const fromWest = floors > 1 || door > W / 2
    const limit = floors > 1 ? W - STAIR.w - 0.1 - 0.5 : W
    const reach = { value: fromWest ? 0 : W }
    for (const r of side) {
      const use = sleeps(r) ? "寝間" : useOf(r.name)
      const bedWidths = all.filter((e) => e.room === r.name && /寝台/.test(e.name)).map((e) => sizeOf(e.name)?.w ?? 0.9)
      const width = sleeps(r) ? Math.max(1.5, bedWidths.reduce((a, b) => a + b, 0) + 0.15 * Math.max(0, bedWidths.length - 1) + 0.6) : use === "台所" ? 1.9 : 1.7
      // a bed stands with its head to the back wall and room to get in beside it; a kitchen or a store is shallower,
      // and leaves more of the room in front of it
      const depth = sleeps(r) ? Math.min(2.7, room.z1 - room.z0 - 0.9) : Math.min(use === "台所" ? 2.0 : 1.9, room.z1 - room.z0 - 1.6)
      const x0 = fromWest ? reach.value : reach.value - width
      const x1 = fromWest ? reach.value + width : reach.value
      // a room that will not go beside the others stays undrawn, and the plan records it as unrepresented
      if ((fromWest ? x1 > limit : x0 < 0) || depth < (sleeps(r) ? 2.5 : 1.4)) continue
      const a: PRoom = { name: r.name, use, floor: 0, x0, z0: room.z0, x1, z1: room.z0 + depth }
      alcoves.push(a)
      rooms.push(a)
      const kind: DividerKind = use === "台所" ? "腰壁" : use === "寝間" && /隅|寝床/.test(r.name) ? "カーテン" : "壁"
      const inner = fromWest ? x1 + DIV / 2 : x0 - DIV / 2
      dividers.push(...along({ floor: 0, kind, z0: room.z0, z1: a.z1 + DIV, x: inner, gz: null }))
      const gx = onStep((x0 + x1) / 2, x0 + 0.3, x1 - 0.3)
      dividers.push(...across({ floor: 0, kind, x0: fromWest ? x0 : x0 - DIV, x1: fromWest ? x1 + DIV : x1, z: a.z1 + DIV / 2, gx: gx, gap: 0.8 }))
      // the way in stays open on both sides of the doorway
      const way: Rect = { x0: gx - 0.4, z0: a.z1 - 0.5, x1: gx + 0.4, z1: a.z1 + DIV + 0.6 }
      gaps.push(way)
      shut.set(a, { x0: a.x0, z0: a.z0, x1: a.x1, z1: a.z1 })
      reach.value = fromWest ? x1 + DIV : x0 - DIV
    }
  }
  // no partition runs into the stair or across its foot
  if (stairRect && stairFoot) {
    const keep: Divider[] = []
    for (const d of dividers) {
      const hit = [stairRect, stairFoot].find((r) => d.floor === 0 && d.x0 < r.x1 && r.x0 < d.x1 && d.z0 < r.z1 && r.z0 < d.z1)
      if (!hit) {
        keep.push(d)
        continue
      }
      // a partition across x is cut short of it; one along z is cut short in z
      if (d.x1 - d.x0 >= d.z1 - d.z0) {
        if (hit.x0 - d.x0 > 0.1) keep.push({ ...d, x1: hit.x0 - 0.05 })
        if (d.x1 - hit.x1 > 0.1) keep.push({ ...d, x0: hit.x1 + 0.05 })
      } else {
        if (hit.z0 - d.z0 > 0.1) keep.push({ ...d, z1: hit.z0 - 0.05 })
        if (d.z1 - hit.z1 > 0.1) keep.push({ ...d, z0: hit.z1 + 0.05 })
      }
    }
    dividers.length = 0
    dividers.push(...keep)
  }
  const f0 = new Floor({ floor: 0, width: W, depth: D, dividers: dividers })
  // keep the doorway and the foot of the stair clear
  // the door, the foot of the stair and the ways through partitions must stay within reach of each other
  f0.from = [door, D - 0.3]
  if (stairFoot) f0.targets.push(stairFoot)
  f0.targets.push(...gaps)
  const dw = farm ? { w: 0.6, d: 0.4 } : DOORWAY
  f0.clear.push({ x0: door - dw.w / 2, z0: D - dw.d, x1: door + dw.w / 2, z1: D }, ...gaps)
  if (stairRect) {
    f0.add({ name: "階段", floor: 0, ...stairRect, solid: true, wall: true }, stairFoot)
  }
  // the room the household lives in down here: where the hearth goes
  const roomOf = (u: Use[]) => rooms.find((r) => r.floor === 0 && u.includes(r.use))
  // behind a shop it is the back room (the first one, where the stair is); in a home or a hall, the room they eat in
  const home = !farm && !oneRoom && !hall && !shopFront
  const living = farm
    ? null
    : shopFront
      ? (rooms.find((r) => r.floor === 0 && r !== rooms[0] && r.use !== "売り場" && r.x1 >= W - 0.01) ?? rooms[1] ?? rooms[0])
      : home || oneRoom
        ? (main.value ?? rooms[0])
        : (roomOf(["食事", "台所"]) ?? roomOf(["作業場"]) ?? roomOf(["貯蔵"]) ?? rooms[0])
  /** Try a placement with one of the side rooms opened to it (the others stay shut to it). */
  const within = (r: Rect, put: () => Placed | null): Placed | null => {
    const s = shut.get(r as PRoom)
    const k = s ? f0.clear.indexOf(s) : -1
    if (k >= 0) f0.clear.splice(k, 1)
    const got = put()
    if (k >= 0 && s) f0.clear.splice(k, 0, s)
    return got
  }

  const place = (inputProps: { name: string; room: Rect | undefined; how: "wall" | "near"; at?: [number, number]; sides?: ("n" | "e" | "s" | "w")[]; from?: number; quiet?: boolean }) => {
    const name = inputProps.name
    const room = inputProps.room
    const how = inputProps.how
    const at = inputProps.at
    const sides: NonNullable<typeof inputProps.sides> = inputProps.sides === undefined ? ["n", "w", "e"] : inputProps.sides
    const from = inputProps.from === undefined ? 0.5 : inputProps.from

    const s = sizeOf(name)
    if (!s || !room) {
      if (s) unplaced.push(name)
      return null
    }
    const tryIn = (r: Rect, first: boolean) =>
      within(r, () =>
        how === "wall" || !first
          ? (f0.againstWall({
              name: name,
              w: s.w,
              d: s.d,
              front: farm ? 0.1 : s.front,
              room: r,
              sides: [...sides, ...(["n", "w", "e", "s"] as const).filter((x) => !sides.includes(x))],
              from: from,
            }) ?? f0.near({ name: name, w: s.w, d: s.d, front: Math.min(s.front, 0.5), room: r, at: first && at ? at : centre(r) }))
          : (f0.near({ name: name, w: s.w, d: s.d, front: Math.min(s.front, 0.6), room: r, at: at ?? centre(r) }) ??
            f0.againstWall({ name: name, w: s.w, d: s.d, front: s.front, room: r, sides: sides, from: from })),
      )
    // where it was meant to go, else any other room downstairs but the sleeping corner
    const p = tryIn(room, true) ?? rooms.filter((r) => r.floor === 0 && r !== room && r.use !== "寝間").reduce<Placed | null>((got, r) => got ?? tryIn(r, false), null)
    if (!p && !inputProps.quiet) unplaced.push(name)
    return p
  }
  // the sleeping rooms down here take their sleepers' beds first, and the clothes chest at their feet; after that
  // every side room is shut to the main room's things
  const isChest = (n: string) => n === "衣装箱" || n === "箪笥"
  for (const corner of alcoves.filter((r) => r.use === "寝間")) {
    all
      .filter((e) => !e.up && e.room === corner.name && (/寝台/.test(e.name) || isChest(e.name)))
      .forEach((e, k) => {
        const sz = sizeOf(e.name)!
        const chest = isChest(e.name)
        const got =
          f0.againstWall({ name: e.name, w: sz.w, d: sz.d, front: chest ? 0.3 : sz.front, room: corner, sides: chest ? ["s", "e", "w"] : ["n", "w", "e"], from: k % 2 ? 1 : 0 }) ??
          (chest
            ? (f0.againstWall({ name: e.name, w: sz.w, d: sz.d, front: 0, room: corner, sides: ["e", "w", "n", "s"], from: 0 }) ??
              f0.near({ name: e.name, w: sz.w, d: sz.d, front: 0, room: corner, at: centre(corner) }))
            : null)
        // a chest with no room in the corner stands out in the room with the rest
        if (got || !chest) {
          if (!got) unplaced.push(e.name)
          e.name = `placed:${e.name}`
        }
      })
  }
  for (const s of shut.values()) f0.clear.push(s)
  const shop = rooms.find((r) => r.floor === 0 && r.use === "売り場")
  // a shop or a hall one walks into serves across a counter set in the partition at the back of its floor: the keeper
  // stands behind it on the household's side, the customers keep to the front, and one comes in well in front of it
  const setInPartition = (name: string): Placed | null => {
    const s = sizeOf(name)
    if (!s) return null
    const len = Math.max(s.w, s.d),
      dd = Math.min(s.w, s.d)
    const xs: number[] = []
    // clear of the doorway at the west end of the partition
    for (let x = 1.45 + len / 2; x <= W - 0.1 - len / 2 + 1e-6; x += 0.1) xs.push(x)
    xs.sort((a, b) => Math.abs(a - W / 2) - Math.abs(b - W / 2))
    for (const x of xs) {
      const r = rect({ x: x, z: split0, w: len, d: dd })
      // where the keeper stands, and where the customers stand
      const behind: Rect = { x0: r.x0, z0: r.z0 - 0.8, x1: r.x1, z1: r.z0 }
      const before: Rect = { x0: r.x0, z0: r.z1, x1: r.x1, z1: r.z1 + 0.5 }
      if (f0.pieces.some((p) => p.solid && (overlap(p, behind) || overlap(p, before)))) continue
      if (dividers.some((d) => d.floor === 0 && overlap(d, behind))) continue
      // the partition gives way to the counter
      const was = [...dividers]
      const cut: Divider[] = []
      for (const d of dividers) {
        if (d.floor !== 0 || d.x1 - d.x0 < d.z1 - d.z0 || !(d.z0 < split0 && split0 < d.z1) || !overlap(d, r)) {
          cut.push(d)
          continue
        }
        if (r.x0 - d.x0 > 0.05) cut.push({ ...d, x1: r.x0 })
        if (d.x1 - r.x1 > 0.05) cut.push({ ...d, x0: r.x1 })
      }
      dividers.length = 0
      dividers.push(...cut)
      if (f0.free(r, before)) {
        const p: Placed = { name: name, floor: 0, ...r, solid: true, wall: false }
        f0.add(p, before)
        f0.clear.push(behind)
        return p
      }
      dividers.length = 0
      dividers.push(...was)
    }
    return null
  }
  const served: Placed[] = []
  if (walkIn && (shopFront || hall))
    for (const e of all.filter((x) => !x.up && COUNTERS.test(x.name))) {
      const got = setInPartition(e.name)
      if (got) {
        served.push(got)
        e.name = `placed:${e.name}`
      }
    }
  // the hearth in the middle of the room they live in, and the table at it
  let hearth: Placed | null = null
  if (h.plan.hearth && living) {
    const c = centre(living)
    const at: [number, number] = [Math.min(c[0], (stairRect ? stairRect.x0 : living.x1) - 1.6), c[1]]
    const fireplace = all.some((e) => e.name === "暖炉")
    // a home's hearth stands in the middle of its room; a hall's fire is in its side wall, the tables round it
    // (a room too narrow for a table beside a fire in its middle has the fire in its side wall instead)
    const narrow = fire === "auto" ? living.x1 - living.x0 < 4.2 || living.z1 - living.z0 < 3.0 : fire === "wall"
    hearth = fireplace
      ? f0.againstWall({ name: "暖炉", w: 1.4, d: 0.7, front: 1.0, room: living, sides: ["n", "w"], from: 0.4 })
      : hall || narrow
        ? f0.againstWall({ name: "炉", w: 1.2, d: 1.0, front: 0.6, room: living, sides: ["w", "e", "n"], from: 0.5 })
        : f0.near({ name: "炉", w: 1.2, d: 1.0, front: 0.6, room: living, at: at })
    if (!hearth) unplaced.push(fireplace ? "暖炉" : "炉")
    else f0.targets.push(hearth)
  }
  // a hall cooks for its guests in its own kitchen, on a fire against the kitchen's back wall (the big pot hangs over it)
  const kitchen = rooms.find((r) => r.floor === 0 && r.use === "台所")
  if (hall && h.plan.hearth && h.plan.kitchen && kitchen) {
    const cook = within(kitchen, () => f0.againstWall({ name: "炉", w: 1.2, d: 1.0, front: 0.6, room: kitchen, sides: ["n", "w", "e"], from: 0.3 }))
    if (!cook) unplaced.push("炉")
    else f0.targets.push(cook)
  }
  // the kitchen worktop against a wall of the kitchen, or of the room by the fire, or of the entry, before the
  // trade's big pieces take the walls' floor
  const top = sizeOf("台所の台")!
  const worktop =
    h.plan.hearth && h.plan.kitchen && living
      ? [kitchen, living, rooms.find((r) => r.floor === 0 && r.use === "土間")]
          .filter((r): r is PRoom => !!r)
          .reduce<Placed | null>((got, r) => got ?? within(r, () => f0.againstWall({ name: "台所の台", w: top.w, d: top.d, front: top.front, room: r, sides: ["n", "w", "e", "s"], from: 0.3 })), null)
      : null
  const groundEntries = all.filter((e) => !e.up && e.name !== "暖炉" && !e.name.startsWith("placed:"))
  // each piece goes once, to the first list that takes it
  const take = (test: (n: string) => boolean) =>
    groundEntries
      .filter((e) => !e.name.startsWith("placed:") && test(e.name))
      .map((e) => {
        const name = e.name
        e.name = `placed:${name}`
        return name
      })
  // the counter across the shop (or along the hall), the keeper behind it with the back partition behind them
  const hallRoom = hall ? rooms.find((r) => r.floor === 0 && r.use === "食事") : undefined
  const counterRoom = shop ?? hallRoom
  for (const name of take((n) => COUNTERS.test(n))) {
    const s = sizeOf(name)!
    const dd = Math.min(s.w, s.d)
    const band = counterRoom ? { ...counterRoom, z0: counterRoom.z0 + 0.75, z1: counterRoom.z0 + 0.75 + dd } : null
    const p = band ? f0.near({ name: name, w: Math.max(s.w, s.d), d: dd, front: 0.4, room: band, at: [W / 2, band.z0] }) : null
    if (p) p.wall = false
    else place({ name: name, room: counterRoom ?? living ?? undefined, how: "wall", at: undefined, sides: ["w", "e", "n"] })
  }
  // the trade's big pieces stand free in the workshop
  const work = rooms.find((r) => r.floor === 0 && r.use === "作業場") ?? living ?? rooms[0]
  const bigWork = (n: string) => /木工台|作業台|搾り台|干し草|荷車/.test(n)
  // on a farm each thing goes to the room named for it, against its walls: the hay and the grain to the hay store,
  // the tools and the cart to the tool store, the hens' things to the coop; the floor between stays open for work
  const farmRoom = (n: string): PRoom => {
    const here = rooms.filter((r) => r.floor === 0)
    const by = (re: RegExp) => here.find((r) => re.test(r.name))
    const named = /干し草|麦|藁|飼い葉/.test(n) ? by(/干し草|藁|穀|麦/) : /荷車|鋤|鍬|鎌|農具/.test(n) ? by(/農具|道具/) : /止まり木|巣箱|産卵箱/.test(n) ? by(/鶏/) : undefined
    return named ?? here[0]
  }
  for (const name of take((n) => WORK.test(n) && bigWork(n)))
    if (farm) place({ name: name, room: farmRoom(name), how: "wall", sides: ["n", "w", "e"] })
    else place({ name: name, room: work, how: "near", at: [centre(work)[0] - 0.5, centre(work)[1]] })
  // tables round the hearth, spread about it
  const near: [number, number] = hearth ? [(hearth.x0 + hearth.x1) / 2, (hearth.z0 + hearth.z1) / 2] : living ? centre(living) : [W / 2, D / 2]
  const tableRoom = hallRoom ?? living
  const tableNames = take((n) => TABLES.test(n))
  // in a hall one walks in from the door straight to the counter between the tables, which stand either side of
  // that way, over the whole floor
  const way: Rect | null = hall && walkIn && tableRoom ? { x0: door - 0.5, z0: (served[0]?.z1 ?? tableRoom.z0) + 0.5, x1: door + 0.5, z1: D } : null
  if (way) f0.clear.push(way)
  const sideOf = (k: number, n: number): [number, number] | null => {
    if (!way || !tableRoom) return null
    const west = { x0: tableRoom.x0, x1: way.x0 },
      east = { x0: way.x1, x1: tableRoom.x1 }
    // the wider side takes the first table, the sides take turns
    const sides = west.x1 - west.x0 >= east.x1 - east.x0 ? [west, east] : [east, west]
    const half = sides[k % 2]
    const rowsHere = Math.ceil((n - (k % 2)) / 2)
    const row = Math.floor(k / 2)
    return [(half.x0 + half.x1) / 2, tableRoom.z0 + ((row + 0.5) * (tableRoom.z1 - tableRoom.z0)) / Math.max(1, rowsHere)]
  }
  tableNames.forEach((name, k) => {
    const s = sizeOf(name)!
    const room = tableRoom ?? rooms[0]
    // first round the fire (in a hall, its place on its side of the way), out of reach of the walls; then anywhere it will go
    const inset: Rect = { x0: room.x0 + 0.45, z0: room.z0 + 0.45, x1: room.x1 - 0.45, z1: room.z1 - 0.45 }
    const spot = sideOf(k, tableNames.length)
    const spread = spot && inset.x1 - inset.x0 > s.d && inset.z1 - inset.z0 > s.d ? f0.near({ name: name, w: s.w, d: s.d, front: 0.45, room: inset, at: spot }) : null
    if (spread) {
      f0.targets.push(spread)
      return
    }
    for (const r of hall ? [1.9, 2.4] : [1.2, 1.6, 2.0])
      for (let t = 0; t < 8; t++) {
        const a = ((k + t / 8) / Math.max(1, tableNames.length)) * Math.PI * 2 + 0.3
        const got =
          inset.x1 - inset.x0 > s.d && inset.z1 - inset.z0 > s.d
            ? f0.near({ name: name, w: s.w, d: s.d, front: 0.45, room: inset, at: [near[0] + Math.cos(a) * r, near[1] + Math.sin(a) * r * 0.7] })
            : null
        if (got) {
          f0.targets.push(got)
          return
        }
      }
    const got = place({ name: name, room: room, how: "near", at: near })
    if (got) f0.targets.push(got)
  })
  // seats are drawn up to the tables (or to the fire): they stand in the tables' own clear space
  const tablesHere = f0.pieces.filter((p) => TABLES.test(p.name))
  const seatRoom = tableRoom ?? rooms[0]
  take((n) => SEATS.test(n)).forEach((name, k) => {
    const s = sizeOf(name)!
    const spotsAt = (tbl: Rect): Rect[] => {
      const cx = (tbl.x0 + tbl.x1) / 2,
        cz = (tbl.z0 + tbl.z1) / 2
      // a bench runs along a long side of the table
      if (/長椅子/.test(name))
        return tbl.z1 - tbl.z0 > tbl.x1 - tbl.x0
          ? [rect({ x: tbl.x1 + s.d / 2 + 0.05, z: cz, w: s.d, d: Math.min(s.w, tbl.z1 - tbl.z0 + 0.4) }), rect({ x: tbl.x0 - s.d / 2 - 0.05, z: cz, w: s.d, d: Math.min(s.w, tbl.z1 - tbl.z0 + 0.4) })]
          : [rect({ x: cx, z: tbl.z1 + s.d / 2 + 0.05, w: Math.min(s.w, tbl.x1 - tbl.x0 + 0.4), d: s.d }), rect({ x: cx, z: tbl.z0 - s.d / 2 - 0.05, w: Math.min(s.w, tbl.x1 - tbl.x0 + 0.4), d: s.d })]
      return [
        rect({ x: cx, z: tbl.z1 + s.d / 2 + 0.05, w: s.w, d: s.d }),
        rect({ x: cx, z: tbl.z0 - s.d / 2 - 0.05, w: s.w, d: s.d }),
        rect({ x: tbl.x0 - s.d / 2 - 0.05, z: cz, w: s.d, d: s.w }),
        rect({ x: tbl.x1 + s.d / 2 + 0.05, z: cz, w: s.d, d: s.w }),
        rect({ x: tbl.x0 + s.w / 2, z: tbl.z1 + s.d / 2 + 0.05, w: s.w, d: s.d }),
        rect({ x: tbl.x1 - s.w / 2, z: tbl.z1 + s.d / 2 + 0.05, w: s.w, d: s.d }),
        rect({ x: tbl.x0 + s.w / 2, z: tbl.z0 - s.d / 2 - 0.05, w: s.w, d: s.d }),
        rect({ x: tbl.x1 - s.w / 2, z: tbl.z0 - s.d / 2 - 0.05, w: s.w, d: s.d }),
      ]
    }
    const byFire = hearth
      ? [
          rect({ x: hearth.x1 + 0.15 + s.w / 2, z: (hearth.z0 + hearth.z1) / 2, w: s.w, d: s.d }),
          rect({ x: hearth.x0 - 0.15 - s.w / 2, z: (hearth.z0 + hearth.z1) / 2, w: s.w, d: s.d }),
          rect({ x: (hearth.x0 + hearth.x1) / 2, z: hearth.z1 + 0.15 + s.d / 2, w: s.w, d: s.d }),
        ]
      : []
    // in a hall, a seat with no table to go to is drawn up to the customers' side of the counter
    const atCounter = hall
      ? served.flatMap((c) =>
          Array.from({ length: Math.max(1, Math.floor((c.x1 - c.x0 + 0.15) / (s.w + 0.15))) }, (_, n) => rect({ x: c.x0 + s.w / 2 + n * (s.w + 0.15), z: c.z1 + s.d / 2 + 0.05, w: s.w, d: s.d })),
        )
      : []
    const order = /揺り椅子/.test(name) ? byFire : [...tablesHere.slice(k % Math.max(1, tablesHere.length)), ...tablesHere].flatMap(spotsAt).concat(atCounter, byFire)
    const ok = (r: Rect) => inside(r, seatRoom) && !f0.pieces.some((p) => overlap(r, p, -0.01)) && !dividers.some((d) => d.floor === 0 && overlap(r, d))
    const at = order.find(ok)
    if (!at) {
      unplaced.push(name)
      return
    }
    f0.pieces.push({ name: k === 0 && !/揺り椅子|長椅子/.test(name) ? `${name}（引いたまま）` : name, floor: 0, ...at, solid: false, wall: false })
  })
  // standing free in the room only where no wall had room for it
  if (h.plan.hearth && h.plan.kitchen && living && !worktop) place({ name: "台所の台", room: kitchen ?? living, how: "wall", at: undefined, sides: ["n", "w", "e"], from: 0.3 })
  // the rest of the trade's things along the workshop's walls
  // (the big pot goes on the kitchen fire, where there is a kitchen)
  for (const name of take((n) => WORK.test(n) && !bigWork(n))) place({ name: name, room: farm ? farmRoom(name) : name === "大鍋" ? (kitchen ?? work) : work, how: "wall" })
  // a hall keeps its stores, its crockery and its fuel in its kitchen
  const store = rooms.find((r) => r.floor === 0 && r.use === "貯蔵") ?? (hall && kitchen ? kitchen : work)
  // the goods on sale stand in the shop, along its side and front walls
  const GOODS = /商品棚|薬棚|陳列|^(パン籠|果物籠|野菜籠|魚桶)$/
  const forSale = (n: string) => !!shop && GOODS.test(n) && (n.endsWith("棚") || !!h.shop)
  for (const name of take((n) => SHELVES.test(n))) place({ name: name, room: forSale(name) ? shop : store, how: "wall", at: undefined, sides: forSale(name) ? ["w", "e", "s"] : ["n", "w", "e"] })
  // containers by the door in the entry, or in the stores; beds and chests in their sleepers' rooms
  const entry = rooms.find((r) => r.floor === 0 && r.use === "土間") ?? store
  const ownRoom = (n?: string) => (n ? rooms.find((x) => x.floor === 0 && x.name === n) : undefined)
  for (const e of groundEntries.filter((x) => !x.name.startsWith("placed:"))) {
    const name = e.name
    if (!sizeOf(name) || COUNTERS.test(name) || TABLES.test(name) || SEATS.test(name) || WORK.test(name) || SHELVES.test(name)) continue
    e.name = `placed:${name}`
    const r = farm
      ? farmRoom(name)
      : /寝台/.test(name) || isChest(name)
        ? (ownRoom(e.room) ?? rooms.find((x) => x.floor === 0 && x.use === "寝間") ?? living)
        : forSale(name)
          ? shop
          : /樽|甕|桶|籠|箱|袋|薪|木材/.test(name)
            ? entry
            : living
    // a chest with no room downstairs goes up to the bedrooms
    const moveUp = isChest(name) && floors > 1
    if (!place({ name: name, room: r ?? undefined, how: "wall", at: undefined, sides: ["w", "e", "n", "s"], quiet: moveUp }) && moveUp) {
      e.name = name
      e.up = true
      e.room = undefined
    }
  }
  // odds and ends: what a lived-in house gathers along its walls over the years, wherever there is
  // still room for them and the way through stays open (a wash tub, a crate, a stool, a cask, a basket);
  // nothing the household has already
  if (h.household && h.plan.hearth && h.kind !== "public") {
    const odds = ["洗濯桶", "木箱", "腰掛け", "樽", "野菜籠", "木箱", "腰掛け"]
    const want = Math.min(odds.length, Math.floor((W * D) / 8))
    const spare = rooms.filter((r) => r.floor === 0 && r.use !== "寝間" && r.use !== "売り場" && r.name !== "廊下")
    const owned = new Set(all.map((e) => e.name.replace(/^placed:/, "")))
    for (let i = 0; i < want; i++) {
      const name = odds[(h.seed + i) % odds.length]
      if (owned.has(name)) continue
      const s = sizeOf(name)!
      for (const r of spare) if (f0.againstWall({ name, w: s.w, d: s.d, front: 0.2, room: r, sides: i % 2 ? ["e", "n", "w"] : ["w", "n", "e"], from: i % 3 === 0 ? 0 : 1 })) break
    }
  }

  // ---------------------------------------------------------------- upstairs: where the household lives
  const pieces: Placed[] = [...f0.pieces]
  for (let floor = 1; floor < floors; floor++) {
    const here = upper.filter((r) => r.floor === floor)
    const fl = new Floor({ floor: floor, width: W, depth: D, dividers: dividers })
    // the stair comes up at the back of the east wall: its head and landing stay clear
    if (stairRect) fl.add({ name: "階段の口", floor, ...stairRect, solid: true, wall: true }, stairFoot)
    // one comes up at the stair's head, and must reach every bed from there
    if (stairFoot) fl.from = centre(stairFoot)
    // rooms side by side across the floor, a passage along the front to reach them all (where the stair lies along
    // the back wall, the passage runs along the back, past the head of the stair and in front of it)
    const passage = deep ? 1.0 : STAIR.w + 0.1 + 0.8
    // where the stair rises by the east wall, it comes up onto a landing that runs beside it to the passage: the
    // rooms stand beside the landing, and nobody's room is the way up
    const landing = stairRect && deep ? STAIR.w + 0.1 : 0
    const span = landing ? W - landing - DIV : W
    // each room as wide as its beds need (a bed and a half of width each), the rest shared out
    const weights = here.map((r) => Math.max(1.3, (r.beds ?? 0) * 1.05 + 0.3))
    const total = weights.reduce((a, b) => a + b, 0) || 1
    const parts: [number, number][] = []
    let x = 0
    for (const w of weights) {
      const width = ((span - DIV * (here.length - 1)) * w) / total
      parts.push([x, x + width])
      x += width + DIV
    }
    if (!parts.length) parts.push([0, W])
    // the passage runs along the side the stair comes up on: the front, or the back where the stair lies along the back wall
    const back = !deep
    const rz0State = back ? [passage + DIV / 2, D] : [0, D - passage - DIV / 2],
      rz0 = rz0State[0],
      rz1 = rz0State[1]
    here.forEach((r, k) => {
      const aState2 = parts[k],
        a = aState2[0],
        b = aState2[1]
      rooms.push({ name: r.name, use: useOf(r.name), floor, x0: a, z0: rz0, x1: b, z1: rz1 })
      // a room of one's own (a guest's, a child's, a couple's) is walled off with a doorway onto the passage; a
      // sleeping place in the loft hangs a curtain; a store keeps a low wall
      const walled = /客室|部屋|寝室/.test(r.name)
      if (k > 0) dividers.push(...along({ floor: floor, kind: walled || /客室|部屋|寝室/.test(here[k - 1].name) ? "壁" : "カーテン", z0: rz0, z1: rz1, x: a - DIV / 2, gz: null }))
      dividers.push(
        ...across({
          floor: floor,
          kind: /倉|物置|蔵|乾燥/.test(r.name) ? "腰壁" : walled ? "壁" : "カーテン",
          x0: a,
          x1: b,
          z: back ? passage : D - passage,
          gx: onStep((a + b) / 2, a + 0.3, b - 0.3),
          gap: 0.8,
        }),
      )
    })
    rooms.push({ name: "廊下", use: "住まい", floor, x0: 0, z0: back ? 0 : D - passage, x1: W, z1: back ? passage : D })
    if (landing) {
      rooms.push({ name: "階段の上", use: "住まい", floor, x0: W - landing, z0: rz0, x1: W, z1: rz1 })
      dividers.push(...along({ floor, kind: "壁", z0: rz0, z1: rz1, x: span + DIV / 2, gz: null }))
    }
    const up = all.filter((e) => e.up)
    // beds one to a person, each in its sleeper's room
    let bedRoom = 0
    const roomsUp = rooms.filter((r) => r.floor === floor && r.name !== "廊下" && r.name !== "階段の上")
    for (const r of here)
      for (const e of up.filter((x) => /寝台/.test(x.name) && x.room === r.name)) {
        up.splice(up.indexOf(e), 1)
        const name = e.name
        const room = roomsUp.find((x) => x.name === r.name)!
        const s = sizeOf(name)!
        const p = fl.againstWall({ name: name, w: s.w, d: s.d, front: s.front, room: room, sides: deep ? ["n", "w", "e"] : ["s", "w", "e"], from: bedRoom % 2 ? 1 : 0 })
        if (!p) unplaced.push(`${name}（2階）`)
        else fl.targets.push(p)
        bedRoom++
      }
    // each sleeper's room keeps its own clothes chest, by the beds
    for (const r of here)
      for (const e of up.filter((x) => isChest(x.name) && x.room === r.name)) {
        const room = roomsUp.find((x) => x.name === r.name)!
        const s = sizeOf(e.name)!
        const p =
          fl.againstWall({ name: e.name, w: s.w, d: s.d, front: 0.3, room: room, sides: deep ? ["n", "w", "e", "s"] : ["s", "w", "e", "n"], from: 0.5 }) ??
          fl.near({ name: e.name, w: s.w, d: s.d, front: 0.3, room: room, at: centre(room) })
        if (!p) continue
        up.splice(up.indexOf(e), 1)
      }
    // what else lives upstairs: a chest that found no room by its beds, the loom by a window, the shelves of stores
    for (const e of up) {
      const s = sizeOf(e.name)
      if (!s) continue
      const room =
        (/衣装箱|本棚/.test(e.name) ? roomsUp.find((r) => r.use === "寝間" || r.use === "客室") : (roomsUp.find((r) => r.use === "貯蔵") ?? roomsUp.find((r) => r.use === "作業場"))) ?? roomsUp[0]
      const p = room
        ? (fl.againstWall({ name: e.name, w: s.w, d: s.d, front: s.front, room: room, sides: ["w", "e", "n", "s"] }) ??
          fl.near({ name: e.name, w: s.w, d: s.d, front: 0.4, room: room, at: centre(room) }))
        : null
      if (!p) unplaced.push(`${e.name}（2階）`)
    }
    void bedRoom
    pieces.push(...fl.pieces.filter((p) => p.name !== "階段の口"))
  }

  // ---------------------------------------------------------------- traces of the life lived here
  // what hangs on a wall goes on a wall of the room they live in, clear of the sleeping rooms and of anything tall
  const wallSpot = (): Rect | null => {
    const r = living ?? rooms[0]
    const taken = pieces.filter((p) => p.on === "壁")
    const tall = (p: Placed) => p.floor === 0 && p.solid && /棚|階段|暖炉|箪笥|機織り機/.test(p.name)
    for (let x = r.x0 + 0.35; x <= r.x1 - 0.35 + 1e-6; x += 0.1) {
      const spot = rect({ x: x, z: r.z0 + 0.05, w: 0.5, d: 0.1 })
      const wide: Rect = { x0: spot.x0 - 0.1, z0: spot.z0, x1: spot.x1 + 0.1, z1: spot.z1 + 0.3 }
      if (rooms.some((q) => q.floor === 0 && q.use === "寝間" && overlap(q, wide))) continue
      if (pieces.some((p) => tall(p) && overlap(p, wide)) || taken.some((p) => overlap(p, wide))) continue
      return spot
    }
    return null
  }
  for (const t of TRACES[h.id] ?? []) {
    const floor = 0
    const tableP = pieces.find((p) => p.floor === floor && TABLES.test(p.name))
    let at: Rect | null = null
    if (t.on === "卓" && tableP) at = rect({ x: (tableP.x0 + tableP.x1) / 2 + (pieces.filter((p) => p.on === "卓").length - 1) * 0.25, z: (tableP.z0 + tableP.z1) / 2, w: 0.25, d: 0.2 })
    else if (t.on === "炉" && hearth) {
      // in front of the fire: off its open side where it stands against a wall, else behind it
      const c = centre(hearth)
      at =
        hearth.z0 < 0.05
          ? rect({ x: c[0], z: hearth.z1 + 0.1, w: 0.4, d: 0.1 })
          : hearth.x0 < 0.05
            ? rect({ x: hearth.x1 + 0.1, z: c[1], w: 0.1, d: 0.4 })
            : hearth.x1 > W - 0.05
              ? rect({ x: hearth.x0 - 0.1, z: c[1], w: 0.1, d: 0.4 })
              : rect({ x: c[0], z: hearth.z0 - 0.1, w: 0.4, d: 0.1 })
    } else if (t.on === "戸口") {
      // side by side along the wall inside the door, away from the door's own swing
      const k = pieces.filter((p) => p.on === "戸口").length
      at = rect({ x: door + (door > W / 2 ? -1 : 1) * (0.9 + 0.5 * k), z: D - 0.35, w: 0.4, d: 0.3 })
    } else if (t.on === "壁") at = wallSpot() ?? rect({ x: 0.6 + pieces.filter((p) => p.on === "壁").length * 0.7, z: 0.05, w: 0.5, d: 0.1 })
    else {
      // on the floor: somewhere in the room they live in, out of the way
      const r = living ?? rooms[0]
      at = rect({ x: r.x0 + 0.5 + (((t.what.length * 37) % 10) / 10) * Math.max(0, r.x1 - r.x0 - 1), z: r.z1 - 0.4, w: 0.4, d: 0.3 })
    }
    // kept inside the walls
    const w = at.x1 - at.x0,
      d = at.z1 - at.z0
    const x0 = Math.min(W - w, Math.max(0, at.x0)),
      z0 = Math.min(D - d, Math.max(0, at.z0))
    pieces.push({ name: t.what, floor, x0, z0, x1: x0 + w, z1: z0 + d, solid: false, wall: false, on: t.on })
  }
  return { id: h.id, W, D, floors, door, rooms, dividers, pieces, unplaced, unrepresentedRooms: unrepresentedRooms(h.plan.rooms, rooms) }
}

export { layout }
