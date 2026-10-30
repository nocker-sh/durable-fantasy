---
{
  "id": "room-tavern-1",
  "kind": "rooms",
  "title": "フランツの酒場／1階 酒場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "floor": 0,
  "room_name": "1階 酒場",
  "use": "食事",
  "occupants": [
    "フランツ",
    "リリー",
    "マックス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "D.................HH#",
      "D.................HH#",
      "#....C.......G....HH#",
      "#..ATTTB...EUUUF....#",
      "#...TTT.....UUU.....#",
      "#...................#",
      "#.................RR#",
      "#.................RR#",
      "#....K.......P....RR#",
      "#..IVVVJ...MWWWN..RR#",
      "#...VVV.....WWW...RR#",
      "#...................D",
      "#...................D",
      "####DD########DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-tavern-lower-stairs",
      "target_door": [
        5,
        1
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-tavern-2",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        14
      ],
      "width_cells": 2,
      "target": "room-tavern-4",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        20,
        12
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "T",
      "name": "客の卓T",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        4,
        4,
        3,
        2
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "客の卓Tを使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C"
      ],
      "maintainers": [
        "resident-フランツ"
      ],
      "role": "table"
    },
    {
      "symbol": "A",
      "name": "客席A",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        3,
        4,
        1,
        1
      ],
      "access": [
        [
          2,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "客席Aを使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "B",
      "name": "客席B",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        7,
        4,
        1,
        1
      ],
      "access": [
        [
          8,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "客席Bを使う",
          "rect": [
            8,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "C",
      "name": "客席C",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        5,
        3,
        1,
        1
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "客席Cを使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "U",
      "name": "客の卓U",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        12,
        4,
        3,
        2
      ],
      "access": [
        [
          13,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "客の卓Uを使う",
          "rect": [
            12,
            6,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "E",
        "F",
        "G"
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "E",
      "name": "客席E",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        11,
        4,
        1,
        1
      ],
      "access": [
        [
          10,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "客席Eを使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "F",
      "name": "客席F",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        15,
        4,
        1,
        1
      ],
      "access": [
        [
          16,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "客席Fを使う",
          "rect": [
            16,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "G",
      "name": "客席G",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        13,
        3,
        1,
        1
      ],
      "access": [
        [
          13,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "客席Gを使う",
          "rect": [
            12,
            1,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "V",
      "name": "客の卓V",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        4,
        10,
        3,
        2
      ],
      "access": [
        [
          5,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "客の卓Vを使う",
          "rect": [
            4,
            12,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "I",
        "J",
        "K"
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "I",
      "name": "客席I",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        3,
        10,
        1,
        1
      ],
      "access": [
        [
          2,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "客席Iを使う",
          "rect": [
            1,
            9,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "J",
      "name": "客席J",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        7,
        10,
        1,
        1
      ],
      "access": [
        [
          8,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "客席Jを使う",
          "rect": [
            8,
            9,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "K",
      "name": "客席K",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        5,
        9,
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
          "activity": "客席Kを使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "W",
      "name": "客の卓W",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        12,
        10,
        3,
        2
      ],
      "access": [
        [
          13,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "客の卓Wを使う",
          "rect": [
            12,
            12,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "M",
        "N",
        "P"
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "M",
      "name": "客席M",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        11,
        10,
        1,
        1
      ],
      "access": [
        [
          10,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "客席Mを使う",
          "rect": [
            9,
            9,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "N",
      "name": "客席N",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        15,
        10,
        1,
        1
      ],
      "access": [
        [
          16,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "客席Nを使う",
          "rect": [
            16,
            9,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "P",
      "name": "客席P",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        13,
        9,
        1,
        1
      ],
      "access": [
        [
          13,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "客席Pを使う",
          "rect": [
            12,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "R",
      "name": "給仕のカウンター",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        18,
        7,
        2,
        5
      ],
      "access": [
        [
          17,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "給仕のカウンターを使う",
          "rect": [
            16,
            7,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "H",
      "name": "暖房の炉",
      "owner": "フランツの酒場",
      "source": "町の石工が炉体を積み、必要な金具は鍛冶場で製作する案。フランツが手入れする案",
      "rect": [
        18,
        1,
        2,
        3
      ],
      "access": [
        [
          17,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "暖房の炉を使う",
          "rect": [
            16,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-tavern",
    "resident-フランツ",
    "resident-リリー",
    "resident-マックス"
  ],
  "origin": [
    5,
    0
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-フランツ",
        "chair": "A"
      },
      {
        "resident": "resident-リリー",
        "chair": "B"
      },
      {
        "resident": "resident-マックス",
        "chair": "C"
      }
    ]
  }
}
---
# フランツの酒場／1階 酒場

## 用途と配置

[[building-tavern]] の平面案に属する。共用の動線と私室を分け、家具と使う身体を平面へ配置する。客席は世帯が営業外に食事をする席も持つが、客と世帯の席を同時に二重計上しない。

## 未解決の生活

十二席は実際の椅子として配置し、三人の食事は営業外に同じ卓を使う案とする。客と働き手の利用時間、給仕と樽・食器の受渡し、暖房と煙・灰、客の便所と混雑時の退避は未照合である。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
#####################
D.................HH#
D.................HH#
#....C.......G....HH#
#..ATTTB...EUUUF....#
#...TTT.....UUU.....#
#...................#
#.................RR#
#.................RR#
#....K.......P....RR#
#..IVVVJ...MWWWN..RR#
#...VVV.....WWW...RR#
#...................D
#...................D
####DD########DD#####
```
