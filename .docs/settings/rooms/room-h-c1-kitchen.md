---
{
  "id": "room-h-c1-kitchen",
  "kind": "rooms",
  "title": "ハインリヒの窯場／2階 家庭の台所と食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "floor": 1,
  "room_name": "2階 家庭の台所と食事",
  "use": "台所",
  "occupants": [
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#KK....OO.#",
      "#KK....OO.#",
      "#.........#",
      "#.........#",
      "#..BTTTC..#",
      "#...TTT...#",
      "#....E....#",
      "#.........#",
      "#NN....WW.#",
      "#NN....WW.#",
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
      "target": "room-h-c1-upper-hall",
      "target_door": [
        4,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        1,
        1,
        2,
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
      "owner": "ハインリヒ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
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
          "activity": "家庭の煮炊きの炉を使う",
          "rect": [
            7,
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
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        1,
        9,
        2,
        2
      ],
      "access": [
        [
          3,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            3,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        7,
        9,
        2,
        2
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            5,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "家族三人の食卓",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "家族三人の食卓を使う",
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
        "B",
        "C",
        "E"
      ]
    },
    {
      "symbol": "B",
      "name": "ハインリヒの椅子",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "ハインリヒの椅子を使う",
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
      "symbol": "C",
      "name": "テレーゼの椅子",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "テレーゼの椅子を使う",
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
      "symbol": "E",
      "name": "アデーレの椅子",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        5,
        7,
        1,
        1
      ],
      "access": [
        [
          5,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "アデーレの椅子を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ハインリヒ",
        "chair": "B"
      },
      {
        "resident": "resident-テレーゼ",
        "chair": "C"
      },
      {
        "resident": "resident-アデーレ",
        "chair": "E"
      }
    ]
  }
}
---
# ハインリヒの窯場／2階 家庭の台所と食事

## 用途と暮らし

[[building-h-c1]] の平面案に属する。家族三人の家庭の下ごしらえ・調理と洗い物・食材、食事の席を持つ。仕事の釉の甕と水受けを家庭の容器の代用にしない。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#KK....OO.#
#KK....OO.#
#.........#
#.........#
#..BTTTC..#
#...TTT...#
#....E....#
#.........#
#NN....WW.#
#NN....WW.#
###########
```
