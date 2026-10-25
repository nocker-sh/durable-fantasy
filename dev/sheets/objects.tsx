import { Thumb } from "../three-view.tsx";
import { PROPS } from "#/dev/studio/props-catalog.ts";
import { SIZES } from "#/world/town/fit.ts";
import { HOUSES } from "#/world/town/houses.ts";
import { INTERIORS } from "#/world/town/interiors.ts";
import { ROOM_FURNITURE } from "./shared.tsx";
import { sheet } from "./schema.ts";

/** Furniture in the house plans, the furniture drawn in rooms you walk into, and the things the maps are dressed with. */
type ObjectRow = { id: string; name: string; group: string };

const OBJECTS: ObjectRow[] = [
  ...Object.keys(SIZES).map((name) => ({ id: name, name, group: SIZES[name] === "wall" ? "壁に掛ける物" : "家具" })),
  ...Object.entries(ROOM_FURNITURE).map(([kind, name]) => ({ id: `room-${kind}`, name, group: "店や公共の建物の中" })),
  ...PROPS.map((p) => ({ id: p.id, name: p.name, group: `外（${p.group}）` })),
];

const planCount = (name: string) =>
  HOUSES.flatMap((h) => h.plan.furniture).reduce((n, f) => {
    const m = /^(.+?)(?:×(\d+))?(?:（.+）)?$/.exec(f)!;
    return m[1] === name ? n + Number(m[2] ?? 1) : n;
  }, 0);

const objects = sheet<ObjectRow>({
  id: "objects",
  label: "オブジェクト",
  rows: () => OBJECTS,
  key: (o) => o.id,
  name: (o) => o.name,
  kind: (o) => o.group,
  cols: [
    {
      label: "幅×奥行(m)",
      get: (o) => {
        const s = SIZES[o.id];
        return s && s !== "wall" ? `${s.w}×${s.d}` : "";
      },
      w: "w-24",
    },
    {
      label: "前の空き(m)",
      get: (o) => {
        const s = SIZES[o.id];
        return s && s !== "wall" ? s.front : "";
      },
      w: "w-24",
    },
    {
      label: "数",
      get: (o) => (o.id.startsWith("room-") ? INTERIORS.reduce((n, i) => n + i.furniture.filter((f) => `room-${f.kind}` === o.id).length, 0) : SIZES[o.id] ? planCount(o.id) : ""),
      w: "w-12",
    },
  ],
  refs: (o) =>
    o.id.startsWith("room-")
      ? [...new Set(INTERIORS.filter((i) => i.furniture.some((f) => `room-${f.kind}` === o.id)).map((i) => i.house.id))].map((id) => ({ sheet: "houses", id, as: "置かれた建物" }))
      : [],
  icon: (o) => {
    const p = PROPS.find((x) => x.id === o.id);
    return p ? <Thumb id={`prop-${p.id}`} build={p.build} px={32} /> : null;
  },
  build: (o) => PROPS.find((p) => p.id === o.id)?.build ?? null,
});

export { objects };
