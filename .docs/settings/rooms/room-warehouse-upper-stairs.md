---
{
  "id": "room-warehouse-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-warehouse",
  "bed_capacity": 0,
  "title": "町の倉庫／2階 住人の階段",
  "room_name": "2階 住人の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "occupants": [
    "ヒルデ",
    "ゲオルク"
  ],
  "issues": [
    "敷地・道・隣家と地形、戸・窓・梁は未照合",
    "預かり荷の寸法と重量・容量・搬送、給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-warehouse",
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所で製作し二人が手入れする案",
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
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        7
      ],
      "width_cells": 2,
      "target": "room-warehouse-3",
      "target_door": [
        0,
        7
      ]
    },
    {
      "kind": "door",
      "door": [
        5,
        15
      ],
      "width_cells": 2,
      "target": "room-warehouse-household",
      "target_door": [
        0,
        4
      ]
    },
    {
      "kind": "stair",
      "target": "room-warehouse-lower-stairs",
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
  "private_for": [
    "resident-ヒルデ",
    "resident-ゲオルク"
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
      "#SS..D",
      "#SS..D",
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
      "######"
    ]
  }
}
---
# 町の倉庫／2階 住人の階段

## 用途と暮らし

[[building-warehouse]] の平面案に属する。寝室と家庭の台所へ別々に入る。階段と踊り場に預かり荷や家庭の物干しを置かない。

## 未解決の条件

戸と窓・視線と音、荷と身体の操作、給排水と便所・火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
######
#SS..#
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
######
```
