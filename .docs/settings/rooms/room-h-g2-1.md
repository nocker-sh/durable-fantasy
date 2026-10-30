---
{
  "id": "room-h-g2-1",
  "kind": "rooms",
  "title": "クルトの家／1階 居間と四人の食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "floor": 0,
  "room_name": "1階 居間と四人の食事",
  "use": "食事",
  "occupants": [
    "クルト",
    "ザビーネ",
    "ヨハン",
    "リナ"
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
      "target": "room-h-g2-entry",
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
      "target": "room-h-g2-2",
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
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
      "name": "家族の身の回りの棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "家族の身の回りの棚を使う",
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
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
      "name": "家族の茶椀と食卓の物の棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "家族の茶椀と食卓の物の棚を使う",
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
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
      "name": "クルトの椅子",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "クルトの椅子を使う",
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
      "name": "ザビーネの椅子",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "ザビーネの椅子を使う",
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
      "name": "ヨハンの椅子",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "ヨハンの椅子を使う",
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
      "name": "リナの椅子",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "リナの椅子を使う",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-クルト",
        "chair": "A"
      },
      {
        "resident": "resident-ザビーネ",
        "chair": "B"
      },
      {
        "resident": "resident-ヨハン",
        "chair": "C"
      },
      {
        "resident": "resident-リナ",
        "chair": "E"
      }
    ]
  }
}
---
# クルトの家／1階 居間と四人の食事

## 用途と暮らし

[[building-h-g2]] の平面案に属する。家族四人の食卓と本人ごとの席、家庭の布と茶椀・身の回りの物を持つ。直通の戸から台所と配膳をつなぎ、修理の鍋と預かった刃物を家庭の食卓へ仮置きしない。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
