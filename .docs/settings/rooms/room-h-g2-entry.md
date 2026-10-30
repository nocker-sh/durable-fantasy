---
{
  "id": "room-h-g2-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "bed_capacity": 0,
  "title": "クルトの家／1階 家庭と修理の入口・共用廊下",
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
    "クルト",
    "ザビーネ",
    "ヨハン",
    "リナ"
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
      "target": "room-h-g2-lower-stairs",
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
      "target": "room-h-g2-repair",
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
      "target": "room-h-g2-grinding",
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
      "target": "room-h-g2-1",
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
      "target": "room-h-g2-2",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "private_for": [
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
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
# クルトの家／1階 家庭と修理の入口・共用廊下

## 用途と暮らし

[[building-h-g2]] の平面案に属する。家庭の入口から二つの仕事の室、居間と台所、階段へ分かれる。子どもが熱い修理品と刃物の部屋を通り抜けて食卓と寝床へ行く前提にしない。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................D
D...................D
#...................#
####DD########DD#####
```
