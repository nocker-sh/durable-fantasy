---
{
  "id": "room-h3-2",
  "kind": "rooms",
  "title": "ヤコブとエルザの家／1階 台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h3",
  "floor": 0,
  "room_name": "台所",
  "use": "台所",
  "occupants": [
    "ヤコブ",
    "エルザ",
    "パウル",
    "レナ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########",
      "#FF.KKWOO#",
      "#......OO#",
      "D........#",
      "D...A....#",
      "#...TTB..#",
      "#..JTT...#",
      "#....C...#",
      "#.......Q#",
      "#........#",
      "#####DD###"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h3-1",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target_door": [
        6,
        3
      ]
    },
    {
      "kind": "door",
      "target": "room-h3-4",
      "door": [
        5,
        10
      ],
      "width_cells": 2,
      "target_door": [
        5,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "調理の炉",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "調理の炉を使う",
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
      "symbol": "K",
      "name": "家庭の調理台",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        4,
        1,
        2,
        1
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "調理台を使う",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "蓋付き飲用水甕",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        6,
        1,
        1,
        1
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "蓋付き飲用水甕を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "四人の食卓",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        4,
        5,
        2,
        2
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "四人の食卓を使う",
          "rect": [
            6,
            6,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C",
        "J"
      ],
      "role": "table"
    },
    {
      "symbol": "A",
      "name": "ヤコブの椅子",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        4,
        4,
        1,
        1
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "ヤコブの椅子を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "エルザの椅子",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        6,
        5,
        1,
        1
      ],
      "access": [
        [
          7,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "エルザの椅子を使う",
          "rect": [
            7,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "パウルの椅子",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        5,
        7,
        1,
        1
      ],
      "access": [
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "パウルの椅子を使う",
          "rect": [
            6,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "J",
      "name": "レナの椅子",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        3,
        6,
        1,
        1
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "レナの椅子を使う",
          "rect": [
            2,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "F",
      "name": "家庭の穀物と器の棚",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          1,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食材と器を出し入れする",
          "rect": [
            1,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "蓋付き洗い水受け",
      "owner": "ヤコブとエルザの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        8,
        8,
        1,
        1
      ],
      "access": [
        [
          7,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "蓋付き洗い水受けを使う",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "design_dependencies": [
    "building-h3",
    "resident-ヤコブ",
    "resident-エルザ",
    "resident-パウル",
    "resident-レナ"
  ],
  "origin": [
    6,
    0
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ヤコブ",
        "chair": "A"
      },
      {
        "resident": "resident-エルザ",
        "chair": "B"
      },
      {
        "resident": "resident-パウル",
        "chair": "C"
      },
      {
        "resident": "resident-レナ",
        "chair": "J"
      }
    ]
  }
}
---
# ヤコブとエルザの家／1階 台所

## 四人の食事と清潔な調理

ヤコブ、エルザ、パウル、レナが同じ食卓で食べる。四脚を食卓の四辺に配し、家族の席を一人ずつ持つ。売る魚の在庫と家で食べる食材は分け、魚を持ち帰るときも蓋付きの容器から調理台へ移す。

飲用水は井戸から家族が運び、汚れた桶とは別の蓋付き甕で保管する。炉と調理台を北側へ置き、子どもの寝床へ灰や薪を運び込まない。洗い水は西南の受けに集め、川や井戸への直流しを決めない。搬出先と運ぶ容器は未解決である。南の戸は子どもの寝間だけへ通じ、両親の寝室への通り道にしない。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
##########
#FF.KKWOO#
#......OO#
D........#
D...A....#
#...TTB..#
#..JTT...#
#....C...#
#.......Q#
#........#
#####DD###
```
