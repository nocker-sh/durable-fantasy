import { bed } from "#/world/scene/construction/helpers/furnishings/bed"
import { chair } from "#/world/scene/construction/helpers/furnishings/chair"
import { settle } from "#/world/scene/construction/helpers/furnishings/settle"
import { rocker } from "#/world/scene/construction/helpers/furnishings/rocker"
import { cradle } from "#/world/scene/construction/helpers/furnishings/cradle"
import { diningTable } from "#/world/scene/construction/helpers/furnishings/dining-table"
import { roundTable } from "#/world/scene/construction/helpers/furnishings/round-table"
import { mapTable } from "#/world/scene/construction/helpers/furnishings/map-table"
import { desk } from "#/world/scene/construction/helpers/furnishings/desk"
import { sewingTable } from "#/world/scene/construction/helpers/furnishings/sewing-table"
import { prieDieu } from "#/world/scene/construction/helpers/furnishings/prie-dieu"
import { workbench } from "#/world/scene/construction/helpers/furnishings/workbench"
import { kitchen } from "#/world/scene/construction/helpers/furnishings/kitchen"
import { alchemy } from "#/world/scene/construction/helpers/furnishings/alchemy"
import { press } from "#/world/scene/construction/helpers/furnishings/press"
import { bookcase } from "#/world/scene/construction/helpers/furnishings/bookcase"
import { pantry } from "#/world/scene/construction/helpers/furnishings/pantry"
import { toolShelf } from "#/world/scene/construction/helpers/furnishings/tool-shelf"
import { pigeonholes } from "#/world/scene/construction/helpers/furnishings/pigeonholes"
import { medicineCase } from "#/world/scene/construction/helpers/furnishings/medicine-case"
import { crockery } from "#/world/scene/construction/helpers/furnishings/crockery"
import { bowShelf } from "#/world/scene/construction/helpers/furnishings/bow-shelf"
import { vitrine } from "#/world/scene/construction/helpers/furnishings/vitrine"
import { counter } from "#/world/scene/construction/helpers/furnishings/counter"
import { bigScales } from "#/world/scene/construction/helpers/furnishings/big-scales"
import { wardrobeChest } from "#/world/scene/construction/helpers/furnishings/wardrobe-chest"
import { strongbox } from "#/world/scene/construction/helpers/furnishings/strongbox"
import { lidBox } from "#/world/scene/construction/helpers/furnishings/lid-box"
import { cask } from "#/world/scene/construction/helpers/furnishings/cask"
import { tub } from "#/world/scene/construction/helpers/furnishings/tub"
import { loom } from "#/world/scene/construction/helpers/furnishings/loom"
import { spinningWheel } from "#/world/scene/construction/helpers/furnishings/spinning-wheel"
import { pottersWheel } from "#/world/scene/construction/helpers/furnishings/potters-wheel"
import { anvil } from "#/world/scene/construction/helpers/furnishings/anvil"
import { kiln } from "#/world/scene/construction/helpers/furnishings/kiln"
import { basketOf } from "#/world/scene/construction/helpers/furnishings/basket-of"
import { sacks } from "#/world/scene/construction/helpers/furnishings/sacks"
import { bundles } from "#/world/scene/construction/helpers/furnishings/bundles"
import { armorStand } from "#/world/scene/construction/helpers/furnishings/armor-stand"
import { spearRack } from "#/world/scene/construction/helpers/furnishings/spear-rack"
import { perch } from "#/world/scene/construction/helpers/furnishings/perch"
import { beehive } from "#/world/scene/construction/helpers/furnishings/beehive"
import { hay } from "#/world/scene/construction/helpers/furnishings/hay"
import { handcart } from "#/world/scene/construction/helpers/furnishings/handcart"
import { stool } from "#/world/scene/construction/helpers/furnishings/stool"
import { washstand } from "#/world/scene/construction/helpers/furnishings/washstand"
import { drawers } from "#/world/scene/construction/helpers/furnishings/drawers"
import { coatStand } from "#/world/scene/construction/helpers/furnishings/coat-stand"
import { birdcage } from "#/world/scene/construction/helpers/furnishings/birdcage"
import { brazier } from "#/world/scene/construction/helpers/furnishings/brazier"
import { shavingHorse } from "#/world/scene/construction/helpers/furnishings/shaving-horse"
import { breadRack } from "#/world/scene/construction/helpers/furnishings/bread-rack"
import { tiltedShelf } from "#/world/scene/construction/helpers/furnishings/tilted-shelf"
import { hearth } from "#/world/scene/construction/helpers/furnishings/hearth"
import { B } from "#/world/scene/construction/helpers/furnishings/b"
import type { Builder } from "#/world/scene/construction/furnishings"

export const FURNISHINGS: Record<string, Builder> = {
  寝台: B((k, w, s) => bed({ k: k, wd: w, seed: s })),
  "寝台（二人用）": B((k, w, s) => bed({ k: k, wd: w, seed: s })),
  子どもの寝台: B((k, w, s) => bed({ k: k, wd: w, seed: s, child: true })),
  揺りかご: cradle,
  椅子: chair,
  長椅子: settle,
  暖炉の前の揺り椅子: rocker,
  食卓: diningTable,
  大きな食卓: diningTable,
  長卓: diningTable,
  卓: roundTable,
  地図の卓: mapTable,
  書き物机: desk,
  縫い物の台: sewingTable,
  祈祷台: prieDieu,
  作業台: B((k, w, s) => workbench({ k: k, wd: w, seed: s })),
  木工台: B((k, w, s) => workbench({ k: k, wd: w, seed: s, kind: "joiner" })),
  修理台: B((k, w, s) => workbench({ k: k, wd: w, seed: s, kind: "mend" })),
  調合台: alchemy,
  台所の台: kitchen,
  搾り台: press,
  本棚: bookcase,
  保存食の棚: pantry,
  道具棚: toolShelf,
  書類棚: pigeonholes,
  薬棚: medicineCase,
  器の棚: crockery,
  弓の並んだ棚: bowShelf,
  鍵付きの陳列棚: vitrine,
  売り台: B((k, w, s) => counter({ k: k, wd: w, seed: s })),
  カウンター: B((k, w, s) => counter({ k: k, wd: w, seed: s })),
  帳場: B((k, w, s) => counter({ k: k, wd: w, seed: s, ledger: true })),
  大きな天秤: bigScales,
  衣装箱: wardrobeChest,
  金庫: strongbox,
  素材の箱: B((k, w, s) => lidBox({ k: k, wd: w, seed: s, kind: "materials" })),
  粉箱: B((k, w, s) => lidBox({ k: k, wd: w, seed: s, kind: "flour" })),
  鋳掛けの道具箱: B((k, w, s) => lidBox({ k: k, wd: w, seed: s, kind: "tinker" })),
  木箱: B((k, w, s) => lidBox({ k: k, wd: w, seed: s, kind: "crate" })),
  樽: B((k, w, s) => cask({ k: k, wd: w, seed: s, onCradle: false, tall: 0.8 })),
  酒樽: B((k, w, s) => cask({ k: k, wd: w, seed: s, onCradle: true })),
  仕込み樽: B((k, w, s) => cask({ k: k, wd: w, seed: s, onCradle: false, tall: 1.1 })),
  水甕: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "water" })),
  魚桶: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "fish" })),
  洗濯桶: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "wash" })),
  灰汁の桶: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "lye" })),
  なめし桶: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "tan" })),
  釉の甕: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "glaze" })),
  茶の壺: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "tea" })),
  油壺: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "oil" })),
  ろうの鍋: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "wax" })),
  機織り機: loom,
  糸車: spinningWheel,
  ろくろ: pottersWheel,
  金床: anvil,
  窯: kiln,
  野菜籠: B((k, _w, s) => basketOf(k, s, "veg")),
  果物籠: B((k, _w, s) => basketOf(k, s, "fruit")),
  毛糸の籠: B((k, _w, s) => basketOf(k, s, "yarn")),
  編みかけの籠: B((k, _w, s) => basketOf(k, s, "unfinished")),
  羊毛の袋: B((k, _w, s) => sacks(k, s, "wool")),
  灰の袋: B((k, _w, s) => sacks(k, s, "ash")),
  柳の束: B((k, _w, s) => bundles(k, s, "willow")),
  木材: B((k, _w, s) => bundles(k, s, "timber")),
  薪の山: B((k, _w, s) => bundles(k, s, "logs")),
  鎧掛け: armorStand,
  槍立て: B((k, w, s) => spearRack({ k: k, wd: w, seed: s })),
  古い槍: B((k, w, s) => spearRack({ k: k, wd: w, seed: s, old: true })),
  止まり木: perch,
  巣箱: B((k) => beehive(k)),
  干し草: B((k) => hay(k)),
  荷車: handcart,
  腰掛け: stool,
  洗面台: washstand,
  箪笥: B((k, w, s) => drawers({ k: k, wd: w, seed: s })),
  長持: B((k, w, s) => wardrobeChest(k, w, s)),
  帽子掛け: coatStand,
  鳥かご: birdcage,
  火鉢: B((k) => brazier(k)),
  削り馬: shavingHorse,
  パン籠: breadRack,
  薪入れ: B((k, _w, s) => bundles(k, s, "logs")),
  薬草の籠: B((k, _w, s) => basketOf(k, s, "veg")),
  焼き入れの桶: B((k, w, s) => tub({ k: k, wd: w, seed: s, what: "fish" })),
  食器棚: B((k, w, s) => tiltedShelf({ k: k, wd: w, seed: s, what: "plates" })),
  酒の棚: B((k, w, s) => tiltedShelf({ k: k, wd: w, seed: s, what: "bottles" })),
  糸の棚: B((k, w, s) => tiltedShelf({ k: k, wd: w, seed: s, what: "thread" })),
  革の棚: B((k, w, s) => tiltedShelf({ k: k, wd: w, seed: s, what: "leather" })),
  炉: B((k, w, s) => hearth({ k: k, wd: w, seed: s })),
  暖炉: B((k, w, s) => hearth({ k: k, wd: w, seed: s, set: true })),
}
