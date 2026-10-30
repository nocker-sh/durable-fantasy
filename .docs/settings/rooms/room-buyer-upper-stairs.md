---
{
  "id": "room-buyer-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "bed_capacity": 0,
  "title": "ラインホルトの買取所／2階 住人の階段",
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
    "ラインホルト",
    "カスパー"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "ラインホルト",
      "source": "町の木工所で製作しラインホルトが手入れする案",
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
        "resident-ラインホルト"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        12
      ],
      "width_cells": 2,
      "target": "room-buyer-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-buyer-lower-stairs",
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
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "private_for": [
    "resident-ラインホルト",
    "resident-カスパー"
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
      "#SS..D",
      "#....D",
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
# ラインホルトの買取所／2階 住人の階段

## 用途と暮らし

[[building-buyer]] の平面案に属する。共用廊下から二人の個室と家庭へ行く。手摺を使う姿勢と荷、灯りと段差は未照合である。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
#SS..D
#....D
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
