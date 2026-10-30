---
{
  "id": "room-crystal-1",
  "kind": "rooms",
  "title": "コンスタンティンの結晶屋／1階 陳列と計量",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-crystal",
  "floor": 0,
  "room_name": "陳列と計量",
  "use": "店",
  "occupants": [
    "コンスタンティン"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#...........D",
      "#.....EEE...D",
      "D.....EEE...#",
      "D...........#",
      "#...........#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "######DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        6,
        12
      ],
      "width_cells": 2,
      "target": "room-crystal-2",
      "target_door": [
        6,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        12,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    },
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-crystal-lower-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "鍵付きの結晶の陳列棚甲",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "鍵付きの結晶の陳列棚甲を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "B",
      "name": "鍵付きの結晶の陳列棚乙",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        9,
        1,
        3,
        3
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "鍵付きの結晶の陳列棚乙を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "E",
      "name": "天秤を置く計量台",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        6,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "天秤を置く計量台を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "C",
      "name": "品を包む材料の棚",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        1,
        9,
        3,
        3
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "品を包む材料の棚を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "R",
      "name": "結晶と代金の受渡し台",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        9,
        9,
        3,
        3
      ],
      "access": [
        [
          8,
          9
        ],
        [
          10,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "結晶と代金の受渡し台を使う",
          "rect": [
            7,
            9,
            2,
            2
          ]
        },
        {
          "activity": "結晶と代金の受渡し台を使う",
          "rect": [
            9,
            7,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-crystal",
    "resident-コンスタンティン"
  ],
  "origin": [
    5,
    0
  ]
}
---
# コンスタンティンの結晶屋／1階 陳列と計量

## 用途と暮らし

[[building-crystal]] の平面案に属する。仕入れた結晶を陳列し、計量と品の受渡しを行う。陳列ケースの錠と開閉、天秤の水平と明かり、客が同時に来る際の余裕は未照合である。結晶を加工する設備は追加しない。

## 未解決の条件

戸と窓・視線と音、結晶の仕入れと搬送・保管条件、錠と計量・商品の量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#############
#AAA.....BBB#
#AAA.....BBB#
#AAA.....BBB#
#...........D
#.....EEE...D
D.....EEE...#
D...........#
#...........#
#CCC.....RRR#
#CCC.....RRR#
#CCC.....RRR#
######DD#####
```
