---
{
  "id": "room-smithy-lower-stairs",
  "kind": "rooms",
  "title": "ギュンターの鍛冶場／1階 共用階段",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-smithy",
  "bed_capacity": 0,
  "occupants": [
    "ギュンター",
    "ペーター"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "共用階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        15
      ],
      "width_cells": 2,
      "target": "room-smithy-household",
      "target_door": [
        0,
        3
      ]
    },
    {
      "kind": "stair",
      "target": "room-smithy-upper-stairs",
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
      "name": "共用の直階段",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
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
          "activity": "共用の直階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    }
  ],
  "issues": [
    "火気と炭・火花・熱い加工品、換気と煙突・灰の隔離は未照合",
    "敷地と戸・窓・梁、給排水と便所、仕事と休息・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-smithy",
    "resident-ギュンター"
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
      "######"
    ]
  }
}
---
# ギュンターの鍛冶場／1階 共用階段

## 用途と暮らし

[[building-smithy]] の平面案に属する。家庭の区画から上階へ上がる。客を階段へ通す入口とはせず、火床の物と道具を階段の踊り場へ置かない。

## 現行との差と未解決の条件

現行の奥の相部屋から上階の個室と家庭の区画へ分ける提案であり、描画や日課を切替済みとはしない。建物の敷地、火と煙・灰と家庭の分離、戸の開閉と視線・音、衣服と寝具の手入れ、体の高さと姿勢を引き続き照合する。

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
######
```
