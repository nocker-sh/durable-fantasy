import { Pixel } from "./shared.tsx";
import { COMMISSIONS } from "#/world/core/commissions.ts";
import { RECIPES } from "#/world/core/crafting.ts";
import { STATIONS } from "#/world/town/stations.ts";
import { ERRANDS } from "#/world/core/errands.ts";
import { NODES } from "#/world/core/gather.ts";
import { GATHER_SKILL_NAME, ITEMS } from "#/world/core/items.ts";
import { iconUrl } from "#/world/art/icons.ts";
import { mapName, NODE_KIND, ref, STATION_KIND } from "./shared.tsx";
import { sheet } from "./schema.ts";

const nodeName = (n: (typeof NODES)[number]) => `${mapName(n.map)}の${NODE_KIND[n.kind]} ${n.id.split("-").pop()}`;

const nodes = sheet({
  id: "nodes",
  label: "採集場所",
  rows: () => NODES,
  key: (n) => n.id,
  name: nodeName,
  kind: (n) => NODE_KIND[n.kind],
  cols: [
    { label: "生活スキル", get: (n) => GATHER_SKILL_NAME[n.skill], w: "w-20" },
    { label: "道具", get: (n) => (n.needsTool ? "要る" : ""), w: "w-12" },
    { label: "回数", get: (n) => n.max, w: "w-12" },
    { label: "戻る(分)", get: (n) => n.regen, w: "w-16" },
    { label: "取れる物", get: (n) => n.yields.map((y) => ITEMS[y.item].name).join("、") },
  ],
  refs: (n) => {
    const total = n.yields.reduce((a, y) => a + y.weight, 0);
    return [
      ...ref("maps", n.map, "場所"),
      ...ref("life", n.skill, "生活スキル"),
      ...n.yields.map((y) => ({ sheet: "items", id: y.item, as: `取れる ${Math.round((y.weight / total) * 100)}%${y.level ? ` Lv${y.level}〜` : ""}` })),
    ];
  },
});

const stations = sheet({
  id: "stations",
  label: "作業場",
  rows: () => STATIONS,
  key: (s) => s.id,
  name: (s) => s.name,
  kind: (s) => STATION_KIND[s.kind],
  cols: [
    { label: "マップ", get: (s) => mapName(s.map) },
    { label: "料金", get: (s) => s.fee, w: "w-12" },
  ],
  refs: (s) => ref("maps", s.map, "場所"),
});

const recipes = sheet({
  id: "recipes",
  label: "レシピ",
  rows: () => RECIPES,
  key: (r) => r.id,
  name: (r) => ITEMS[r.output.item].name,
  kind: (r) => GATHER_SKILL_NAME[r.skill],
  icon: (r) => <Pixel src={iconUrl(r.output.item)} />,
  cols: [
    { label: "Lv", get: (r) => r.min, w: "w-10" },
    { label: "数", get: (r) => r.output.count, w: "w-10" },
    { label: "作業場", get: (r) => STATION_KIND[r.station], w: "w-20" },
    { label: "材料", get: (r) => r.inputs.map((x) => `${ITEMS[x.item].name}×${x.count}`).join("、") },
  ],
  refs: (r) => [
    { sheet: "items", id: r.output.item, as: `できる ×${r.output.count}` },
    ...r.inputs.map((x) => ({ sheet: "items", id: x.item, as: `材料 ×${x.count}` })),
    ...STATIONS.filter((s) => s.kind === r.station).map((s) => ({ sheet: "stations", id: s.id, as: "作業場" })),
    ...ref("life", r.skill, "生活スキル"),
  ],
});

const commissions = sheet({
  id: "commissions",
  label: "注文",
  rows: () => COMMISSIONS,
  key: (c) => c.id,
  name: (c) => ITEMS[c.output.item].name,
  kind: () => "職人に頼む",
  icon: (c) => <Pixel src={iconUrl(c.output.item)} />,
  cols: [
    { label: "職人", get: (c) => c.craftsman, w: "w-24" },
    { label: "料金", get: (c) => c.fee, w: "w-12" },
    { label: "分", get: (c) => c.minutes, w: "w-12" },
    { label: "材料", get: (c) => c.inputs.map((x) => `${ITEMS[x.item].name}×${x.count}`).join("、") },
  ],
  refs: (c) => [
    ...ref("npcs", c.craftsman, "職人"),
    { sheet: "items", id: c.output.item, as: `できる ×${c.output.count}` },
    ...c.inputs.map((x) => ({ sheet: "items", id: x.item, as: `材料 ×${x.count}` })),
  ],
});

const errands = sheet({
  id: "errands",
  label: "頼まれごと",
  rows: () => ERRANDS,
  key: (e) => e.id,
  name: (e) => (e.wants ? `${ITEMS[e.wants.item].name}×${e.wants.count}` : (e.parcel ?? e.id)),
  kind: (e) => (e.kind === "bring" ? "持ってくる" : "届ける"),
  cols: [
    { label: "頼む人", get: (e) => e.from, w: "w-24" },
    { label: "届け先", get: (e) => e.to ?? "", w: "w-24" },
    { label: "報酬", get: (e) => e.gold, w: "w-12" },
    { label: "頼み", get: (e) => e.ask },
  ],
  refs: (e) => [...ref("npcs", e.from, "頼む人"), ...ref("npcs", e.to, "届け先"), ...(e.wants ? [{ sheet: "items", id: e.wants.item, as: `欲しい ×${e.wants.count}` }] : [])],
  more: (e) => [{ title: "台詞", head: ["頼むとき", "済んだとき"], rows: [[e.ask, e.thanks]] }],
});

export { nodes, stations, recipes, commissions, errands };
