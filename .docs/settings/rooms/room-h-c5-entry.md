---
{
  "id": "room-h-c5-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "bed_capacity": 0,
  "title": "ベルンハルトの家／1階 家庭の入口と身支度",
  "room_name": "1階 家庭の入口と身支度",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "ベルンハルト",
    "モニカ",
    "トビアス"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "仕事靴の受け",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        1,
        6,
        2,
        3
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "仕事靴の受けを使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "帰宅時の手洗い台",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        7,
        1,
        3,
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
          "activity": "帰宅時の手洗い台を使う",
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
      "symbol": "Q",
      "name": "外套と前掛けの受け",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        7,
        8,
        3,
        2
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "外套と前掛けの受けを使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        11
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c5-2",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-c5-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 2,
      "target": "room-h-c5-processing",
      "target_door": [
        0,
        6
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "D......WWW#",
      "D......WWW#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#RR.......D",
      "#RR.......D",
      "#RR....QQQ#",
      "#......QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# ベルンハルトの家／1階 家庭の入口と身支度

## 用途と暮らし

[[building-h-c5]] の平面案に属する。仕事から戻り、泥と煤・仕事靴と前掛けを受け、手を洗ってから住まいへ上がる。灰の袋の室を家庭の食卓と寝床への通り道にしない。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
D......WWW#
D......WWW#
#.........#
#.........#
#.........#
#RR.......D
#RR.......D
#RR....QQQ#
#......QQQ#
#.........#
####DD#####
```
