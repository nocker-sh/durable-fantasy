---
{
  "id": "building-apothecary",
  "kind": "buildings",
  "title": "イルムガルトの薬屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "apothecary",
  "residents": [
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "rooms": [
    "room-apothecary-1",
    "room-apothecary-2",
    "room-apothecary-lower-stairs",
    "room-apothecary-upper-stairs",
    "room-apothecary-3",
    "room-apothecary-4",
    "room-apothecary-upper-hall",
    "room-apothecary-household",
    "room-apothecary-5"
  ],
  "role": "shop",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "薬草と薬の保管条件・乾燥と調合の衛生、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-apothecary-1",
    "room-apothecary-2",
    "room-apothecary-lower-stairs",
    "room-apothecary-upper-stairs",
    "room-apothecary-3",
    "room-apothecary-4",
    "room-apothecary-upper-hall",
    "room-apothecary-household",
    "room-apothecary-5",
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.32
    },
    {
      "floor": 1,
      "elevation_m": 2.52,
      "ceiling_elevation_m": 4.72
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-apothecary-lower-stairs",
      "upper_room": "room-apothecary-upper-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "lower_end": "end",
      "opening_length_m": 3.64,
      "rail_inset_m": 0.05
    }
  ],
  "workers": [
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-apothecary-1",
          "room-apothecary-2",
          "room-apothecary-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-apothecary-upper-stairs",
          "room-apothecary-3",
          "room-apothecary-4",
          "room-apothecary-upper-hall",
          "room-apothecary-household",
          "room-apothecary-5"
        ]
      }
    ]
  }
}
---
# イルムガルトの薬屋

## 世帯と仕事

薬師イルムガルトと住み込みの弟子エーファが暮らす。薬草は草原で摘み、買取屋からも仕入れる。師弟の個室を分け、家族と同じ相部屋を前提にしない。

## 材料と薬、家庭の区画

地上階の [[room-apothecary-1]] は完成した薬と受渡し、[[room-apothecary-2]] は材料と調合道具・計量と混合・洗い物・使用後の受けを持つ。加熱を含む加工の設備と材料・数は `world/core/recipes/alchemy.ts` を正とする。家庭の炉を仕事の加工設備へ読み替えない。

[[room-apothecary-lower-stairs]] と [[room-apothecary-upper-stairs]] は [[room-apothecary-upper-hall]] へつながる。[[room-apothecary-3]] と [[room-apothecary-4]] にそれぞれ本人の寝台と衣服箱を維持し、[[room-apothecary-household]] に二人の家庭の食事を持つ。[[room-apothecary-5]] は薬草の仕事の乾燥部屋であり、寝間や衣服の物干しの代用にはしない。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。敷地と道路・隣家・地形、薬草の種類ごとの保管と乾燥・調合の衛生・必要量と所要時間、材料と加工設備への搬送、換気と灰・家庭との混入防止、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、師弟の勤務と休息・立体を詰めてから描画へ渡す。
