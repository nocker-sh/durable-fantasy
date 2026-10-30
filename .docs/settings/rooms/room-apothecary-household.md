---
{
  "id": "room-apothecary-household",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "bed_capacity": 0,
  "title": "イルムガルトの薬屋／2階 家庭の台所と食事",
  "room_name": "2階 家庭の台所と食事",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "イルムガルト",
    "エーファ"
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
      "owner": "イルムガルト",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
      "name": "二人の食卓",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        4,
        5,
        3,
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
          "activity": "二人の食卓を使う",
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
        "C"
      ]
    },
    {
      "symbol": "B",
      "name": "イルムガルトの椅子",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
          "activity": "イルムガルトの椅子を使う",
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
      "name": "エーファの椅子",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
          "activity": "エーファの椅子を使う",
          "rect": [
            8,
            4,
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
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-apothecary-upper-hall",
      "target_door": [
        4,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "薬草と薬の保管条件・乾燥と調合の衛生、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-apothecary",
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "private_for": [
    "resident-イルムガルト",
    "resident-エーファ"
  ],
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
      "#.........#",
      "#.........#",
      "#.........#",
      "#NN....WW.#",
      "#NN....WW.#",
      "###########"
    ]
  },
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-イルムガルト",
        "chair": "B"
      },
      {
        "resident": "resident-エーファ",
        "chair": "C"
      }
    ]
  }
}
---
# イルムガルトの薬屋／2階 家庭の台所と食事

## 用途と暮らし

[[building-apothecary]] の平面案に属する。師匠と住み込みの弟子の家庭の食材、調理と洗い物、二人の食事の席を持つ。薬草や薬瓶を食材や食器と混ぜない。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#KK....OO.#
#KK....OO.#
#.........#
#.........#
#..BTTTC..#
#.........#
#.........#
#.........#
#NN....WW.#
#NN....WW.#
###########
```
