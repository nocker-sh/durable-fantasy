---
{
  "id": "room-warehouse-1",
  "kind": "rooms",
  "title": "町の倉庫／1階 預かりの受付",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-warehouse",
  "floor": 0,
  "room_name": "1階 預かりの受付",
  "use": "店",
  "occupants": [
    "ヒルデ",
    "ゲオルク"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD####",
      "#LLL......#",
      "#LLL......#",
      "#.........#",
      "#.........#",
      "#RRR......#",
      "#RRR......#",
      "#RRR......#",
      "#.........#",
      "#.....TTT.#",
      "D.....TTT.#",
      "D.....TTT.#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........D",
      "#.........D",
      "#.........D",
      "#.........#",
      "#QQQ......#",
      "#QQQ......#",
      "#QQQ......#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target": "map-phanthiet-gate"
    },
    {
      "kind": "door",
      "door": [
        0,
        10
      ],
      "width_cells": 2,
      "target": "room-warehouse-lower-stairs",
      "target_door": [
        5,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        15
      ],
      "width_cells": 3,
      "target": "room-warehouse-2",
      "target_door": [
        0,
        15
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "預かり証と帳簿の台",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        5,
        3,
        3
      ],
      "access": [
        [
          4,
          5
        ],
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "預かり証と帳簿の台を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        },
        {
          "activity": "客が預かり証を確認する",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "閉じた帳簿と預かり証の棚",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "閉じた帳簿と預かり証の棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "受取りと返却を確かめる仮置台",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        6,
        9,
        3,
        3
      ],
      "access": [
        [
          5,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "受取りと返却を確かめる仮置台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "包み直しの布と紐の棚",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        19,
        3,
        3
      ],
      "access": [
        [
          4,
          19
        ]
      ],
      "use_space": [
        {
          "activity": "包み直しの布と紐の棚を使う",
          "rect": [
            4,
            19,
            2,
            2
          ]
        }
      ]
    }
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
  "origin": [
    5,
    0
  ]
}
---
# 町の倉庫／1階 預かりの受付

## 用途と暮らし

[[building-warehouse]] の平面案に属する。客と預かり証・荷を照合する。帳簿と包み直しの道具を区別し、受取りと返却の仮置台を持つ。荷を持った客と二人の同時作業の余裕は未照合である。

## 未解決の条件

戸と窓・視線と音、荷と身体の操作、給排水と便所・火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####DD####
#LLL......#
#LLL......#
#.........#
#.........#
#RRR......#
#RRR......#
#RRR......#
#.........#
#.....TTT.#
D.....TTT.#
D.....TTT.#
#.........#
#.........#
#.........#
#.........D
#.........D
#.........D
#.........#
#QQQ......#
#QQQ......#
#QQQ......#
#.........#
###########
```
