---
{
  "id": "room-h-m2-2",
  "kind": "rooms",
  "title": "アガーテのろうそく屋／2階 家庭の台所と食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "floor": 1,
  "room_name": "2階 家庭の台所と食事",
  "use": "台所",
  "occupants": [
    "アガーテ",
    "ジーモン",
    "フェリックス"
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
      "target": "room-h-m2-upper-hall",
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "name": "アガーテの椅子",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "アガーテの椅子を使う",
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
      "name": "ジーモンの椅子",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "ジーモンの椅子を使う",
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
      "name": "フェリックスの椅子",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "フェリックスの椅子を使う",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-アガーテ",
        "chair": "B"
      },
      {
        "resident": "resident-ジーモン",
        "chair": "C"
      },
      {
        "resident": "resident-フェリックス",
        "chair": "E"
      }
    ]
  }
}
---
# アガーテのろうそく屋／2階 家庭の台所と食事

## 用途と暮らし

[[building-h-m2]] の平面案に属する。家庭の調理と食材・洗い物、家族三人の食事の席を持つ。仕事の鍋と洗い道具を家庭の食器と共用しない。現行の地上階から上階へ移す提案で、給水と食材の運搬・汚水は未照合である。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
