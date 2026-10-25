import { enterable, floorsOf, type HouseDef } from "../houses.ts"
import { TILE_M } from "../fit.ts"
import { TRACES } from "../traces.ts"
import type { FloorPlan, PRoom, Divider, Rect, DividerKind, Use, Placed } from "./types.ts"
import { WALL, STAIR, DIV, DOORWAY, centre, rect, inside, overlap } from "./geometry.ts"
import { entries, COUNTERS, useOf, sizeOf, WORK, TABLES, SEATS, SHELVES } from "./furniture.ts"
import { split, across, along } from "./partitions.ts"
import { Floor } from "./placement.ts"

function layout(h: HouseDef, shopDepth: number, fire: "auto" | "wall" | "centre"): FloorPlan {
  const W = (h.x1 - h.x0) * TILE_M - 2 * WALL,
    D = (h.z1 - h.z0) * TILE_M - 2 * WALL
  const floors = floorsOf(h)
  const walkIn = enterable(h)
  const farm = h.kind === "farm"
  const door = walkIn ? W / 2 : Math.min(W - 0.8, Math.max(0.8, h.door.side === "s" || h.door.side === "n" ? h.door.u * TILE_M - WALL : W * 0.35))
  const rooms: PRoom[] = []
  const dividers: Divider[] = []
  /** the ways through partitions, kept clear */
  const gaps: Rect[] = []
  const unplaced: string[] = []
  const all = entries(h)
  const ground = h.plan.rooms.filter((r) => r.floor === 0)
  const upper = h.plan.rooms.filter((r) => r.floor > 0)

  // ---------------------------------------------------------------- the ground floor
  // the front: the shop floor, the hall or the earth-floored entry; the back: kitchen, workshop, stores
  const hasCounter = all.some((e) => COUNTERS.test(e.name))
  const hall = ground.some((r) => /食堂|酒場|集会/.test(r.name))
  // a shop floor at the front with the work and the stores behind it
  const shopFront = !hall && (hasCounter || /店先|売り場|買取場|預かり場/.test(ground[0]?.name ?? ""))
  // one workroom with the hearth in the middle of it (a workshop with no counter)
  const oneRoom = !hall && !shopFront && (walkIn || h.kind === "workshop")
  const front = hall ? D * Math.min(0.78, shopDepth + 0.14) : shopFront ? Math.min(3.4, Math.max(1.8, D * shopDepth)) : Math.max(1.1, Math.min(1.6, D * 0.3) * (shopDepth / 0.48))
  const split0 = D - front
  // the stair rises along the east wall at the back
  // the stair rises along the east wall at the back, or along the back wall where the back room is shallow
  const deep = !(hall || shopFront) || split0 >= STAIR.d + 0.6
  const stairRect: Rect | null = floors < 2 ? null : deep ? { x0: W - STAIR.w, z0: 0, x1: W, z1: STAIR.d } : { x0: W - STAIR.d, z0: 0, x1: W, z1: STAIR.w }
  const stairFoot: Rect | null = !stairRect
    ? null
    : deep
      ? { x0: W - STAIR.w - 0.1, z0: STAIR.d, x1: W, z1: STAIR.d + STAIR.front }
      : { x0: W - STAIR.d - STAIR.front, z0: 0, x1: W - STAIR.d, z1: STAIR.w + 0.1 }
  const backRooms = ground.length > 1 ? ground.slice(1) : []
  const frontRoom = ground[0]
  if (farm) {
    rooms.push({ name: frontRoom?.name ?? "納屋", use: useOf(frontRoom?.name ?? ""), floor: 0, x0: 0, z0: 0, x1: W, z1: D })
    ground.slice(1).forEach((r, k) => {
      const [a, b] = split(0, W, ground.length)[k + 1] ?? [0, W]
      rooms.push({ name: r.name, use: useOf(r.name), floor: 0, x0: a, z0: 0, x1: b, z1: D })
    })
  } else if (oneRoom) {
    rooms.push({ name: frontRoom?.name ?? "仕事場", use: useOf(frontRoom?.name ?? "仕事場"), floor: 0, x0: 0, z0: 0, x1: W, z1: D })
    for (const r of ground.slice(1))
      if (/寝/.test(r.name)) rooms.push({ name: r.name, use: "寝間", floor: 0, x0: 0, z0: 0, x1: Math.max(W * 0.45, (r.beds ?? 1) * 1.05 + 0.2), z1: Math.min(2.6, D * 0.55) })
  } else if (hall || shopFront) {
    rooms.push({ name: frontRoom.name, use: useOf(frontRoom.name), floor: 0, x0: 0, z0: split0, x1: W, z1: D })
    // the shop is closed off from the back by a partition (shelves in a shop, a wall in a workshop), a doorway at the west end
    const kind: DividerKind = hall ? "腰壁" : h.shop ? "棚" : "壁"
    dividers.push(...across(0, kind, 0, W, split0, 0.75, 1.0))
    gaps.push({ x0: 0.25, z0: split0 - 0.7, x1: 1.25, z1: split0 + 0.7 })
    const parts = backRooms.length ? split(0, W, backRooms.length) : [[0, W] as [number, number]]
    ;(backRooms.length ? backRooms : [{ name: "奥の仕事場", floor: 0 }]).forEach((r, k) =>
      rooms.push({ name: r.name, use: useOf(r.name), floor: 0, x0: parts[k][0], z0: 0, x1: parts[k][1], z1: split0 - DIV / 2 }),
    )
    for (let k = 1; k < parts.length; k++) dividers.push(...along(0, "腰壁", 0, split0 - DIV / 2, parts[k][0] - DIV / 2, split0 * 0.6, 0.9))
  } else {
    // a home: one room round the hearth, the earth-floored entry at the front behind a low wall
    rooms.push({ name: "土間", use: "土間", floor: 0, x0: 0, z0: split0, x1: W, z1: D })
    const main = ground.find((r) => !/寝/.test(r.name)) ?? ground[0]
    rooms.push({ name: main?.name ?? "居間兼台所", use: useOf(main?.name ?? "居間"), floor: 0, x0: 0, z0: 0, x1: W, z1: split0 - DIV / 2 })
    // the low wall runs from the side away from the door, leaving the way in open
    const wallFromWest = door > W / 2
    dividers.push(...across(0, "腰壁", wallFromWest ? 0 : W * 0.55, wallFromWest ? W * 0.45 : W, split0, null))
    for (const r of ground)
      if (r !== main && /寝/.test(r.name)) {
        const cw = Math.max(W * 0.4, (r.beds ?? 1) * 1.05 + 0.2)
        rooms.push({ name: r.name, use: "寝間", floor: 0, x0: wallFromWest ? W - cw : 0, z0: 0, x1: wallFromWest ? W : cw, z1: Math.min(2.6, split0 - DIV) })
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
  const f0 = new Floor(0, W, D, dividers)
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
      ? (rooms.find((r) => r.floor === 0 && r.use !== "売り場" && r.x1 >= W - 0.01) ?? rooms[1])
      : home
        ? rooms[1]
        : (roomOf(["食事", "台所"]) ?? roomOf(["作業場"]) ?? roomOf(["貯蔵"]) ?? rooms[0])

  const place = (name: string, room: Rect | undefined, how: "wall" | "near", at?: [number, number], sides: ("n" | "e" | "s" | "w")[] = ["n", "w", "e"], from = 0.5) => {
    const s = sizeOf(name)
    if (!s || !room) {
      if (s) unplaced.push(name)
      return null
    }
    const tryIn = (r: Rect, first: boolean) =>
      how === "wall" || !first
        ? (f0.againstWall(name, s.w, s.d, farm ? 0.1 : s.front, r, [...sides, ...(["n", "w", "e", "s"] as const).filter((x) => !sides.includes(x))], from) ??
          f0.near(name, s.w, s.d, Math.min(s.front, 0.5), r, first && at ? at : centre(r)))
        : (f0.near(name, s.w, s.d, Math.min(s.front, 0.6), r, at ?? centre(r)) ?? f0.againstWall(name, s.w, s.d, s.front, r, sides, from))
    // where it was meant to go, else any other room downstairs but the sleeping corner
    const p = tryIn(room, true) ?? rooms.filter((r) => r.floor === 0 && r !== room && r.use !== "寝間").reduce<Placed | null>((got, r) => got ?? tryIn(r, false), null)
    if (!p) unplaced.push(name)
    return p
  }
  // a one-floor household sleeps in its corner: the beds go in first, and nothing else goes there
  const corner = rooms.find((r) => r.floor === 0 && r.use === "寝間")
  if (corner && floors === 1) {
    // the beds, and the clothes chest at their feet
    all
      .filter((e) => /寝台|衣装箱/.test(e.name))
      .forEach((e, k) => {
        const sz = sizeOf(e.name)!
        const chest = e.name === "衣装箱"
        const got =
          f0.againstWall(e.name, sz.w, sz.d, chest ? 0.3 : sz.front, corner, chest ? ["s", "e", "w"] : ["n", "w", "e"], k % 2 ? 1 : 0) ??
          (chest ? f0.near(e.name, sz.w, sz.d, 0.2, corner, centre(corner)) : null)
        // a chest with no room in the corner stands out in the room with the rest
        if (got || !chest) {
          if (!got) unplaced.push(e.name)
          e.name = `placed:${e.name}`
        }
      })
    f0.clear.push({ x0: corner.x0, z0: corner.z0, x1: corner.x1, z1: corner.z1 })
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
      ? f0.againstWall("暖炉", 1.4, 0.7, 1.0, living, ["n", "w"], 0.4)
      : hall || narrow
        ? f0.againstWall("炉", 1.2, 1.0, 0.6, living, ["w", "e", "n"], 0.5)
        : f0.near("炉", 1.2, 1.0, 0.6, living, at)
    if (!hearth) unplaced.push(fireplace ? "暖炉" : "炉")
    else f0.targets.push(hearth)
  }
  const groundEntries = all.filter((e) => !e.up && e.name !== "暖炉" && !e.name.startsWith("placed:"))
  const take = (test: (n: string) => boolean) => groundEntries.filter((e) => test(e.name)).map((e) => e.name)
  // the counter across the shop (or along the hall), the keeper behind it with the back partition behind them
  const shop = rooms.find((r) => r.floor === 0 && r.use === "売り場")
  const hallRoom = hall ? rooms.find((r) => r.floor === 0 && r.use === "食事") : undefined
  const counterRoom = shop ?? hallRoom
  for (const name of take((n) => COUNTERS.test(n))) {
    const s = sizeOf(name)!
    const dd = Math.min(s.w, s.d)
    const band = counterRoom ? { ...counterRoom, z0: counterRoom.z0 + 0.75, z1: counterRoom.z0 + 0.75 + dd } : null
    const p = band ? f0.near(name, Math.max(s.w, s.d), dd, 0.4, band, [W / 2, band.z0]) : null
    if (p) p.wall = false
    else place(name, counterRoom ?? living ?? undefined, "wall", undefined, ["w", "e", "n"])
  }
  // the trade's big pieces stand free in the workshop
  const work = rooms.find((r) => r.floor === 0 && r.use === "作業場") ?? living ?? rooms[0]
  const bigWork = (n: string) => /木工台|作業台|搾り台|干し草|荷車/.test(n)
  for (const name of take((n) => WORK.test(n) && bigWork(n))) place(name, farm ? rooms[0] : work, "near", farm ? undefined : [centre(work)[0] - 0.5, centre(work)[1]])
  // tables round the hearth, spread about it
  const near: [number, number] = hearth ? [(hearth.x0 + hearth.x1) / 2, (hearth.z0 + hearth.z1) / 2] : living ? centre(living) : [W / 2, D / 2]
  const tableRoom = hallRoom ?? living
  const tableNames = take((n) => TABLES.test(n))
  tableNames.forEach((name, k) => {
    const s = sizeOf(name)!
    const room = tableRoom ?? rooms[0]
    // first round the fire, out of reach of the walls; then anywhere it will go
    const inset: Rect = { x0: room.x0 + 0.45, z0: room.z0 + 0.45, x1: room.x1 - 0.45, z1: room.z1 - 0.45 }
    for (const r of hall ? [1.9, 2.4] : [1.2, 1.6, 2.0])
      for (let t = 0; t < 8; t++) {
        const a = ((k + t / 8) / Math.max(1, tableNames.length)) * Math.PI * 2 + 0.3
        const got = inset.x1 - inset.x0 > s.d && inset.z1 - inset.z0 > s.d ? f0.near(name, s.w, s.d, 0.45, inset, [near[0] + Math.cos(a) * r, near[1] + Math.sin(a) * r * 0.7]) : null
        if (got) {
          f0.targets.push(got)
          return
        }
      }
    const got = place(name, room, "near", near)
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
      if (/長椅子/.test(name)) return [rect(cx, tbl.z1 + s.d / 2 + 0.05, Math.min(s.w, tbl.x1 - tbl.x0 + 0.4), s.d), rect(cx, tbl.z0 - s.d / 2 - 0.05, Math.min(s.w, tbl.x1 - tbl.x0 + 0.4), s.d)]
      return [
        rect(cx, tbl.z1 + s.d / 2 + 0.05, s.w, s.d),
        rect(cx, tbl.z0 - s.d / 2 - 0.05, s.w, s.d),
        rect(tbl.x0 - s.d / 2 - 0.05, cz, s.d, s.w),
        rect(tbl.x1 + s.d / 2 + 0.05, cz, s.d, s.w),
        rect(tbl.x0 + s.w / 2, tbl.z1 + s.d / 2 + 0.05, s.w, s.d),
        rect(tbl.x1 - s.w / 2, tbl.z1 + s.d / 2 + 0.05, s.w, s.d),
        rect(tbl.x0 + s.w / 2, tbl.z0 - s.d / 2 - 0.05, s.w, s.d),
        rect(tbl.x1 - s.w / 2, tbl.z0 - s.d / 2 - 0.05, s.w, s.d),
      ]
    }
    const byFire = hearth
      ? [
          rect(hearth.x1 + 0.15 + s.w / 2, (hearth.z0 + hearth.z1) / 2, s.w, s.d),
          rect(hearth.x0 - 0.15 - s.w / 2, (hearth.z0 + hearth.z1) / 2, s.w, s.d),
          rect((hearth.x0 + hearth.x1) / 2, hearth.z1 + 0.15 + s.d / 2, s.w, s.d),
        ]
      : []
    const order = /揺り椅子/.test(name) ? byFire : [...tablesHere.slice(k % Math.max(1, tablesHere.length)), ...tablesHere].flatMap(spotsAt).concat(byFire)
    const ok = (r: Rect) => inside(r, seatRoom) && !f0.pieces.some((p) => overlap(r, p, -0.01)) && !dividers.some((d) => d.floor === 0 && overlap(r, d))
    const at = order.find(ok)
    if (!at) {
      unplaced.push(name)
      return
    }
    f0.pieces.push({ name: k === 0 && !/揺り椅子|長椅子/.test(name) ? `${name}（引いたまま）` : name, floor: 0, ...at, solid: false, wall: false })
  })
  // the kitchen worktop against a wall of the kitchen, or of the room by the fire
  if (h.plan.hearth && h.plan.kitchen && living) place("台所の台", rooms.find((r) => r.floor === 0 && r.use === "台所") ?? living, "wall", undefined, ["n", "w", "e"], 0.3)
  // the rest of the trade's things along the workshop's walls
  // (the big pot goes on the kitchen fire, where there is a kitchen)
  for (const name of take((n) => WORK.test(n) && !bigWork(n))) place(name, farm ? rooms[0] : name === "大鍋" ? (rooms.find((r) => r.floor === 0 && r.use === "台所") ?? work) : work, "wall")
  const store = rooms.find((r) => r.floor === 0 && r.use === "貯蔵") ?? work
  for (const name of take((n) => SHELVES.test(n)))
    place(name, /商品棚|薬棚|陳列/.test(name) ? (shop ?? store) : store, "wall", undefined, /商品棚|薬棚|陳列/.test(name) ? ["w", "e", "s"] : ["n", "w", "e"])
  // containers by the door in the entry, or in the stores
  const entry = rooms.find((r) => r.floor === 0 && r.use === "土間") ?? store
  const rest = groundEntries.map((e) => e.name).filter((n) => !COUNTERS.test(n) && !TABLES.test(n) && !SEATS.test(n) && !WORK.test(n) && !SHELVES.test(n))
  for (const name of rest) {
    if (!sizeOf(name)) continue
    const r = /寝台/.test(name) ? (rooms.find((x) => x.floor === 0 && x.use === "寝間") ?? living) : /樽|甕|桶|籠|箱|袋|薪|木材/.test(name) ? entry : living
    place(name, r ?? undefined, "wall", undefined, ["w", "e", "n", "s"])
  }
  // a sleeping corner on one floor: curtained off where the beds went
  const sleep = rooms.find((r) => r.floor === 0 && r.use === "寝間")
  if (sleep && floors === 1) dividers.push(...across(0, "カーテン", sleep.x0, sleep.x1, sleep.z1 + DIV / 2, (sleep.x0 + sleep.x1) / 2, 0.8))

  // ---------------------------------------------------------------- upstairs: where the household lives
  const pieces: Placed[] = [...f0.pieces]
  for (let floor = 1; floor < floors; floor++) {
    const here = upper.filter((r) => r.floor === floor)
    const fl = new Floor(floor, W, D, dividers)
    // the stair comes up at the back of the east wall: its head and landing stay clear
    if (stairRect) fl.add({ name: "階段の口", floor, ...stairRect, solid: true, wall: true }, stairFoot)
    // rooms side by side across the floor, a passage along the front to reach them all
    const passage = 1.0
    // each room as wide as its beds need (a bed and a half of width each), the rest shared out
    const weights = here.map((r) => Math.max(1.3, (r.beds ?? 0) * 1.05 + 0.3))
    const total = weights.reduce((a, b) => a + b, 0) || 1
    const parts: [number, number][] = []
    let x = 0
    for (const w of weights) {
      const width = ((W - DIV * (here.length - 1)) * w) / total
      parts.push([x, x + width])
      x += width + DIV
    }
    if (!parts.length) parts.push([0, W])
    // the passage runs along the side the stair comes up on: the front, or the back where the stair lies along the back wall
    const back = !deep
    const [rz0, rz1] = back ? [passage + DIV / 2, D] : [0, D - passage - DIV / 2]
    here.forEach((r, k) => {
      const [a, b] = parts[k]
      rooms.push({ name: r.name, use: useOf(r.name), floor, x0: a, z0: rz0, x1: b, z1: rz1 })
      if (k > 0) dividers.push(...along(floor, /客室|部屋|寝室/.test(r.name) ? "壁" : "カーテン", rz0, rz1, a - DIV / 2, null))
      dividers.push(...across(floor, /倉|物置|蔵|乾燥/.test(r.name) ? "腰壁" : "カーテン", a, b, back ? passage : D - passage, (a + b) / 2, 0.8))
    })
    rooms.push({ name: "廊下", use: "住まい", floor, x0: 0, z0: back ? 0 : D - passage, x1: W, z1: back ? passage : D })
    const up = all.filter((e) => e.up)
    // beds one to a person, in the rooms that have them
    let bedRoom = 0
    const roomsUp = rooms.filter((r) => r.floor === floor && r.name !== "廊下")
    // beds to sleep the room's people: a double sleeps two
    const sleepers = (n: string) => (/二人用/.test(n) ? 2 : 1)
    for (const r of here)
      for (let b = 0, slept = 0; slept < (r.beds ?? 0); b++) {
        const name = up.find((e) => /寝台/.test(e.name))?.name ?? "寝台"
        const k = up.findIndex((e) => e.name === name)
        if (k >= 0) up.splice(k, 1)
        slept += sleepers(name)
        const room = roomsUp.find((x) => x.name === r.name)!
        const s = sizeOf(name)!
        const p = fl.againstWall(name, s.w, s.d, s.front, room, deep ? ["n", "w", "e"] : ["s", "w", "e"], b % 2 ? 1 : 0)
        if (!p) unplaced.push(`${name}（2階）`)
        bedRoom++
      }
    // what else lives upstairs: chests at the beds' feet, the loom by a window, the shelves of stores
    for (const e of up) {
      const s = sizeOf(e.name)
      if (!s) continue
      const room =
        (/衣装箱|本棚/.test(e.name) ? roomsUp.find((r) => r.use === "寝間" || r.use === "客室") : (roomsUp.find((r) => r.use === "貯蔵") ?? roomsUp.find((r) => r.use === "作業場"))) ?? roomsUp[0]
      const p = room ? (fl.againstWall(e.name, s.w, s.d, s.front, room, ["w", "e", "n", "s"]) ?? fl.near(e.name, s.w, s.d, 0.4, room, centre(room))) : null
      if (!p) unplaced.push(`${e.name}（2階）`)
    }
    void bedRoom
    pieces.push(...fl.pieces.filter((p) => p.name !== "階段の口"))
  }

  // ---------------------------------------------------------------- traces of the life lived here
  for (const t of TRACES[h.id] ?? []) {
    const floor = 0
    const tableP = pieces.find((p) => p.floor === floor && TABLES.test(p.name))
    let at: Rect | null = null
    if (t.on === "卓" && tableP) at = rect((tableP.x0 + tableP.x1) / 2 + (pieces.filter((p) => p.on === "卓").length - 1) * 0.25, (tableP.z0 + tableP.z1) / 2, 0.25, 0.2)
    else if (t.on === "炉" && hearth) at = rect((hearth.x0 + hearth.x1) / 2, hearth.z0 - 0.1, 0.4, 0.1)
    else if (t.on === "戸口") at = rect(door + (door > W / 2 ? -1 : 1) * 0.9, D - 0.35, 0.4, 0.3)
    else if (t.on === "壁") at = rect(0.6 + pieces.filter((p) => p.on === "壁").length * 0.7, 0.05, 0.5, 0.1)
    else {
      // on the floor: somewhere in the room they live in, out of the way
      const r = living ?? rooms[0]
      at = rect(r.x0 + 0.5 + (((t.what.length * 37) % 10) / 10) * Math.max(0, r.x1 - r.x0 - 1), r.z1 - 0.4, 0.4, 0.3)
    }
    // kept inside the walls
    const w = at.x1 - at.x0,
      d = at.z1 - at.z0
    const x0 = Math.min(W - w, Math.max(0, at.x0)),
      z0 = Math.min(D - d, Math.max(0, at.z0))
    pieces.push({ name: t.what, floor, x0, z0, x1: x0 + w, z1: z0 + d, solid: false, wall: false, on: t.on })
  }
  return { id: h.id, W, D, floors, door, rooms, dividers, pieces, unplaced }
}

export { layout }
