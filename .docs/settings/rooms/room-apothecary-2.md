---
{
  "id": "room-apothecary-2",
  "kind": "rooms",
  "title": "イルムガルトの薬屋／1階 調合と道具の手入れ",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "floor": 0,
  "room_name": "1階 調合と道具の手入れ",
  "use": "作業",
  "occupants": [
    "イルムガルト",
    "エーファ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#WWW......#",
      "#WWW......#",
      "#.....TTT.#",
      "#.....TTT.D",
      "#.....TTT.D",
      "#.........D",
      "#.........D",
      "#.........#",
      "D.........#",
      "D.........#",
      "D.........#",
      "#.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        15
      ],
      "width_cells": 3,
      "target": "room-apothecary-1",
      "target_door": [
        10,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        10
      ],
      "width_cells": 4,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "仕入れた薬草と材料の棚",
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
          "activity": "仕入れた薬草と材料の棚を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "B",
      "name": "清潔な瓶と調合道具の棚",
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
          "activity": "清潔な瓶と調合道具の棚を使う",
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
      "symbol": "W",
      "name": "仕事用の道具の洗い台",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          1,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "仕事用の道具の洗い台を使う",
          "rect": [
            1,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "薬を量り混ぜる調合台",
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
        ]
      ],
      "use_space": [
        {
          "activity": "薬を量り混ぜる調合台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "調合中の薬の受け",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        19,
        3,
        4
      ],
      "access": [
        [
          4,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "調合中の薬の受けを使う",
          "rect": [
            4,
            20,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "使用後の道具と廃物の受け",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        7,
        19,
        3,
        4
      ],
      "access": [
        [
          6,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "使用後の道具と廃物の受けを使う",
          "rect": [
            5,
            20,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
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
    15,
    0
  ],
  "private_for": [
    "resident-イルムガルト",
    "resident-エーファ"
  ]
}
---
# イルムガルトの薬屋／1階 調合と道具の手入れ

## 用途と暮らし

[[building-apothecary]] の平面案に属する。材料と清潔な道具、計量と混合、仕事の洗い台、調合中と使用後を区別する。家庭の食器と仕事の洗い道具を共用しない。加熱する加工はコードが定める設備に従い、家庭の炉を調合の代用にしない。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#WWW......#
#WWW......#
#.....TTT.#
#.....TTT.D
#.....TTT.D
#.........D
#.........D
#.........#
D.........#
D.........#
D.........#
#.........#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
#.........#
#.........#
###########
```
