// Every object the maps are dressed with, by name, for /dev/props: each builds itself at a spot on
// flat ground, exactly as it is built on the maps.
import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { anvil } from "#/world/scene/construction/anvil"
import { forge } from "#/world/scene/construction/forge"
import { lantern } from "#/world/scene/construction/lantern"
import { oven } from "#/world/scene/construction/oven"
import { trough } from "#/world/scene/construction/trough"
import { barrel } from "#/world/scene/construction/barrel"
import { bench } from "#/world/scene/construction/bench"
import { bucket } from "#/world/scene/construction/bucket"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { table } from "#/world/scene/construction/table"
import { well } from "#/world/scene/construction/well"
import { woodpile } from "#/world/scene/construction/woodpile"
import { bush } from "#/world/scene/construction/bush"
import { tree } from "#/world/scene/construction/tree"
import { cart } from "#/world/scene/construction/cart"
import { haystack } from "#/world/scene/construction/haystack"
import { fence } from "#/world/scene/construction/fence"
import { laundryLine } from "#/world/scene/construction/laundry"
import { stall } from "#/world/scene/construction/stalls"
import { choppingBlock } from "#/world/scene/chopping-block"
import { flowerPot } from "#/world/scene/flower-pot"
import { hideFrame } from "#/world/scene/hide-frame"
import { netFrame } from "#/world/scene/net-frame"
import { planks } from "#/world/scene/planks"
import { rentSign } from "#/world/scene/rent-sign"
import { spearRack } from "#/world/scene/spear-rack"
import { wheel } from "#/world/scene/wheel"
import { woolSacks } from "#/world/scene/wool-sacks"
import { Hare } from "#/world/scene/fields/hare"
import { Slime } from "#/world/scene/fields/slime"
import { boat } from "#/world/scene/fields/boat"
import { brokenTower } from "#/world/scene/fields/broken-tower"
import { cairn } from "#/world/scene/fields/cairn"
import { charcoalKiln } from "#/world/scene/fields/charcoal-kiln"
import { dryingRack } from "#/world/scene/fields/drying-rack"
import { emptyShrine } from "#/world/scene/fields/empty-shrine"
import { netShed } from "#/world/scene/fields/net-shed"
import { ruinedWall } from "#/world/scene/fields/ruined-wall"
import { rustedMachine } from "#/world/scene/fields/rusted-machine"
import { signboard } from "#/world/scene/fields/signboard"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { deadTrees } from "#/world/scene/fields/dead-trees"
import { logs } from "#/world/scene/fields/logs"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { shrubs } from "#/world/scene/fields/shrubs"
import { branches } from "#/world/scene/fields/branches"
import { pines } from "#/world/scene/fields/pines"
import { rocks } from "#/world/scene/fields/rocks"
import { stumps } from "#/world/scene/fields/stumps"
import { tufts } from "#/world/scene/fields/tufts"
import { critters } from "#/world/scene/critters"
import { THINGS } from "#/world/scene/props/catalog"

export type Prop = {
  id: string
  name: string
  group: string
  build: (root: THREE.Group, x: number, z: number) => void
}

const merged = (f: (gb: GB, x: number, z: number) => void) => (root: THREE.Group, x: number, z: number) => {
  const gb = new GB()
  f(gb, x, z)
  root.add(gb.build())
}
const one = (inputProps: { x: number; z: number; s?: number; r?: number }) => {
  const x = inputProps.x
  const z = inputProps.z
  const s = inputProps.s === undefined ? 1 : inputProps.s
  const r = inputProps.r === undefined ? 0.4 : inputProps.r
  return [{ x, z, s, r }]
}

export const PROPS: Prop[] = [
  // the town
  { id: "barrel", name: "樽", group: "町", build: merged((gb, x, z) => barrel({ gb: gb, x: x, z: z })) },
  {
    id: "crate",
    name: "木箱",
    group: "町",
    build: merged((gb, x, z) => {
      crate({ gb: gb, x: x, z: z, s: 0.55 })
      crate({ gb: gb, x: x, z: z, s: 0.4, y: 0.45 })
    }),
  },
  {
    id: "sack",
    name: "袋",
    group: "町",
    build: merged((gb, x, z) => {
      sack({ gb: gb, x: x, z: z })
      sack({ gb: gb, x: x + 0.35, z: z + 0.1 })
    }),
  },
  { id: "bucket", name: "桶", group: "町", build: merged((gb, x, z) => bucket({ gb: gb, x: x, z: z })) },
  { id: "bench", name: "長椅子", group: "町", build: merged((gb, x, z) => bench({ gb: gb, x: x, z: z, w: 1.2 })) },
  { id: "table", name: "卓", group: "町", build: merged((gb, x, z) => table({ gb: gb, x: x, z: z })) },
  { id: "trough", name: "水桶（家畜用）", group: "町", build: merged((gb, x, z) => trough({ gb: gb, x: x, z: z })) },
  { id: "woodpile", name: "薪の山", group: "町", build: merged((gb, x, z) => woodpile({ gb: gb, x: x, z: z, len: 1.4, layers: 3, alongX: true })) },
  { id: "lantern", name: "街灯", group: "町", build: (root, x, z) => lantern(root, x, z) },
  { id: "well", name: "井戸", group: "町", build: (root, x, z) => well(root, x, z) },
  {
    id: "stall",
    name: "屋台",
    group: "町",
    build: (root, x, z) => {
      stall({ root: root, x: x, z: z, goods: ["apple", "pear", "plum"], stripe: ["cRed", "cLinen"], hang: ["garlic", "herb"], seed: 7, facing: "s" })
    },
  },
  {
    id: "stall-shut",
    name: "屋台（布をかけて閉めた）",
    group: "町",
    build: (root, x, z) => {
      stall({ root: root, x: x, z: z, goods: [], stripe: ["cMustard", "cLinen"], hang: [], seed: 8, facing: "s" })
    },
  },
  { id: "cart", name: "荷車", group: "町", build: (root, x, z) => cart({ root: root, x: x, z: z, rot: 0.4, load: "barrels" }) },
  { id: "pasture-fence", name: "牧草地の柵と入口", group: "町", build: buildPastureFence },
  { id: "haystack", name: "干し草の山", group: "町", build: (root, x, z) => haystack({ root: root, x: x, z: z }) },
  { id: "laundry", name: "物干しと洗濯物", group: "町", build: (root, x, z) => laundryLine({ root: root, ax: x - 1.2, az: z, bx: x + 1.2, bz: z, seed: 3 }) },
  {
    id: "fence",
    name: "柵",
    group: "町",
    build: (root, x, z) =>
      fence({
        root: root,
        pts: [
          [x - 1.2, z],
          [x + 1.2, z],
        ],
        gaps: [],
        h: 0.7,
      }),
  },
  { id: "forge", name: "炉", group: "町", build: (root, x, z) => forge(root, x, z) },
  { id: "anvil", name: "金床", group: "町", build: merged((gb, x, z) => anvil(gb, x, z)) },
  { id: "oven", name: "パン窯", group: "町", build: (root, x, z) => oven(root, x, z) },
  { id: "tree", name: "広葉樹（町）", group: "町", build: (root, x, z) => tree({ root: root, x: x, z: z, scale: 1, kind: "leaf", seed: 3 }) },
  { id: "bush", name: "茂み", group: "町", build: (root, x, z) => bush({ root: root, x: x, z: z, s: 0.5, kind: "leaf2", flowers: true }) },
  // round the houses
  {
    id: "flower-pot",
    name: "植木鉢",
    group: "軒先",
    build: (root, x, z) => {
      const gb = new GB()
      flowerPot({ gb: gb, root: root, x: x, z: z, seed: 1 })
      root.add(gb.build())
    },
  },
  { id: "net-frame", name: "網干し（漁師）", group: "軒先", build: merged((gb, x, z) => netFrame({ gb: gb, x: x, z: z, alongX: true })) },
  { id: "hide-frame", name: "革干し（革職人）", group: "軒先", build: merged((gb, x, z) => hideFrame(gb, x, z)) },
  { id: "wheel", name: "荷車の車輪（荷運び）", group: "軒先", build: merged((gb, x, z) => wheel(gb, x, z)) },
  { id: "chopping-block", name: "薪割り台（木こり）", group: "軒先", build: merged((gb, x, z) => choppingBlock(gb, x, z)) },
  { id: "spear-rack", name: "槍立て（衛兵）", group: "軒先", build: merged((gb, x, z) => spearRack(gb, x, z)) },
  { id: "planks", name: "板材（木工師）", group: "軒先", build: merged((gb, x, z) => planks({ gb: gb, x: x, z: z, alongX: true })) },
  { id: "wool-sacks", name: "羊毛の袋（羊飼い）", group: "軒先", build: merged((gb, x, z) => woolSacks(gb, x, z)) },
  { id: "rent-sign", name: "貸家の札", group: "軒先", build: (root, x, z) => rentSign(root, x, z) },
  // the fields
  { id: "pine", name: "針葉樹", group: "フィールド", build: (root, x, z) => pines(root, one({ x: x, z: z, s: 1.1 })) },
  { id: "broadleaf", name: "広葉樹", group: "フィールド", build: (root, x, z) => broadleaves(root, one({ x: x, z: z, s: 1 })) },
  { id: "dead-tree", name: "枯れ木", group: "フィールド", build: (root, x, z) => deadTrees(root, one({ x: x, z: z, s: 1.1 })) },
  { id: "rock", name: "岩", group: "フィールド", build: (root, x, z) => rocks(root, [...one({ x: x, z: z, s: 1.1 }), ...one({ x: x + 0.9, z: z + 0.4, s: 0.5, r: 2 })]) },
  {
    id: "tuft",
    name: "枯れ草",
    group: "フィールド",
    build: (root, x, z) => tufts(root, [...one({ x: x, z: z }), ...one({ x: x + 0.4, z: z + 0.3, s: 0.8, r: 1 }), ...one({ x: x - 0.3, z: z + 0.2, s: 0.9, r: 2 })]),
  },
  { id: "log", name: "倒木", group: "フィールド", build: (root, x, z) => logs(root, one({ x: x, z: z, s: 1 })) },
  { id: "stump", name: "切り株", group: "フィールド", build: (root, x, z) => stumps(root, [...one({ x: x, z: z }), ...one({ x: x + 0.7, z: z + 0.3, s: 0.8 })]) },
  {
    id: "shrub",
    name: "低木（冬の実）",
    group: "フィールド",
    build: (root, x, z) => shrubs(root, [...one({ x: x, z: z, s: 1.1 }), ...one({ x: x + 0.6, z: z + 0.3, s: 0.8, r: 1 }), ...one({ x: x - 0.5, z: z + 0.2, s: 0.9, r: 2 })]),
  },
  { id: "branches", name: "落ちた枝", group: "フィールド", build: (root, x, z) => branches(root, one({ x: x, z: z, s: 1 })) },
  { id: "mushroom", name: "きのこ", group: "フィールド", build: (root, x, z) => mushrooms(root, [...one({ x: x, z: z, s: 1.2 }), ...one({ x: x + 0.4, z: z + 0.2, s: 1, r: 2 })]) },
  { id: "signboard", name: "立て札", group: "フィールド", build: (root, x, z) => signboard({ root: root, x: x, z: z, lines: ["オットーの果樹園"] }) },
  { id: "rusted-machine", name: "大戦の歩く機関（砂に埋もれた）", group: "フィールド", build: (root, x, z) => rustedMachine(root, x, z) },
  { id: "broken-tower", name: "崩れた見張り塔", group: "フィールド", build: (root, x, z) => brokenTower(root, x, z) },
  { id: "net-shed", name: "網小屋", group: "フィールド", build: (root, x, z) => netShed({ root: root, x: x, z: z, rot: 0.3 }) },
  { id: "boat", name: "舟", group: "フィールド", build: (root, x, z) => boat({ root: root, x: x, z: z, rot: 0.3 }) },
  { id: "drying-rack", name: "干し魚の台", group: "フィールド", build: (root, x, z) => dryingRack(root, x, z) },
  { id: "charcoal-kiln", name: "炭焼き窯", group: "フィールド", build: (root, x, z) => charcoalKiln(root, x, z) },
  { id: "cairn", name: "石積み", group: "フィールド", build: (root, x, z) => cairn(root, x, z) },
  { id: "shrine", name: "誰もいない祭壇", group: "フィールド", build: (root, x, z) => emptyShrine(root, x, z) },
  {
    id: "ruined-wall",
    name: "苔むした砦の壁",
    group: "フィールド",
    build: (root, x, z) =>
      ruinedWall(
        root,
        [
          [x - 1.4, z],
          [x + 1.4, z],
        ],
        5,
      ),
  },
  // creatures
  {
    id: "slime",
    name: "スライム",
    group: "生き物",
    build: (root, x, z) => {
      critters.push(new Slime({ root: root, area: [x - 1, z - 1, x + 1, z + 1], seed: 1, color: 0x6ab0a0 }))
    },
  },
  {
    id: "hare",
    name: "野うさぎ",
    group: "生き物",
    build: (root, x, z) => {
      critters.push(new Hare(root, [x - 1, z - 1, x + 1, z + 1], 2))
    },
  },
  // the small things of everyday life (things.ts), every one of them
  ...Object.entries(THINGS).map((entry) => {
    const id = entry[0]
    const t = entry[1]
    return { id, name: t.name, group: t.group, build: merged((gb, x, z) => t.build({ builder: gb, x: x, z: z, seed: 1, along: true })) }
  }),
]
import { buildPastureFence } from "#/dev/build-pasture-fence"
