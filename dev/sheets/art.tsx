import { ITEMS, ITEM_IDS } from "#/world/core/items.ts";
import { uiIconUrl } from "#/world/art/icons.ts";
import { SPRITES, type SpriteName } from "#/world/art/pixel-art.ts";
import { RAMPS } from "#/world/scene/pix.ts";
import { MOTIONS } from "#/dev/studio/motions.ts";
import { ANIMS } from "#/world/scene/figure.ts";
import { AGE as OPT_AGE, CLOTH, HAIR, HATS, ITEMS as HAND_ITEMS, NECKS, PRESETS, SEX, SKIN, STYLES } from "#/dev/studio/options.ts";
import { LOOKS as TRAVELLER_LOOKS } from "#/world/town/travellers.ts";
import { leafTex, rockTex, roofTex, stoneTex, thatchTex, woodTex } from "#/world/scene/textures.ts";
import { sheet } from "./schema.ts";

const uiIcons = sheet<SpriteName>({
  id: "icons",
  label: "アイコン",
  rows: () => Object.keys(SPRITES) as SpriteName[],
  key: (n) => n,
  name: (n) => n,
  kind: (n) => (ITEM_IDS.some((i) => ITEMS[i].icon === n) ? "アイテム" : "画面"),
  icon: (n) => <img src={uiIconUrl(n, 16)} alt="" style={{ imageRendering: "pixelated" }} />,
  cols: [{ label: "使うアイテム", get: (n) => ITEM_IDS.filter((i) => ITEMS[i].icon === n).length || "", w: "w-24" }],
  refs: (n) => ITEM_IDS.filter((i) => ITEMS[i].icon === n).map((i) => ({ sheet: "items", id: i, as: "アイコン" })),
});

/** A texture drawn into an image, pixel for pixel. */
function texUrl(b: { w: number; h: number; data: Uint8ClampedArray }): string {
  const c = document.createElement("canvas");
  c.width = b.w;
  c.height = b.h;
  c.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(b.data), b.w, b.h), 0, 0);
  return c.toDataURL();
}

const TEXTURES: Record<string, { name: string; make: () => { w: number; h: number; data: Uint8ClampedArray } }> = {
  stone: { name: "石積み", make: () => stoneTex() },
  rock: { name: "岩", make: () => rockTex() },
  wood: { name: "板", make: () => woodTex() },
  roof: { name: "瓦", make: () => roofTex() },
  slate: { name: "石板の屋根", make: () => roofTex("slate") },
  thatch: { name: "藁屋根", make: () => thatchTex() },
  leaf: { name: "葉", make: () => leafTex() },
  leaf2: { name: "葉（濃い）", make: () => leafTex("leaf2") },
};

const texCache = new Map<string, string>();

const texOf = (id: string) => texCache.get(id) ?? (texCache.set(id, texUrl(TEXTURES[id].make())), texCache.get(id)!);

const textures = sheet<string>({
  id: "textures",
  label: "テクスチャ",
  rows: () => Object.keys(TEXTURES),
  key: (id) => id,
  name: (id) => TEXTURES[id].name,
  kind: () => "テクスチャ",
  icon: (id) => <img src={texOf(id)} alt="" width={32} height={32} style={{ imageRendering: "pixelated" }} />,
  cols: [
    {
      label: "大きさ",
      get: (id) => {
        const t = TEXTURES[id].make();
        return `${t.w}×${t.h}`;
      },
      w: "w-20",
    },
  ],
  more: (id) => [{ title: "原寸の4倍", head: [], rows: [[<img key="t" src={texOf(id)} alt="" className="w-full max-w-lg" style={{ imageRendering: "pixelated" }} />]] }],
});

const ramps = sheet<string>({
  id: "ramps",
  label: "色",
  rows: () => Object.keys(RAMPS),
  key: (id) => id,
  name: (id) => id,
  kind: () => "色の段",
  cols: [
    {
      label: "段",
      get: (id) => (
        <span className="flex">
          {RAMPS[id].map((c, i) => (
            <span key={i} className="inline-block size-4" style={{ background: `rgb(${c.join(",")})` }} />
          ))}
        </span>
      ),
    },
  ],
});

const motions = sheet<(typeof MOTIONS)[number]>({
  id: "motions",
  label: "動き",
  rows: () => MOTIONS,
  key: (m) => m.clip,
  name: (m) => m.label,
  kind: (m) => m.cat,
  cols: [
    { label: "持ち物", get: (m) => m.item ?? "" },
    { label: "小道具", get: (m) => m.prop ?? "" },
  ],
});

const anims = sheet<string>({
  id: "anims",
  label: "住民の動き",
  rows: () => Object.keys(ANIMS),
  key: (a) => a,
  name: (a) => a,
  kind: (a) => ANIMS[a as keyof typeof ANIMS].clip,
  cols: [{ label: "コマ", get: (a) => ANIMS[a as keyof typeof ANIMS].n, w: "w-12" }],
  refs: (a) => MOTIONS.filter((m) => m.clip === ANIMS[a as keyof typeof ANIMS].clip).map((m) => ({ sheet: "motions", id: m.clip, as: "元の動き" })),
});

type PartRow = { group: string; value: string; label: string };

const PART_GROUPS: [string, readonly (readonly [unknown, string])[]][] = [
  ["性別", SEX],
  ["年齢", OPT_AGE],
  ["肌", SKIN],
  ["髪色", HAIR],
  ["髪型", STYLES],
  ["服の色", CLOTH],
  ["帽子", HATS],
  ["首巻き", NECKS],
  ["持ち物", HAND_ITEMS],
];

const parts = sheet<PartRow>({
  id: "parts",
  label: "見た目の部品",
  rows: () => PART_GROUPS.flatMap(([group, list]) => list.map(([v, label]) => ({ group, value: String(v ?? "none"), label }))),
  key: (r) => `${r.group}:${r.value}`,
  name: (r) => r.label,
  kind: (r) => r.group,
  cols: [{ label: "値", get: (r) => r.value }],
});

type PresetRow = { label: string; from: string };

const presets = sheet<PresetRow>({
  id: "presets",
  label: "見た目の型",
  rows: () => [...PRESETS.map(([label]) => ({ label, from: "装備セット" })), ...TRAVELLER_LOOKS.map((l) => ({ label: l.label, from: "旅人" }))],
  key: (r) => `${r.from}:${r.label}`,
  name: (r) => r.label,
  kind: (r) => r.from,
  cols: [],
});

export { uiIcons, texUrl, textures, ramps, motions, anims, parts, presets };
