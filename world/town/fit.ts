export const TILE_M = 1.4

/** the walls' thickness, taken off each side (m) */

/** the least gap to walk through between rows of furniture (m) */
export const AISLE = 0.6

/** a stair up, on the floor it starts from and the one it reaches (m) */

/** A piece of furniture: width along the wall, depth out from it, and the clear space it needs in front (m). */
export type Piece = {
  name: string
  w: number
  d: number
  front: number
}

/** Real sizes. Things hung on walls or small enough to stand on another piece take no floor. */
export const SIZES: Readonly<Record<string, Omit<Piece, "name"> | "wall">> = {
  寝台: { w: 0.9, d: 2.0, front: 0.5 },
  "寝台（二人用）": { w: 1.4, d: 2.0, front: 0.5 },
  子どもの寝台: { w: 0.8, d: 1.6, front: 0.4 },
  食卓: { w: 1.2, d: 0.8, front: 0.9 },
  大きな食卓: { w: 2.0, d: 0.9, front: 0.9 },
  地図の卓: { w: 1.2, d: 0.8, front: 0.9 },
  長卓: { w: 2.4, d: 0.8, front: 0.9 },
  卓: { w: 0.9, d: 0.9, front: 0.9 },
  長椅子: { w: 1.8, d: 0.4, front: 0.5 },
  椅子: { w: 0.45, d: 0.45, front: 0.3 },
  暖炉の前の揺り椅子: { w: 0.7, d: 0.9, front: 0.3 },
  衣装箱: { w: 1.0, d: 0.5, front: 0.6 },
  本棚: { w: 1.0, d: 0.35, front: 0.6 },
  保存食の棚: { w: 1.2, d: 0.4, front: 0.6 },
  道具棚: { w: 1.2, d: 0.45, front: 0.6 },
  書類棚: { w: 1.2, d: 0.4, front: 0.6 },
  棚: { w: 1.5, d: 0.5, front: 0.7 },
  薬棚: { w: 1.5, d: 0.4, front: 0.7 },
  商品棚: { w: 2.0, d: 0.45, front: 0.8 },
  弓の並んだ棚: { w: 1.5, d: 0.35, front: 0.6 },
  鍵付きの陳列棚: { w: 1.5, d: 0.5, front: 0.8 },
  売り台: { w: 1.8, d: 0.6, front: 0.9 },
  カウンター: { w: 2.0, d: 0.6, front: 0.9 },
  帳場: { w: 1.2, d: 0.6, front: 0.8 },
  書き物机: { w: 1.0, d: 0.6, front: 0.7 },
  祈祷台: { w: 0.6, d: 0.6, front: 0.7 },
  機織り機: { w: 1.2, d: 1.4, front: 0.6 },
  糸車: { w: 0.6, d: 0.9, front: 0.5 },
  縫い物の台: { w: 1.0, d: 0.6, front: 0.7 },
  調合台: { w: 1.4, d: 0.6, front: 0.8 },
  作業台: { w: 1.8, d: 0.8, front: 0.8 },
  木工台: { w: 2.0, d: 0.8, front: 0.9 },
  なめし桶: { w: 1.0, d: 1.0, front: 0.6 },
  搾り台: { w: 1.2, d: 1.2, front: 0.8 },
  仕込み樽: { w: 1.0, d: 1.0, front: 0.5 },
  酒樽: { w: 0.7, d: 0.7, front: 0.4 },
  樽: { w: 0.6, d: 0.6, front: 0.3 },
  // hung over the fire on its hook, taking no floor of its own
  大鍋: "wall",
  金庫: { w: 0.6, d: 0.6, front: 0.6 },
  天秤: "wall",
  大きな天秤: { w: 1.0, d: 0.8, front: 0.8 },
  素材の箱: { w: 1.2, d: 0.6, front: 0.6 },
  木箱: { w: 0.8, d: 0.6, front: 0.5 },
  粉箱: { w: 1.0, d: 0.6, front: 0.6 },
  野菜籠: { w: 0.6, d: 0.5, front: 0.3 },
  果物籠: { w: 0.6, d: 0.5, front: 0.3 },
  魚桶: { w: 0.6, d: 0.6, front: 0.3 },
  洗濯桶: { w: 0.7, d: 0.7, front: 0.5 },
  水甕: { w: 0.5, d: 0.5, front: 0.3 },
  羊毛の袋: { w: 0.8, d: 0.6, front: 0.3 },
  干し網: "wall",
  吊るした服: "wall",
  吊るした革: "wall",
  吊るした薬草: "wall",
  姿見: "wall",
  盾の壁掛け: "wall",
  鎧掛け: { w: 0.6, d: 0.5, front: 0.6 },
  槍立て: { w: 0.6, d: 0.4, front: 0.4 },
  町の絵地図: "wall",
  斧掛け: "wall",
  杖掛け: "wall",
  鉢植え: "wall",
  乳鉢: "wall",
  鉋と鋸: "wall",
  縄の束: "wall",
  木材: { w: 2.0, d: 0.5, front: 0.4 },
  薪の山: { w: 1.2, d: 0.6, front: 0.3 },
  荷車の車輪: "wall",
  鋤と鍬: "wall",
  干し草: { w: 3.0, d: 2.5, front: 0.6 },
  荷車: { w: 1.4, d: 2.6, front: 0.6 },
  巣箱: { w: 0.6, d: 0.5, front: 0.4 },
  止まり木: { w: 1.2, d: 0.4, front: 0.3 },
  取引の掲示板: "wall",
  // what the households that came later live and work with
  修理台: { w: 1.2, d: 0.6, front: 0.7 },
  ランタンの棚: "wall",
  毛糸の籠: { w: 0.5, d: 0.5, front: 0.3 },
  紙の束: "wall",
  茶の壺: { w: 0.4, d: 0.4, front: 0.3 },
  ろうの鍋: { w: 0.8, d: 0.8, front: 0.6 },
  芯の束: "wall",
  油壺: { w: 0.5, d: 0.5, front: 0.3 },
  ろくろ: { w: 0.9, d: 0.9, front: 0.7 },
  器の棚: { w: 1.4, d: 0.4, front: 0.6 },
  釉の甕: { w: 0.6, d: 0.6, front: 0.4 },
  柳の束: { w: 1.0, d: 0.5, front: 0.3 },
  編みかけの籠: { w: 0.6, d: 0.6, front: 0.3 },
  石鑿と槌: "wall",
  灰汁の桶: { w: 0.7, d: 0.7, front: 0.4 },
  煙突ぶらし: "wall",
  灰の袋: { w: 0.9, d: 0.6, front: 0.3 },
  鋳掛けの道具箱: { w: 0.9, d: 0.5, front: 0.6 },
  // what the shops and rooms came to need, so the rooms read as lived in (scene/construction/furnishings.ts)
  食器棚: { w: 1.2, d: 0.45, front: 0.6 },
  酒の棚: { w: 1.4, d: 0.4, front: 0.6 },
  糸の棚: { w: 1.2, d: 0.4, front: 0.6 },
  革の棚: { w: 1.2, d: 0.45, front: 0.6 },
  腰掛け: { w: 0.35, d: 0.35, front: 0.3 },
  洗面台: { w: 0.6, d: 0.45, front: 0.5 },
  箪笥: { w: 1.0, d: 0.5, front: 0.6 },
  長持: { w: 1.4, d: 0.6, front: 0.6 },
  帽子掛け: { w: 0.45, d: 0.45, front: 0.3 },
  鳥かご: { w: 0.45, d: 0.45, front: 0.3 },
  火鉢: { w: 0.6, d: 0.6, front: 0.5 },
  削り馬: { w: 1.4, d: 0.5, front: 0.6 },
  パン籠: { w: 0.8, d: 0.5, front: 0.5 },
  薪入れ: { w: 0.6, d: 0.4, front: 0.3 },
  薬草の籠: { w: 0.6, d: 0.5, front: 0.3 },
  焼き入れの桶: { w: 0.7, d: 0.7, front: 0.4 },
  砥石: { w: 0.6, d: 0.5, front: 0.6 },
  弓掛け: "wall",
  干した皮: "wall",
  燻しの棚: { w: 1.2, d: 0.5, front: 0.6 },
  石板の束: "wall",
  揺り椅子: { w: 0.7, d: 0.9, front: 0.3 },
  古い槍: "wall",
  地図の束: "wall",
  製図の机: { w: 1.2, d: 0.7, front: 0.8 },
  暖炉: { w: 1.4, d: 0.7, front: 1.0 },
  // the hearth in the middle of the room, the kitchen worktop beside it (floorplan.ts)
  炉: { w: 1.2, d: 1.0, front: 0.7 },
  台所の台: { w: 1.4, d: 0.6, front: 0.8 },
}

/** Every home has a hearth (the town is cold), and a kitchen has a worktop beside it. */

export type FloorFit = {
  floor: number
  w: number
  d: number
  used: number
  fits: boolean
}

export type Fit = {
  id: string
  ok: boolean
  floors: FloorFit[]
  area: number
  people: number
  unknown: string[]
  reason?: string
}
