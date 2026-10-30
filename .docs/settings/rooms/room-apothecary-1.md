---
{
  "id": "room-apothecary-1",
  "kind": "rooms",
  "title": "イルムガルトの薬屋／1階 店先と受渡し",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "floor": 0,
  "room_name": "1階 店先と受渡し",
  "use": "店",
  "occupants": [
    "イルムガルト",
    "エーファ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD####",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.....RRR.#",
      "D.....RRR.#",
      "D.....RRR.#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........D",
      "#.........D",
      "#.........D",
      "#.........#",
      "#LLL......#",
      "#LLL......#",
      "#LLL......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    },
    {
      "kind": "door",
      "door": [
        0,
        10
      ],
      "width_cells": 2,
      "target": "room-apothecary-lower-stairs",
      "target_door": [
        5,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        15
      ],
      "width_cells": 3,
      "target": "room-apothecary-2",
      "target_door": [
        0,
        15
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "完成した薬の棚",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        1,
        3,
        4
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "完成した薬の棚を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
    },
    {
      "symbol": "B",
      "name": "包みと薬瓶の棚",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        7,
        1,
        3,
        4
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "包みと薬瓶の棚を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "R",
      "name": "薬と代金の受渡し台",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        6,
        9,
        3,
        3
      ],
      "access": [
        [
          5,
          9
        ],
        [
          7,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "薬と代金の受渡し台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        },
        {
          "activity": "客が薬を受け取る",
          "rect": [
            6,
            12,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "注文と処方の帳面台",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        19,
        3,
        3
      ],
      "access": [
        [
          4,
          19
        ]
      ],
      "use_space": [
        {
          "activity": "注文と処方の帳面台を使う",
          "rect": [
            4,
            19,
            2,
            2
          ]
        }
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
  "origin": [
    5,
    0
  ]
}
---
# イルムガルトの薬屋／1階 店先と受渡し

## 用途と暮らし

[[building-apothecary]] の平面案に属する。完成した薬と包み・薬瓶、受渡しと注文の帳面を分ける。患者を治療する寝台や本人の家庭の食卓を店先へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####DD####
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#.........#
#.........#
#.....RRR.#
D.....RRR.#
D.....RRR.#
#.........#
#.........#
#.........#
#.........D
#.........D
#.........D
#.........#
#LLL......#
#LLL......#
#LLL......#
#.........#
#.........#
#.........#
###########
```
