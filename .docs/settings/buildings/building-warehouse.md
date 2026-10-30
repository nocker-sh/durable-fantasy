---
{
  "id": "building-warehouse",
  "kind": "buildings",
  "title": "町の倉庫",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "warehouse",
  "residents": [
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "rooms": [
    "room-warehouse-1",
    "room-warehouse-2",
    "room-warehouse-lower-stairs",
    "room-warehouse-upper-stairs",
    "room-warehouse-3",
    "room-warehouse-household"
  ],
  "role": "public",
  "issues": [
    "敷地・道・隣家と地形、戸・窓・梁は未照合",
    "預かり荷の寸法と重量・容量・搬送、給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-warehouse-1",
    "room-warehouse-2",
    "room-warehouse-lower-stairs",
    "room-warehouse-upper-stairs",
    "room-warehouse-3",
    "room-warehouse-household",
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "workers": [
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 24,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-warehouse-1",
          "room-warehouse-2",
          "room-warehouse-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-warehouse-upper-stairs",
          "room-warehouse-3",
          "room-warehouse-household"
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
      "lower_room": "room-warehouse-lower-stairs",
      "upper_room": "room-warehouse-upper-stairs",
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
# 町の倉庫

## 役割と世帯

ヒルデは帳簿と預かり証を管理し、夫のゲオルクが荷を扱う。二人の住まいは上階に置く。預かる物の所有者は荷の持ち主であり、倉庫の棚と荷そのものを混同しない。

## 預かりと家庭の分離

地上階の [[room-warehouse-1]] で荷と預かり証を確認し、[[room-warehouse-2]] の区画へ運ぶ。重い荷の搬入口は保管室の屋外に持たせ、私室や階段へ運ばない。荷を受ける寸法と重量・危険物と湿った物の扱い、取違えの防止は未確定であり、四区画を設けただけで保管量を保証しない。

[[room-warehouse-lower-stairs]] と [[room-warehouse-upper-stairs]] は住人の区画へ分ける。上階は [[room-warehouse-3]] と [[room-warehouse-household]] に分かれ、二人の寝台と衣服箱、家庭の食材と食事を仕事の預かり荷から分ける。

## 未解決の条件

この外形を現行の敷地へそのまま置けるとは判断しない。道と荷車の旋回・地形・隣家、荷の量と重量・床の強さ、戸と窓・梁、火と換気・煙と灰、給排水と便所、衣服と寝具の手入れ、仕事と休息の時間、立体を詰めてから描画へ渡す。
