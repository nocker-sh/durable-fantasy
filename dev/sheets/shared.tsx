import { STAT_NAME } from "#/world/core/growth.ts";
import { GATHER_SKILL_NAME, ITEMS, type ItemId, type Skill } from "#/world/core/items.ts";
import { effectOf } from "#/world/core/makers.ts";
import { MAPS } from "#/world/maps/index.ts";
import { RESIDENTS } from "#/world/town/residents.ts";
import { HOUSES, householdOf } from "#/world/town/houses.ts";
import type { Ref } from "./schema.ts";

const ref = (sheet: string, id: string | undefined | null, as: string): Ref[] => (id ? [{ sheet, id, as }] : []);

const mapName = (id: string) => MAPS[id]?.name ?? id;

/** A pixel icon at a whole multiple of its size. */
export function Pixel({ src, scale = 1, alt = "" }: { src: string; scale?: number; alt?: string }) {
  return <img src={src} alt={alt} style={{ imageRendering: "pixelated", zoom: scale }} />;
}

/** What an item does, in short pieces. */
export function effects(id: ItemId): string[] {
  const d = ITEMS[id];
  const e = effectOf(id);
  return [
    e.hp ? `HP+${e.hp}` : "",
    e.sp ? `SP+${e.sp}` : "",
    e.stamina ? `スタミナ+${e.stamina}` : "",
    e.full ? `満腹+${e.full}` : "",
    e.warm ? `暖${e.warm}分` : "",
    d.equip?.atk ? `攻撃+${d.equip.atk}` : "",
    d.equip?.def ? `防御+${d.equip.def}` : "",
    ...Object.entries(d.equip?.bonus ?? {}).map(([k, n]) => `${k === "maxHp" ? "最大HP" : k === "maxSp" ? "最大SP" : STAT_NAME[k as keyof typeof STAT_NAME]}+${n}`),
    d.equip?.twoHanded ? "両手" : "",
    d.tool ? `${GATHER_SKILL_NAME[d.tool.skill]}×${d.tool.power}` : "",
  ].filter(Boolean);
}

const needsText = (needs: Partial<Record<string, number>>) =>
  Object.entries(needs)
    .map(([k, n]) => `${STAT_NAME[k as keyof typeof STAT_NAME] ?? GATHER_SKILL_NAME[k as Skill] ?? k}${n}`)
    .join(" ");

const residentIndex = (name: string) => RESIDENTS.findIndex((r) => r.name === name);

const homeOf = (name: string) => {
  const hh = householdOf(name);
  return hh ? HOUSES.find((h) => h.household === hh.id) : undefined;
};

const AGE: Record<string, string> = { child: "子ども", adult: "大人", old: "年寄り" };

const NODE_KIND: Record<string, string> = { tree: "木", herbs: "薬草", flowers: "花", mushrooms: "きのこ", fish: "釣り場" };

const HOUSE_KIND: Record<string, string> = { home: "家", shop: "店", public: "公共", workshop: "仕事場", farm: "農家", vacant: "空き家" };

const MAP_KIND: Record<string, string> = { town: "町", indoor: "屋内", field: "野外", dungeon: "迷宮" };

const STATION_KIND: Record<string, string> = { hearth: "かまど", workbench: "作業台", loom: "機織り", forge: "炉" };

const ROOM_FURNITURE: Record<string, string> = {
  counter: "カウンター",
  shelf: "棚",
  table: "卓",
  bench: "長椅子",
  barrel: "樽",
  crate: "木箱",
  hearth: "暖炉",
  rug: "敷物",
  workbench: "作業台",
  rack: "掛け台",
  loom: "機織り機",
  chest: "衣装箱",
};

export { ref, mapName, needsText, residentIndex, homeOf, AGE, NODE_KIND, HOUSE_KIND, MAP_KIND, STATION_KIND, ROOM_FURNITURE };
