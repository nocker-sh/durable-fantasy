---
{
  "id": "building-h-c4",
  "kind": "buildings",
  "title": "マルクスの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "mason",
  "residents": [
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "rooms": [
    "room-h-c4-tools",
    "room-h-c4-lye",
    "room-h-c4-entry",
    "room-h-c4-1",
    "room-h-c4-2",
    "room-h-c4-lower-stairs",
    "room-h-c4-upper-stairs",
    "room-h-c4-3",
    "room-h-c4-upper-hall",
    "room-h-c4-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-c4-tools",
    "room-h-c4-lye",
    "room-h-c4-entry",
    "room-h-c4-1",
    "room-h-c4-2",
    "room-h-c4-lower-stairs",
    "room-h-c4-upper-stairs",
    "room-h-c4-3",
    "room-h-c4-upper-hall",
    "room-h-c4-drying",
    "resident-マルクス",
    "resident-カタリーナ"
  ],
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
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
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-c4-lower-stairs",
      "upper_room": "room-h-c4-upper-stairs",
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
    "resident-マルクス",
    "resident-カタリーナ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 27,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-c4-tools",
          "room-h-c4-lye",
          "room-h-c4-entry",
          "room-h-c4-1",
          "room-h-c4-2",
          "room-h-c4-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-c4-upper-stairs",
          "room-h-c4-3",
          "room-h-c4-upper-hall",
          "room-h-c4-drying"
        ]
      }
    ]
  }
}
---
# マルクスの家

## 世帯と仕事

マルクスは石積みと煙突・炉を修理し、カタリーナは灰をふるって灰汁を作る。子どものダニエルとイダが暮らす。石けんを作る職業や加熱の設備は、灰汁の仕事から推定して追加しない。

## 二つの仕事と家庭

[[room-h-c4-tools]] は石工の道具と部材・仕事着の手入れ、[[room-h-c4-lye]] は灰と灰汁の受取り・作業と保管を持ち、別室にする。仕事の容器と道具を家庭の食材と食器・洗い物の代用にしない。

[[room-h-c4-entry]] から [[room-h-c4-1]] と [[room-h-c4-2]] へ行き、食事と子ども二人の寝床を現行どおり地上階に保つ。[[room-h-c4-lower-stairs]] と [[room-h-c4-upper-stairs]]、[[room-h-c4-upper-hall]] は [[room-h-c4-3]] と [[room-h-c4-drying]] へつながる。四人の寝台と衣服箱のIDを維持し、家庭の食卓の席も四人分持つ。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。灰の由来と仕入れ・作業方法と量、灰汁の容器と材質・漏れと移替え、粉塵・汚水と廃物、石工の現場と道具の手入れ・搬送、仕事と子どもの動線、敷地と道・隣家・地形・構造、便所と家庭の給排水・火と灰、四人の衣服と寝具・勤務と夜の見守り・休息、立体を詰めてから描画へ渡す。現行の灰汁の桶の未描画の記録は維持する。
