---
{
  "id": "room-buyer-household",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "bed_capacity": 0,
  "title": "ラインホルトの買取所／2階 家庭の台所と食事",
  "room_name": "2階 家庭の台所と食事",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    15
  ],
  "use": "生活",
  "occupants": [
    "ラインホルト",
    "カスパー"
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "ラインホルト",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。ラインホルトが手入れする案",
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
      ],
      "maintainers": [
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
      ],
      "maintainers": [
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "W",
      "name": "身支度と食器の洗い台",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
      ],
      "maintainers": [
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
      ],
      "maintainers": [
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "B",
      "name": "ラインホルトの椅子",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
      "role": "seat",
      "maintainers": [
        "resident-ラインホルト"
      ]
    },
    {
      "symbol": "C",
      "name": "カスパーの椅子",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
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
      "role": "seat",
      "maintainers": [
        "resident-ラインホルト"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-buyer-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "private_for": [
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########DD#########",
      "#KKK..OO....NNN.....#",
      "#KKK..OO....NNN.....#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#........BTTTC......#",
      "#WWW......TTT.......#",
      "#WWW................#",
      "#####################"
    ]
  },
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ラインホルト",
        "chair": "B"
      },
      {
        "resident": "resident-カスパー",
        "chair": "C"
      }
    ]
  }
}
---
# ラインホルトの買取所／2階 家庭の台所と食事

## 用途と暮らし

[[building-buyer]] の平面案に属する。祖父と孫の家庭の下ごしらえと調理・洗い物・食材、二人の食事の席を持つ。買い取った素材の仕分けを食卓の用途へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#KKK..OO....NNN.....#
#KKK..OO....NNN.....#
#...................#
#...................#
#...................#
#...................#
#........BTTTC......#
#WWW......TTT.......#
#WWW................#
#####################
```
