---
{
  "id": "room-h-g4-1",
  "kind": "rooms",
  "title": "ファルクの家／2階 家庭の台所と食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "floor": 1,
  "room_name": "家庭の台所と食事",
  "use": "台所",
  "occupants": [
    "ファルク",
    "ブリギッテ",
    "ロルフ"
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
      "target": "room-h-g4-upper-hall",
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "name": "ファルクの椅子",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
          "activity": "ファルクの椅子を使う",
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
      "name": "ブリギッテの椅子",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
          "activity": "ブリギッテの椅子を使う",
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
      "name": "ロルフの椅子",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
          "activity": "ロルフの椅子を使う",
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
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g4",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ファルク",
        "chair": "B"
      },
      {
        "resident": "resident-ブリギッテ",
        "chair": "C"
      },
      {
        "resident": "resident-ロルフ",
        "chair": "E"
      }
    ]
  }
}
---
# ファルクの家／2階 家庭の台所と食事

## 用途と暮らし

[[building-h-g4]] の平面案に属する。家庭の下ごしらえと調理・食材と食器・洗い物、家族三人の食事の席を持つ。燻製と獲物の仕事の容器を家庭の食器の代用にしない。現行の地上階から上階へ移す案で、食材と給水の運搬・汚水は未照合である。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
