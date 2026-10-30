---
{
  "id": "room-h-c4-1",
  "kind": "rooms",
  "title": "マルクスの家／1階 家庭の台所と四人の食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "floor": 0,
  "room_name": "1階 家庭の台所と四人の食事",
  "use": "台所",
  "occupants": [
    "マルクス",
    "カタリーナ",
    "ダニエル",
    "イダ"
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
      "#..ATTTB..#",
      "#...TTT...#",
      "#...C.E...#",
      "#.........#",
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
      "target": "room-h-c4-entry",
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
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
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
      "owner": "カタリーナ",
      "source": "石工のマルクスが炉体を積み、鍛冶場へ金具を頼む案。家庭の炉として手入れする案",
      "maintainers": [
        "resident-カタリーナ"
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
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
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
          "activity": "家庭の食材棚を使う",
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
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
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
          "activity": "家庭の洗い台を使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "家族四人の食卓",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "家族四人の食卓を使う",
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
      "name": "マルクスの椅子",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "マルクスの椅子を使う",
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
      "name": "カタリーナの椅子",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "カタリーナの椅子を使う",
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
      "name": "ダニエルの椅子",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "ダニエルの椅子を使う",
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
      "name": "イダの椅子",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "イダの椅子を使う",
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
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c4",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-マルクス",
        "chair": "A"
      },
      {
        "resident": "resident-カタリーナ",
        "chair": "B"
      },
      {
        "resident": "resident-ダニエル",
        "chair": "C"
      },
      {
        "resident": "resident-イダ",
        "chair": "E"
      }
    ]
  }
}
---
# マルクスの家／1階 家庭の台所と四人の食事

## 用途と暮らし

[[building-h-c4]] の平面案に属する。家庭の調理と四人の食事、家庭の食材・食器と洗い物を持つ。灰汁の容器と仕事の洗い物を家庭の台所の道具へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#KK....OO.#
#KK....OO.#
#.........#
#.........#
#..ATTTB..#
#...TTT...#
#...C.E...#
#.........#
#.........#
#NN....WW.#
#NN....WW.#
###########
```
