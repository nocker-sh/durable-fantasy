---
{
  "id": "room-h-c5-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "bed_capacity": 0,
  "title": "ベルンハルトの家／2階 家族の階段",
  "room_name": "2階 家族の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "ベルンハルト",
    "モニカ",
    "トビアス"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
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
          "activity": "住まいへ上がる階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベルンハルト"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        11
      ],
      "width_cells": 2,
      "target": "room-h-c5-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c5-lower-stairs",
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
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
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
      "#SS..D",
      "#SS..D",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
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
# ベルンハルトの家／2階 家族の階段

## 用途と暮らし

[[building-h-c5]] の平面案に属する。共用廊下と三人の私室・家庭につなぐ。仕事の袋と継ぎ竿を階段へ積まない。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
#SS..D
#SS..D
#....#
#....#
#....#
#....#
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
