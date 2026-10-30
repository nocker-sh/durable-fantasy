---
{
  "id": "room-h-c4-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "bed_capacity": 0,
  "title": "マルクスの家／1階 家庭の入口と共用廊下",
  "room_name": "1階 家庭の入口と共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    10
  ],
  "use": "生活",
  "occupants": [
    "マルクス",
    "カタリーナ",
    "ダニエル",
    "イダ"
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
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-c4-lower-stairs",
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
      "target": "room-h-c4-tools",
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
      "target": "room-h-c4-lye",
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
      "target": "room-h-c4-1",
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
      "target": "room-h-c4-2",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c4",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "private_for": [
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
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
# マルクスの家／1階 家庭の入口と共用廊下

## 用途と暮らし

[[building-h-c4]] の平面案に属する。家庭の入口から二つの仕事の室と台所・子どもの寝室・階段へ分かれる。子どもが石工の道具と灰汁の室を通り抜けて寝床や食卓へ行く前提にしない。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................D
D...................D
#...................#
####DD########DD#####
```
