---
{
  "id": "room-apothecary-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "bed_capacity": 0,
  "title": "イルムガルトの薬屋／2階 住人の階段",
  "room_name": "2階 住人の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "イルムガルト",
    "エーファ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "イルムガルト",
      "source": "町の木工所で製作しイルムガルトが手入れする案",
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
        "resident-イルムガルト"
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
      "target": "room-apothecary-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-apothecary-lower-stairs",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "薬草と薬の保管条件・乾燥と調合の衛生、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-apothecary",
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "private_for": [
    "resident-イルムガルト",
    "resident-エーファ"
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
# イルムガルトの薬屋／2階 住人の階段

## 用途と暮らし

[[building-apothecary]] の平面案に属する。寝室と家庭・乾燥部屋へつながる共用階段とする。手入れ用具と荷を階段の上へ積まない。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
