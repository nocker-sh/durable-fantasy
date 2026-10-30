---
{
  "id": "room-leather-upper-stairs",
  "kind": "rooms",
  "title": "ルドルフの革工房／2階 共用通路と階段",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-leather",
  "bed_capacity": 0,
  "occupants": [
    "ルドルフ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "2階 共用通路と階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        6
      ],
      "width_cells": 2,
      "target": "room-leather-3",
      "target_door": [
        0,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        5,
        14
      ],
      "width_cells": 2,
      "target": "room-leather-household",
      "target_door": [
        0,
        3
      ]
    },
    {
      "kind": "stair",
      "target": "room-leather-lower-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        2,
        13
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "店主が上階へ上がる階段",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "店主が上階へ上がる階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-leather",
    "resident-ルドルフ"
  ],
  "private_for": [
    "resident-ルドルフ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....D",
      "#....D",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ]
  }
}
---
# ルドルフの革工房／2階 共用通路と階段

## 用途と暮らし

[[building-leather]] の平面案に属する。本人の寝室と家庭の台所へ別々に入る。住まいへ仕事の水と皮を運び上げる動線にはしない。

## 未解決の条件

敷地と構造、戸・窓・梁と換気、作業の水と汚れ・薬剤・皮の運搬、給排水と便所・家庭の火、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#....#
#....D
#....D
#....#
#....#
#....#
#....#
#....#
######
```
