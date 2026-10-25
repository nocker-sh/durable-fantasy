// Every object the maps are dressed with, by name, for /dev/props: each builds itself at a spot on
// flat ground, exactly as it is built on the maps.
import type * as THREE from "three"
import { GB } from "#/world/scene/gfx.ts"
import { anvil, barrel, bench, bucket, bush, cart, crate, fence, forge, haystack, lantern, laundryLine, oven, sack, stall, table, tree, trough, well, woodpile } from "#/world/scene/build.ts"
import { choppingBlock, flowerPot, hideFrame, netFrame, planks, rentSign, spearRack, wheel, woolSacks } from "#/world/scene/dressing.ts"
import {
  Hare,
  Slime,
  boat,
  brokenTower,
  broadleaves,
  cairn,
  charcoalKiln,
  deadTrees,
  dryingRack,
  emptyShrine,
  logs,
  mushrooms,
  shrubs,
  branches,
  netShed,
  pines,
  rocks,
  ruinedWall,
  rustedMachine,
  signboard,
  stumps,
  tufts,
} from "#/world/scene/fields.ts"
import { critters } from "#/world/scene/actors.ts"
import { THINGS } from "#/world/scene/things.ts"

export interface Prop {
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
const one = (x: number, z: number, s = 1, r = 0.4) => [{ x, z, s, r }]

export const PROPS: Prop[] = [
  // the town
  { id: "barrel", name: "樽", group: "町", build: merged((gb, x, z) => barrel(gb, x, z)) },
  {
    id: "crate",
    name: "木箱",
    group: "町",
    build: merged((gb, x, z) => {
      crate(gb, x, z, 0.55)
      crate(gb, x, z, 0.4, 0.45)
    }),
  },
  {
    id: "sack",
    name: "袋",
    group: "町",
    build: merged((gb, x, z) => {
      sack(gb, x, z)
      sack(gb, x + 0.35, z + 0.1)
    }),
  },
  { id: "bucket", name: "桶", group: "町", build: merged((gb, x, z) => bucket(gb, x, z)) },
  { id: "bench", name: "長椅子", group: "町", build: merged((gb, x, z) => bench(gb, x, z, 1.2)) },
  { id: "table", name: "卓", group: "町", build: merged((gb, x, z) => table(gb, x, z)) },
  { id: "trough", name: "水桶（家畜用）", group: "町", build: merged((gb, x, z) => trough(gb, x, z)) },
  { id: "woodpile", name: "薪の山", group: "町", build: merged((gb, x, z) => woodpile(gb, x, z, 1.4, 3, true)) },
  { id: "lantern", name: "街灯", group: "町", build: (root, x, z) => lantern(root, x, z) },
  { id: "well", name: "井戸", group: "町", build: (root, x, z) => well(root, x, z) },
  {
    id: "stall",
    name: "屋台",
    group: "町",
    build: (root, x, z) => {
      stall(root, x, z, ["apple", "pear", "plum"], ["cRed", "cLinen"], ["garlic", "herb"], 7, "s")
    },
  },
  {
    id: "stall-shut",
    name: "屋台（布をかけて閉めた）",
    group: "町",
    build: (root, x, z) => {
      stall(root, x, z, [], ["cMustard", "cLinen"], [], 8, "s")
    },
  },
  { id: "cart", name: "荷車", group: "町", build: (root, x, z) => cart(root, x, z, 0.4, "barrels") },
  { id: "haystack", name: "干し草の山", group: "町", build: (root, x, z) => haystack(root, x, z) },
  { id: "laundry", name: "物干しと洗濯物", group: "町", build: (root, x, z) => laundryLine(root, x - 1.2, z, x + 1.2, z, 3) },
  {
    id: "fence",
    name: "柵",
    group: "町",
    build: (root, x, z) =>
      fence(
        root,
        [
          [x - 1.2, z],
          [x + 1.2, z],
        ],
        [],
        0.7,
      ),
  },
  { id: "forge", name: "炉", group: "町", build: (root, x, z) => forge(root, x, z) },
  { id: "anvil", name: "金床", group: "町", build: merged((gb, x, z) => anvil(gb, x, z)) },
  { id: "oven", name: "パン窯", group: "町", build: (root, x, z) => oven(root, x, z) },
  { id: "tree", name: "広葉樹（町）", group: "町", build: (root, x, z) => tree(root, x, z, 1, "leaf", 3) },
  { id: "bush", name: "茂み", group: "町", build: (root, x, z) => bush(root, x, z, 0.5, "leaf2", true) },
  // round the houses
  {
    id: "flower-pot",
    name: "植木鉢",
    group: "軒先",
    build: (root, x, z) => {
      const gb = new GB()
      flowerPot(gb, root, x, z, 1)
      root.add(gb.build())
    },
  },
  { id: "net-frame", name: "網干し（漁師）", group: "軒先", build: merged((gb, x, z) => netFrame(gb, x, z, true)) },
  { id: "hide-frame", name: "革干し（革職人）", group: "軒先", build: merged((gb, x, z) => hideFrame(gb, x, z)) },
  { id: "wheel", name: "荷車の車輪（荷運び）", group: "軒先", build: merged((gb, x, z) => wheel(gb, x, z)) },
  { id: "chopping-block", name: "薪割り台（木こり）", group: "軒先", build: merged((gb, x, z) => choppingBlock(gb, x, z)) },
  { id: "spear-rack", name: "槍立て（衛兵）", group: "軒先", build: merged((gb, x, z) => spearRack(gb, x, z)) },
  { id: "planks", name: "板材（木工師）", group: "軒先", build: merged((gb, x, z) => planks(gb, x, z, true)) },
  { id: "wool-sacks", name: "羊毛の袋（羊飼い）", group: "軒先", build: merged((gb, x, z) => woolSacks(gb, x, z)) },
  { id: "rent-sign", name: "貸家の札", group: "軒先", build: (root, x, z) => rentSign(root, x, z) },
  // the fields
  { id: "pine", name: "針葉樹", group: "フィールド", build: (root, x, z) => pines(root, one(x, z, 1.1)) },
  { id: "broadleaf", name: "広葉樹", group: "フィールド", build: (root, x, z) => broadleaves(root, one(x, z, 1)) },
  { id: "dead-tree", name: "枯れ木", group: "フィールド", build: (root, x, z) => deadTrees(root, one(x, z, 1.1)) },
  { id: "rock", name: "岩", group: "フィールド", build: (root, x, z) => rocks(root, [...one(x, z, 1.1), ...one(x + 0.9, z + 0.4, 0.5, 2)]) },
  { id: "tuft", name: "枯れ草", group: "フィールド", build: (root, x, z) => tufts(root, [...one(x, z), ...one(x + 0.4, z + 0.3, 0.8, 1), ...one(x - 0.3, z + 0.2, 0.9, 2)]) },
  { id: "log", name: "倒木", group: "フィールド", build: (root, x, z) => logs(root, one(x, z, 1)) },
  { id: "stump", name: "切り株", group: "フィールド", build: (root, x, z) => stumps(root, [...one(x, z), ...one(x + 0.7, z + 0.3, 0.8)]) },
  { id: "shrub", name: "低木（冬の実）", group: "フィールド", build: (root, x, z) => shrubs(root, [...one(x, z, 1.1), ...one(x + 0.6, z + 0.3, 0.8, 1), ...one(x - 0.5, z + 0.2, 0.9, 2)]) },
  { id: "branches", name: "落ちた枝", group: "フィールド", build: (root, x, z) => branches(root, one(x, z, 1)) },
  { id: "mushroom", name: "きのこ", group: "フィールド", build: (root, x, z) => mushrooms(root, [...one(x, z, 1.2), ...one(x + 0.4, z + 0.2, 1, 2)]) },
  { id: "signboard", name: "立て札", group: "フィールド", build: (root, x, z) => signboard(root, x, z, ["オットーの果樹園"]) },
  { id: "rusted-machine", name: "大戦の歩く機関（砂に埋もれた）", group: "フィールド", build: (root, x, z) => rustedMachine(root, x, z) },
  { id: "broken-tower", name: "崩れた見張り塔", group: "フィールド", build: (root, x, z) => brokenTower(root, x, z) },
  { id: "net-shed", name: "網小屋", group: "フィールド", build: (root, x, z) => netShed(root, x, z, 0.3) },
  { id: "boat", name: "舟", group: "フィールド", build: (root, x, z) => boat(root, x, z, 0.3) },
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
      critters.push(new Slime(root, [x - 1, z - 1, x + 1, z + 1], 1, 0x6ab0a0))
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
  ...Object.entries(THINGS).map(([id, t]) => ({ id, name: t.name, group: t.group, build: merged((gb, x, z) => t.build(gb, x, z, 1, true)) })),
]
