---
{
  "id": "room-warehouse-2",
  "kind": "rooms",
  "title": "町の倉庫／1階 預かり荷の保管",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-warehouse",
  "floor": 0,
  "room_name": "1階 預かり荷の保管",
  "use": "貯蔵",
  "occupants": [
    "ヒルデ",
    "ゲオルク"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........D",
      "#.........D",
      "#.........D",
      "#.........D",
      "#.........#",
      "D.........#",
      "D.........#",
      "D.........#",
      "#.........#",
      "#CCC...EEE#",
      "#CCC...EEE#",
      "#CCC...EEE#",
      "#CCC...EEE#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        15
      ],
      "width_cells": 3,
      "target": "room-warehouse-1",
      "target_door": [
        10,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        10
      ],
      "width_cells": 4,
      "target": "map-phanthiet-gate"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "預かり荷の区画甲",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        1,
        3,
        5
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "預かり荷の区画甲を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "B",
      "name": "預かり荷の区画乙",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        7,
        1,
        3,
        5
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "預かり荷の区画乙を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "C",
      "name": "預かり荷の区画丙",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        19,
        3,
        4
      ],
      "access": [
        [
          4,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "預かり荷の区画丙を使う",
          "rect": [
            4,
            20,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "E",
      "name": "預かり荷の区画丁",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        7,
        19,
        3,
        4
      ],
      "access": [
        [
          6,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "預かり荷の区画丁を使う",
          "rect": [
            5,
            20,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
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
    15,
    0
  ],
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "預かり証に対応する乾いた包み・箱（受入寸法と重量は未確定）",
      "handler": "resident-ゲオルク"
    },
    {
      "furniture": "B",
      "contents": "預かり証に対応する乾いた包み・箱（受入寸法と重量は未確定）",
      "handler": "resident-ゲオルク"
    },
    {
      "furniture": "C",
      "contents": "預かり証に対応する乾いた包み・箱（受入寸法と重量は未確定）",
      "handler": "resident-ゲオルク"
    },
    {
      "furniture": "E",
      "contents": "預かり証に対応する乾いた包み・箱（受入寸法と重量は未確定）",
      "handler": "resident-ゲオルク"
    }
  ]
}
---
# 町の倉庫／1階 預かり荷の保管

## 用途と暮らし

[[building-warehouse]] の平面案に属する。預かり荷を識別した区画へ置き、地上階の専用の搬入口から運ぶ。通路と取出し面を荷の置場へ転用しない。食品・液体・燃料などの受入条件は未確定で、同じ保管条件で扱えるとしない。

## 未解決の条件

戸と窓・視線と音、荷と身体の操作、給排水と便所・火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#.........#
#.........#
#.........D
#.........D
#.........D
#.........D
#.........#
D.........#
D.........#
D.........#
#.........#
#CCC...EEE#
#CCC...EEE#
#CCC...EEE#
#CCC...EEE#
###########
```
