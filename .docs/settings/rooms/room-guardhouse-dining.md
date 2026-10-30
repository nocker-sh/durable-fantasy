---
{
  "id": "room-guardhouse-dining",
  "kind": "rooms",
  "title": "門の詰所／1階 四人の食事と休息",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "floor": 0,
  "room_name": "四人の食事と休息",
  "use": "食事",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#HH....FF.#",
      "#HH....FF.#",
      "#.........D",
      "#.........D",
      "#..ATTTB..#",
      "#...TTT...#",
      "#...C.E...#",
      "#.........#",
      "#.........#",
      "#LL....RR.#",
      "#LL....RR.#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-guardhouse-entry",
      "target_door": [
        4,
        4
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        3
      ],
      "width_cells": 2,
      "target": "room-guardhouse-2",
      "target_door": [
        0,
        3
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "休むときの外套と膝掛けの受け",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "休むときの外套と膝掛けの受けを使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "F",
      "name": "四人の身の回りの棚",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "四人の身の回りの棚を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "L",
      "name": "家庭の布の棚",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        1,
        10,
        2,
        2
      ],
      "access": [
        [
          3,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の布の棚を使う",
          "rect": [
            3,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "R",
      "name": "四人の茶椀と食卓の物の棚",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        7,
        10,
        2,
        2
      ],
      "access": [
        [
          6,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "四人の茶椀と食卓の物の棚を使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "T",
      "name": "四人の食卓",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        4,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "四人の食卓を使う",
          "rect": [
            4,
            3,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "A",
        "B",
        "C",
        "E"
      ]
    },
    {
      "symbol": "A",
      "name": "オイゲンの椅子",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        3,
        5,
        1,
        1
      ],
      "access": [
        [
          2,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "オイゲンの椅子を使う",
          "rect": [
            1,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "ディーターの椅子",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        7,
        5,
        1,
        1
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ディーターの椅子を使う",
          "rect": [
            8,
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
      "name": "シュテファンの椅子",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        4,
        7,
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
          "activity": "シュテファンの椅子を使う",
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
      "symbol": "E",
      "name": "ヴェロニカの椅子",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        6,
        7,
        1,
        1
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ヴェロニカの椅子を使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-オイゲン",
        "chair": "A"
      },
      {
        "resident": "resident-ディーター",
        "chair": "B"
      },
      {
        "resident": "resident-シュテファン",
        "chair": "C"
      },
      {
        "resident": "resident-ヴェロニカ",
        "chair": "E"
      }
    ]
  },
  "meal_service": {
    "mode": "staggered",
    "routine_source": "world/town/routines.ts"
  }
}
---
# 門の詰所／1階 四人の食事と休息

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。四人それぞれの食事の席と共用の食器・布を持つ。交代で食べる案であり、四人が同時に警備を離れることを前提にしない。誰がいつ調理と片付けを行うかは勤務と睡眠を含めて未照合である。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#HH....FF.#
#HH....FF.#
#.........D
#.........D
#..ATTTB..#
#...TTT...#
#...C.E...#
#.........#
#.........#
#LL....RR.#
#LL....RR.#
###########
```
