import { residents as smith } from "./residents/smith.ts";
import { residents as bakers } from "./residents/bakers.ts";
import { residents as well } from "./residents/well.ts";
import { residents as greengrocer } from "./residents/greengrocer.ts";
import { residents as fruit } from "./residents/fruit.ts";
import { residents as fisher } from "./residents/fisher.ts";
import { residents as farm } from "./residents/farm.ts";
import { residents as elder } from "./residents/elder.ts";
import { residents as inn } from "./residents/inn.ts";
import { residents as woodcutter } from "./residents/woodcutter.ts";
import { residents as shepherd } from "./residents/shepherd.ts";
import { residents as priest } from "./residents/priest.ts";
import { residents as guards } from "./residents/guards.ts";
import { residents as carter } from "./residents/carter.ts";
import { residents as tavern } from "./residents/tavern.ts";
import { residents as apothecary } from "./residents/apothecary.ts";
import { residents as general } from "./residents/general.ts";
import { residents as tailor } from "./residents/tailor.ts";
import { residents as crystal } from "./residents/crystal.ts";
import { residents as buyer } from "./residents/buyer.ts";
import { residents as armorer } from "./residents/armorer.ts";
import { residents as woodworker } from "./residents/woodworker.ts";
import { residents as leather } from "./residents/leather.ts";
import { residents as guide } from "./residents/guide.ts";
import { residents as warehouse } from "./residents/warehouse.ts";
import { residents as lamp } from "./residents/lamp.ts";
import { residents as mapmaker } from "./residents/mapmaker.ts";
import { residents as scribe } from "./residents/scribe.ts";
import { residents as candle } from "./residents/candle.ts";
import { residents as potter } from "./residents/potter.ts";
import { residents as baskets } from "./residents/baskets.ts";
import { residents as mason } from "./residents/mason.ts";
import { residents as sweep } from "./residents/sweep.ts";
import { residents as tinker } from "./residents/tinker.ts";
import { residents as hunter } from "./residents/hunter.ts";
import { residents as teacher } from "./residents/teacher.ts";
import { residents as retired } from "./residents/retired.ts";

// Residents of the town: who they are, how they look and where they stand. What they say is in
// lines/, who they are as people in people.ts, their day in routines.ts.
import type { Look, Fringe, Anim } from "../scene/figure.ts";
import { keeperPlace } from "./interiors.ts";

type V2 = [number, number];

/** A resident: who they are, how they look, which map and spot they stand on. */
export type { Resident } from "./resident.ts";
import type { Resident } from "./resident.ts";

const LISTED: Resident[] = [
  smith["ギュンター"],
  smith["ペーター"],
  bakers["マルタ"],
  bakers["ハンス"],
  well["リーゼル"],
  greengrocer["アンナ"],
  fruit["クララ"],
  fisher["エルザ"],
  fruit["オットー"],
  greengrocer["グレーテ"],
  fisher["ヤコブ"],
  farm["フリッツ"],
  farm["ミア"],
  elder["ヴィルヘルム"],
  inn["ゲルダ"],
  woodcutter["ヨーゼフ"],
  farm["ウルリケ"],
  farm["カール"],
  shepherd["マティアス"],
  priest["ベネディクト"],
  guards["ディーター"],
  elder["ゾフィー"],
  carter["ベルタ"],
  carter["ルカス"],
  well["ヘレナ"],
  tavern["フランツ"],
  apothecary["イルムガルト"],
  general["ブルーノ"],
  tailor["マグダレーナ"],
  crystal["コンスタンティン"],
  buyer["ラインホルト"],
  armorer["ベアトリクス"],
  woodworker["ゴットフリート"],
  leather["ルドルフ"],
  guards["オイゲン"],
  guide["テオ"],
  warehouse["ヒルデ"],
  bakers["ローザ"],
  inn["ゼップ"],
  inn["ニーナ"],
  farm["ゲルトルート"],
  farm["ヴァルター"],
  priest["クレメンス"],
  fisher["パウル"],
  fisher["レナ"],
  fruit["ヨナス"],
  lamp["アウグスト"],
  lamp["ヘートヴィヒ"],
  lamp["ティム"],
  carter["エミール"],
  mapmaker["フェルディナント"],
  tavern["リリー"],
  tavern["マックス"],
  apothecary["エーファ"],
  tailor["ロッテ"],
  buyer["カスパー"],
  scribe["エーリヒ"],
  scribe["マリー"],
  scribe["ハンナ"],
  candle["アガーテ"],
  candle["ジーモン"],
  candle["フェリックス"],
  armorer["ルイーゼ"],
  woodworker["アントン"],
  potter["ハインリヒ"],
  potter["テレーゼ"],
  potter["アデーレ"],
  baskets["エマ"],
  baskets["ニクラス"],
  baskets["フリーダ"],
  baskets["ローゼマリー"],
  mason["マルクス"],
  mason["カタリーナ"],
  mason["ダニエル"],
  mason["イダ"],
  sweep["ベルンハルト"],
  sweep["モニカ"],
  sweep["トビアス"],
  guards["シュテファン"],
  guards["ヴェロニカ"],
  warehouse["ゲオルク"],
  tinker["クルト"],
  tinker["ザビーネ"],
  tinker["ヨハン"],
  tinker["リナ"],
  hunter["ファルク"],
  hunter["ブリギッテ"],
  hunter["ロルフ"],
  teacher["クリスティアン"],
  teacher["ドロテア"],
  teacher["ラウラ"],
  teacher["ベンヤミン"],
  retired["エドガー"],
  retired["マルグリット"],
];

/** Everyone, with shopkeepers moved behind the counters of the shops you walk into. */
export const RESIDENTS: Resident[] = LISTED.map((r) => {
  const p = keeperPlace(r.name);
  return p ? { ...r, map: p.map, at: [(p.cell[0] + 0.5) / 2, (p.cell[1] + 0.5) / 2] as V2 } : r;
});

/** Hats off until hair and face shapes are settled; armour stays on. */
export function wearable(look: Look): Look {
  return look.hat !== "helm" && look.hat !== "greathelm" ? { ...look, hat: undefined } : look;
}

const F_FRINGES: Fringe[] = ["swept", "curtain", "blunt", "flicked", "dangle", "natural", "slant", "zigzag"];
const M_FRINGES: Fringe[] = ["spiky", "blunt", "swept", "flicked", "curtain", "natural", "slant", "zigzag"];

/** Wraps residents wear when their look names none: everyone wraps something round the neck. */
const NECKS: Look["neck"][] = ["muffler", "scarf", "muffler", "stole", "muffler", "scarf"];
const NECK_RAMPS = ["cRed", "cMustard", "cGreen", "cBlue", "cWine", "cCream", "cPlum", "cHoney", "cSky", "cBrown"];
const NECK_STRIPES = [undefined, "cCream", undefined, "cLinen", undefined, undefined, "cWine"];

/** The looks residents are drawn with: hats off, a fringe and a neck wrap picked in turn where none is set. */
export const RESIDENT_LOOKS: Look[] = (() => {
  const n = { f: 0, m: 0 };
  return RESIDENTS.map((r, i) => {
    let look = wearable(r.look);
    if (!look.fringe) look = { ...look, fringe: (look.sex === "f" ? F_FRINGES : M_FRINGES)[n[look.sex]++ % 8] };
    if (!look.neck) {
      const stripe = NECK_STRIPES[(i * 5) % NECK_STRIPES.length];
      look = { ...look, neck: NECKS[(i * 7) % NECKS.length], neckRamp: NECK_RAMPS[(i * 3) % NECK_RAMPS.length], ...(stripe ? { neckStripe: stripe } : {}) };
    }
    return look;
  });
})();

/** Anims residents play (they stand and look around), baked ahead of time. */
export const RESIDENT_ANIMS: Anim[] = ["idle", "look"];
