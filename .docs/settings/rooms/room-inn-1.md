---
{
  "id": "room-inn-1",
  "kind": "rooms",
  "title": "ゲルダの宿／1階 食堂",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-inn",
  "floor": 0,
  "room_name": "1階 食堂",
  "use": "食事",
  "occupants": [
    "ゲルダ",
    "ニーナ",
    "ゼップ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############DD##",
      "#...............#",
      "#...............#",
      "#......C..E.....#",
      "#....ATTTTTTB...#",
      "D.....TTTTTT....D",
      "D.....TTTTTT....D",
      "#......F..G.....#",
      "#RRR.........HHH#",
      "#RRR.........HHH#",
      "#............HHH#",
      "##########DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        5
      ],
      "width_cells": 2,
      "target": "room-inn-lower-stairs",
      "target_door": [
        5,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        11
      ],
      "width_cells": 2,
      "target": "room-inn-2",
      "target_door": [
        10,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        16,
        5
      ],
      "width_cells": 2,
      "target": "map-phanthiet"
    },
    {
      "kind": "door",
      "door": [
        13,
        0
      ],
      "width_cells": 2,
      "target": "room-inn-drying",
      "target_door": [
        13,
        5
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "T",
      "name": "食卓",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        6,
        4,
        6,
        3
      ],
      "access": [
        [
          9,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "食卓を使う",
          "rect": [
            8,
            7,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C",
        "E",
        "F",
        "G"
      ],
      "maintainers": [
        "resident-ゲルダ"
      ],
      "role": "table"
    },
    {
      "symbol": "A",
      "name": "食卓の椅子A",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        5,
        4,
        1,
        1
      ],
      "access": [
        [
          4,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の椅子Aを使う",
          "rect": [
            3,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "B",
      "name": "食卓の椅子B",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        12,
        4,
        1,
        1
      ],
      "access": [
        [
          13,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の椅子Bを使う",
          "rect": [
            13,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "C",
      "name": "食卓の椅子C",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        7,
        3,
        1,
        1
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の椅子Cを使う",
          "rect": [
            6,
            1,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "E",
      "name": "食卓の椅子E",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        10,
        3,
        1,
        1
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の椅子Eを使う",
          "rect": [
            9,
            1,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "F",
      "name": "食卓の椅子F",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        7,
        7,
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
          "activity": "食卓の椅子Fを使う",
          "rect": [
            6,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "G",
      "name": "食卓の椅子G",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        10,
        7,
        1,
        1
      ],
      "access": [
        [
          10,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の椅子Gを使う",
          "rect": [
            9,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "R",
      "name": "受付と帳面の台",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
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
          "activity": "受付と帳面の台を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "H",
      "name": "暖房の炉",
      "owner": "ゲルダの宿",
      "source": "町の石工が炉体を積み、必要な金具は鍛冶場で製作する案。ゲルダが手入れする案",
      "rect": [
        13,
        8,
        3,
        3
      ],
      "access": [
        [
          12,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "暖房の炉を使う",
          "rect": [
            11,
            9,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-inn",
    "resident-ゲルダ",
    "resident-ニーナ",
    "resident-ゼップ"
  ],
  "origin": [
    5,
    5
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ゲルダ",
        "chair": "A"
      },
      {
        "resident": "resident-ニーナ",
        "chair": "B"
      },
      {
        "resident": "resident-ゼップ",
        "chair": "C"
      }
    ]
  }
}
---
# ゲルダの宿／1階 食堂

## 用途と配置

[[building-inn]] の平面案に属する。西向きの敷地の戸口から受付と食卓へ入り、西の共用階段と南の台所、北の室内干しの部屋へ分けて通す。食卓と六脚の椅子の寸法は維持し、席と受付・暖房の使う側を組み直す。

## 未解決の生活

干す布の量・重さ、掛ける高さと湿気・灰を避ける換気、寝具交換と乾燥の時間は未照合である。木枠の占有を置いたことを、全寝具を毎日乾かせる容量の証明にしない。戸と梁、火と煙、地形と日課、描画は引き続き照合する。

```grid
#############DD##
#...............#
#...............#
#......C..E.....#
#....ATTTTTTB...#
D.....TTTTTT....D
D.....TTTTTT....D
#......F..G.....#
#RRR.........HHH#
#RRR.........HHH#
#............HHH#
##########DD#####
```
