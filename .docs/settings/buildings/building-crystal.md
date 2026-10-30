---
{
  "id": "building-crystal",
  "kind": "buildings",
  "title": "コンスタンティンの結晶屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "crystal",
  "residents": [
    "resident-コンスタンティン"
  ],
  "rooms": [
    "room-crystal-1",
    "room-crystal-2",
    "room-crystal-lower-stairs",
    "room-crystal-upper-stairs",
    "room-crystal-3",
    "room-crystal-household"
  ],
  "role": "shop",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-crystal-1",
    "room-crystal-2",
    "room-crystal-3",
    "room-crystal-lower-stairs",
    "room-crystal-upper-stairs",
    "room-crystal-household",
    "resident-コンスタンティン"
  ],
  "workers": [
    "resident-コンスタンティン"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 22,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-crystal-1",
          "room-crystal-2",
          "room-crystal-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-crystal-upper-stairs",
          "room-crystal-3",
          "room-crystal-household"
        ]
      }
    ]
  },
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
  "stair_sections": [
    {
      "lower_room": "room-crystal-lower-stairs",
      "upper_room": "room-crystal-upper-stairs",
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
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  }
}
---
# コンスタンティンの結晶屋

## 世帯と商売

コンスタンティンは一人で暮らし、世界樹のふもとの掘り仲間から結晶を仕入れて小売りする。研磨や魔石の加工を行う職業へ変えず、加工用の炉や作業場は追加しない。品揃えと値段はコードを正とする。

## 陳列と保管、本人の生活

地上階の [[room-crystal-1]] で鍵付きの棚・計量台・受渡しを持ち、[[room-crystal-2]] に商売の金庫と結晶の在庫・仕入れの帳簿・空の包みを分ける。金庫と本人の衣服箱を同じ用途にしない。

[[room-crystal-lower-stairs]] と [[room-crystal-upper-stairs]] は本人の住まいへ上がる区画とする。上階は [[room-crystal-3]] と [[room-crystal-household]] へ別々に入り、既存の寝床と個人収納のIDを維持する。家庭の食事の席を一人分持つ。

## 描画へ渡す条件

現行の敷地へこの外形を置けるとは判断しない。道と隣家・地形、結晶の量と保管条件・仕入れの搬送、金庫の重量と床・錠と鍵の扱い、棚の扉と照明・天秤の精度、便所と給排水・火と灰、寝具と衣服の手入れ、仕事と休息の時間、立体を照合してから描画へ渡す。
