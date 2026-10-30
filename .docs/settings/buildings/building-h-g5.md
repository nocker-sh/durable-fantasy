---
{
  "id": "building-h-g5",
  "kind": "buildings",
  "title": "クリスティアンの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "teacher",
  "residents": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "rooms": [
    "room-h-g5-study",
    "room-h-g5-care",
    "room-h-g5-entry",
    "room-h-g5-1",
    "room-h-g5-2",
    "room-h-g5-lower-stairs",
    "room-h-g5-upper-stairs",
    "room-h-g5-3",
    "room-h-g5-4",
    "room-h-g5-upper-hall",
    "room-h-g5-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-g5-study",
    "room-h-g5-care",
    "room-h-g5-entry",
    "room-h-g5-1",
    "room-h-g5-2",
    "room-h-g5-lower-stairs",
    "room-h-g5-upper-stairs",
    "room-h-g5-3",
    "room-h-g5-4",
    "room-h-g5-upper-hall",
    "room-h-g5-drying",
    "resident-クリスティアン",
    "resident-ドロテア"
  ],
  "runtime_layout_omissions": {
    "source": "world/town/floorplan/floor-plan.ts",
    "rooms": [
      {
        "floor": 0,
        "name": "台所"
      }
    ]
  },
  "workers": [
    "resident-クリスティアン",
    "resident-ドロテア"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 27,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-g5-study",
          "room-h-g5-care",
          "room-h-g5-entry",
          "room-h-g5-1",
          "room-h-g5-2",
          "room-h-g5-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-g5-upper-stairs",
          "room-h-g5-3",
          "room-h-g5-4",
          "room-h-g5-upper-hall",
          "room-h-g5-drying"
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
      "lower_room": "room-h-g5-lower-stairs",
      "upper_room": "room-h-g5-upper-stairs",
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
# クリスティアンの家

## 世帯と外での仕事

クリスティアンは寄り合い所で子どもへ読み書きを教え、ドロテアは産婆の仕事をし、子どものラウラとベンヤミンが暮らす。授業の場所を家へ移したり、家へ診療所を新しく設けたりする前提にしない。

## 仕事の準備と家庭

[[room-h-g5-study]] は本と石板・筆記道具と教材を準備する机、[[room-h-g5-care]] は訪問の籠と仕事の布・持ち帰った物の手入れを持つ。授業を行う部屋は [[room-h-m5-1]] へ結び、家では準備してから持ち出す。勤務の時間や教室の人数はここで追加しない。

[[room-h-g5-entry]] は仕事の準備・[[room-h-g5-1]] と [[room-h-g5-2]]・階段を結ぶ。[[room-h-g5-lower-stairs]] と [[room-h-g5-upper-stairs]]、[[room-h-g5-upper-hall]] は [[room-h-g5-3]] と [[room-h-g5-4]] へつながり、四人の寝台と衣服箱のIDを維持する。[[room-h-g5-drying]] は家庭の衣服と寝具へ分ける。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。寄り合い所との教材の運搬・授業と家での準備の時間、訪問先と夜の呼出し・仕事の布と道具の衛生・洗いと乾燥、家族の食事と見守り・睡眠、敷地と道・隣家・地形・構造、便所と給排水・火と紙・暖房、衣服と寝具の量、立体を詰めてから描画へ渡す。現行の独立した台所の未対応の記録は維持する。
