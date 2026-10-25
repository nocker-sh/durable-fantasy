import { bedsOf, enterable, floorsOf, type HouseDef } from "../houses.ts";
import { SIZES } from "../fit.ts";
import type { Use } from "./types.ts";

const useOf = (name: string): Use =>
  /店先|売り場|買取場|預かり場/.test(name)
    ? "売り場"
    : /土間/.test(name)
      ? "土間"
      : /台所/.test(name) && !/居間/.test(name)
        ? "台所"
        : /客室/.test(name)
          ? "客室"
          : /寝|部屋|寝所/.test(name)
            ? "寝間"
            : /倉|貯蔵|物置|酒蔵|乾燥|干し草|農具/.test(name)
              ? "貯蔵"
              : /鶏/.test(name)
                ? "家畜"
                : /居間|食堂|酒場|集会|書斎/.test(name)
                  ? "食事"
                  : /工房|仕事場|作業場|調合|なめし|仕上げ|鍛冶|仕込み|詰所|脱穀/.test(name)
                    ? "作業場"
                    : "住まい";

/** what stands in the shop, at the counter */
const COUNTERS = /^(売り台|カウンター|帳場|鍵付きの陳列棚|大きな天秤)$/;

const SHELVES = /棚$/;

const WORK = /^(作業台|調合台|木工台|なめし桶|搾り台|仕込み樽|機織り機|糸車|縫い物の台|書き物机|祈祷台|大鍋|干し草|荷車|巣箱|止まり木)$/;

const TABLES = /^(食卓|大きな食卓|長卓|卓|地図の卓)$/;

const SEATS = /^(椅子|長椅子|暖炉の前の揺り椅子)$/;

const sizeOf = (name: string) => {
  const s = SIZES[name];
  return s && s !== "wall" ? s : null;
};

/** The furniture a plan names, one entry per piece, each tagged for upstairs if it lives there. */
function entries(h: HouseDef): { name: string; up: boolean }[] {
  const out: { name: string; up: boolean }[] = [];
  const twoFloors = floorsOf(h) > 1;
  for (const f of h.plan.furniture) {
    if (f.endsWith("（外）")) continue;
    const up = f.endsWith("（2階）");
    const m = /^(.+?)(?:×(\d+))?(?:（2階）)?$/.exec(f)!;
    const storeUp =
      twoFloors &&
      ((/酒樽|仕込み樽/.test(m[1]) && h.plan.rooms.some((r) => r.floor === 1 && /蔵|貯蔵/.test(r.name))) || (/書類棚/.test(m[1]) && h.plan.rooms.some((r) => r.floor === 1 && /記録/.test(r.name))));
    for (let k = 0; k < Number(m[2] ?? 1); k++) out.push({ name: m[1], up: up || storeUp || (twoFloors && /寝台|衣装箱|本棚/.test(m[1])) });
  }
  // every shop serves across a counter (a sales board where the plan names none)
  if (h.shop && enterable(h) && !out.some((e) => COUNTERS.test(e.name))) out.push({ name: "売り台", up: false });
  // a household with beds keeps a chest for clothes beside them
  if (bedsOf(h) && !out.some((e) => e.name === "衣装箱")) out.push({ name: "衣装箱", up: twoFloors });
  return out;
}

export { useOf, COUNTERS, SHELVES, WORK, TABLES, SEATS, sizeOf, entries };
