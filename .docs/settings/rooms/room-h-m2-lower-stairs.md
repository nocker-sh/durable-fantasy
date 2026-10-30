---
{
  "id": "room-h-m2-lower-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "bed_capacity": 0,
  "title": "アガーテのろうそく屋／1階 家族の階段",
  "room_name": "1階 家族の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "アガーテ",
    "ジーモン",
    "フェリックス"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "アガーテ",
      "source": "町の木工所で製作しアガーテが手入れする案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          2,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "店主が上階へ上がる階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-アガーテ"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        15
      ],
      "width_cells": 2,
      "target": "room-h-m2-entry",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-m2-upper-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        2,
        13
      ],
      "target_access": [
        3,
        1
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
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
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....#",
      "#....D",
      "#....D",
      "#....#",
      "#....#",
      "#....#",
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
# アガーテのろうそく屋／1階 家族の階段

## 用途と暮らし

[[building-h-m2]] の平面案に属する。家族の入口から上階へ上がる。熱い蝋や灯り油の荷を階段で運ぶ前提にしない。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#....#
#....#
#....D
#....D
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
######
```
