---
{
  "id": "building-buyer",
  "kind": "buildings",
  "title": "ラインホルトの買取所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "buyer",
  "residents": [
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "rooms": [
    "room-buyer-1",
    "room-buyer-2",
    "room-buyer-raw-store",
    "room-buyer-lower-stairs",
    "room-buyer-upper-stairs",
    "room-buyer-3",
    "room-buyer-kaspar",
    "room-buyer-upper-hall",
    "room-buyer-household"
  ],
  "role": "shop",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-buyer-1",
    "room-buyer-2",
    "room-buyer-raw-store",
    "room-buyer-lower-stairs",
    "room-buyer-upper-stairs",
    "room-buyer-3",
    "room-buyer-kaspar",
    "room-buyer-upper-hall",
    "room-buyer-household",
    "resident-ラインホルト",
    "resident-カスパー"
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
      "lower_room": "room-buyer-lower-stairs",
      "upper_room": "room-buyer-upper-stairs",
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
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-buyer-1",
          "room-buyer-2",
          "room-buyer-raw-store",
          "room-buyer-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-buyer-upper-stairs",
          "room-buyer-3",
          "room-buyer-kaspar",
          "room-buyer-upper-hall",
          "room-buyer-household"
        ]
      }
    ]
  }
}
---
# ラインホルトの買取所

## 世帯と仕事

ラインホルトが素材を買い取り卸し、孫カスパーが荷を運ぶ。二人の個室と個人収納を分け、商売の素材と家の食材・私物を区別する。買う品目と取引の値はコードを正とする。

## 受付と素材の保管

[[room-buyer-1]] で品の確認と計量、帳面と代金の受渡しを行う。[[room-buyer-2]] は乾いた重い素材と密閉容器の薬草、[[room-buyer-raw-store]] は生皮と毛皮の受取りと一時保管を持つ。二室には専用の屋外の入口を設け、重い素材も汚れた荷も住まいの階段を搬入路にしない。容器と室の区分だけで保管条件・衛生・廃物が成立したとはしない。

[[room-buyer-lower-stairs]] と [[room-buyer-upper-stairs]] は [[room-buyer-upper-hall]] へつながる。[[room-buyer-3]] と [[room-buyer-kaspar]] に既存の二人の寝台と衣服箱のIDを維持して分け、[[room-buyer-household]] に家庭の食事と調理・洗い物を持つ。現行の共用の屋根裏の寝間とは異なる平面案であり、描画と日課は切り替えない。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。道と荷車の旋回・隣家・地形、素材ごとの寸法と重量・計量と受入上限、粉塵と生皮・毛皮の保管時間と衛生・換気・排水と廃物、卸し先と搬送、床の強さと戸の操作、便所と家庭の火・給排水、衣服と寝具の手入れ、二人の勤務と休息、立体を詰めてから描画へ渡す。
