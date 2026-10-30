---
{
  "id": "room-crystal-lower-stairs",
  "kind": "rooms",
  "title": "コンスタンティンの結晶屋／1階 店主の階段",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-crystal",
  "bed_capacity": 0,
  "occupants": [
    "コンスタンティン"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "1階 店主の階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        6
      ],
      "width_cells": 2,
      "target": "room-crystal-1",
      "target_door": [
        0,
        6
      ]
    },
    {
      "kind": "stair",
      "target": "room-crystal-upper-stairs",
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
  "furniture": [
    {
      "symbol": "S",
      "name": "店主が上階へ上がる階段",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
        "resident-コンスタンティン"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-crystal",
    "resident-コンスタンティン"
  ],
  "private_for": [
    "resident-コンスタンティン"
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
# コンスタンティンの結晶屋／1階 店主の階段

## 用途と暮らし

[[building-crystal]] の平面案に属する。本人が店先から住まいへ戻る階段とする。仕入れた結晶と空箱を踊り場へ置かない。

## 未解決の条件

戸と窓・視線と音、結晶の仕入れと搬送・保管条件、錠と計量・商品の量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

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
#....#
#....#
#....#
#....#
#....#
#....#
#....#
######
```
