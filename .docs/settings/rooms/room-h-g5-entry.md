---
{
  "id": "room-h-g5-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "bed_capacity": 0,
  "title": "クリスティアンの家／1階 家庭と修理の入口・共用廊下",
  "room_name": "1階 家庭と修理の入口・共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    10
  ],
  "use": "生活",
  "occupants": [
    "クリスティアン",
    "ドロテア",
    "ラウラ",
    "ベンヤミン"
  ],
  "furniture": [],
  "connections": [
    {
      "kind": "door",
      "door": [
        20,
        1
      ],
      "width_cells": 2,
      "target": "map-phanthiet-gate"
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-g5-lower-stairs",
      "target_door": [
        5,
        11
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g5-study",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g5-care",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        4
      ],
      "width_cells": 2,
      "target": "room-h-g5-1",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        4
      ],
      "width_cells": 2,
      "target": "room-h-g5-2",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "private_for": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD########DD#####",
      "D...................D",
      "D...................D",
      "#...................#",
      "####DD########DD#####"
    ]
  }
}
---
# クリスティアンの家／1階 家庭と修理の入口・共用廊下

## 用途と暮らし

[[building-h-g5]] の平面案に属する。家庭の入口から二人の仕事の準備、居間と台所、階段へ分かれる。夜に仕事で出入りするときも、子どもの寝室を通り抜ける動線にしない。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................D
D...................D
#...................#
####DD########DD#####
```
