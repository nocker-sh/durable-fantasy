---
{
  "id": "room-tavern-upper-stairs",
  "kind": "rooms",
  "title": "フランツの酒場／2階 共用階段",
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
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "2階 共用階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        11
      ],
      "width_cells": 2,
      "target": "room-tavern-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-tavern-lower-stairs",
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
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "上下階の共用階段を使う",
          "rect": [
            3,
            1,
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
      "######"
    ]
  }
}
---
# フランツの酒場／2階 共用階段

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込みの寝間の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

上階の共用廊下へ接続し、寝台や寝具の棚を階段の出入りに重ねない。上端の踊り場と床の開口、手摺・梁と照明、寝具を持つ姿勢と退避の経路を立体で照合する。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

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
######
```
