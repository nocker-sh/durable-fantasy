---
{
  "id": "room-tavern-lower-stairs",
  "kind": "rooms",
  "title": "フランツの酒場／1階 共用階段",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "bed_capacity": 0,
  "occupants": [
    "フランツ",
    "リリー",
    "マックス"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "1階 共用階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        1
      ],
      "width_cells": 2,
      "target": "room-tavern-1",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-tavern-upper-stairs",
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
      "name": "上下階の共用階段",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
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
          "activity": "上下階の共用階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-tavern",
    "resident-フランツ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..D",
      "#SS..D",
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
# フランツの酒場／1階 共用階段

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込みの寝間の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

客席の北西の戸から上階へ向かい、台所と酒蔵を通り抜けない。下端の踊り場と手摺・灯り、寝具や私物を持つ姿勢、営業中の客が私室へ入り込まない戸の管理は未照合である。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
######
#SS..D
#SS..D
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
