---
{
  "id": "room-warehouse-household",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-warehouse",
  "bed_capacity": 0,
  "title": "町の倉庫／2階 家庭の台所と食事",
  "room_name": "2階 家庭の台所と食事",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
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
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
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
          1,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の下ごしらえ台を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        6,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の煮炊きの炉を使う",
          "rect": [
            6,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        12,
        1,
        3,
        2
      ],
      "access": [
        [
          12,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            12,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "身支度と食器の洗い台",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        1,
        8,
        3,
        2
      ],
      "access": [
        [
          4,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "身支度と食器の洗い台を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        10,
        7,
        3,
        2
      ],
      "access": [
        [
          10,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "二人の食卓を使う",
          "rect": [
            10,
            5,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "B",
        "C"
      ]
    },
    {
      "symbol": "B",
      "name": "ヒルデの椅子",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        9,
        7,
        1,
        1
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ヒルデの椅子を使う",
          "rect": [
            7,
            6,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "ゲオルクの椅子",
      "owner": "ヒルデとゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        13,
        7,
        1,
        1
      ],
      "access": [
        [
          14,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ゲオルクの椅子を使う",
          "rect": [
            14,
            6,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        4
      ],
      "width_cells": 2,
      "target": "room-warehouse-upper-stairs",
      "target_door": [
        5,
        15
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
      "#####################",
      "#KKK..OO....NNN.....#",
      "#KKK..OO....NNN.....#",
      "#...................#",
      "D...................#",
      "D...................#",
      "#...................#",
      "#........BTTTC......#",
      "#WWW......TTT.......#",
      "#WWW................#",
      "#...................#",
      "#...................#",
      "#####################"
    ]
  },
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ヒルデ",
        "chair": "B"
      },
      {
        "resident": "resident-ゲオルク",
        "chair": "C"
      }
    ]
  }
}
---
# 町の倉庫／2階 家庭の台所と食事

## 用途と暮らし

[[building-warehouse]] の平面案に属する。二人の調理・洗い物・食材と食事の席を持つ。顧客の預かり荷を食卓や食材棚へ置かない。火と煙、飲用水と汚水を上階でどう扱うかは未照合である。

## 未解決の条件

戸と窓・視線と音、荷と身体の操作、給排水と便所・火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####################
#KKK..OO....NNN.....#
#KKK..OO....NNN.....#
#...................#
D...................#
D...................#
#...................#
#........BTTTC......#
#WWW......TTT.......#
#WWW................#
#...................#
#...................#
#####################
```
