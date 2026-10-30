---
{
  "id": "room-leather-household",
  "kind": "rooms",
  "title": "ルドルフの革工房／2階 台所と食事",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-leather",
  "bed_capacity": 0,
  "occupants": [
    "ルドルフ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
  ],
  "room_name": "2階 台所と食事",
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target": "room-leather-upper-stairs",
      "target_door": [
        5,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
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
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "ルドルフ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。ルドルフが手入れする案",
      "rect": [
        5,
        1,
        2,
        2
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        1,
        6,
        3,
        1
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "T",
      "name": "一人の食卓",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "一人の食卓を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "B"
      ],
      "maintainers": [
        "resident-ルドルフ"
      ],
      "role": "table"
    },
    {
      "symbol": "B",
      "name": "ルドルフの食事の椅子",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        6,
        5,
        1,
        1
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ルドルフの食事の椅子を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ルドルフ"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-leather",
    "resident-ルドルフ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ルドルフ",
        "chair": "B"
      }
    ]
  },
  "private_for": [
    "resident-ルドルフ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#KKK.OO..NNN#",
      "#KKK.OO..NNN#",
      "D...........#",
      "D...........#",
      "#.....BTTT..#",
      "#WWW...TTT..#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#############"
    ]
  }
}
---
# ルドルフの革工房／2階 台所と食事

## 用途と暮らし

[[building-leather]] の平面案に属する。本人の食材・下ごしらえ・調理と洗い物、一人の食事の席を持つ。仕事の桶や薬剤を食器と共用しない。上下の部屋を分けただけで臭気と水の衛生が成立したとはしない。

## 未解決の条件

敷地と構造、戸・窓・梁と換気、作業の水と汚れ・薬剤・皮の運搬、給排水と便所・家庭の火、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#############
#KKK.OO..NNN#
#KKK.OO..NNN#
D...........#
D...........#
#.....BTTT..#
#WWW...TTT..#
#...........#
#...........#
#...........#
#############
```
