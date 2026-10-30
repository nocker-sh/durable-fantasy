---
{
  "id": "room-h-g2-2",
  "kind": "rooms",
  "title": "クルトの家／1階 家庭の台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "floor": 0,
  "room_name": "1階 家庭の台所",
  "use": "台所",
  "occupants": [
    "クルト",
    "ザビーネ",
    "ヨハン",
    "リナ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#KKK...OOO#",
      "#KKK...OOO#",
      "D......OOO#",
      "D.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#.........#",
      "#.........#",
      "#NNN...WWW#",
      "#NNN...WWW#",
      "#NNN...WWW#",
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
      "target": "room-h-g2-entry",
      "target_door": [
        14,
        4
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target": "room-h-g2-1",
      "target_door": [
        10,
        3
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
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
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "ザビーネ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。家庭の炉として手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        7,
        1,
        3,
        3
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の煮炊きの炉を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        1,
        9,
        3,
        3
      ],
      "access": [
        [
          4,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            4,
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
      "name": "家庭の食器の洗い台",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        7,
        9,
        3,
        3
      ],
      "access": [
        [
          6,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食器の洗い台を使う",
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
      "symbol": "C",
      "name": "家庭の調理道具の棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        1,
        5,
        3,
        2
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理道具の棚を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "Q",
      "name": "食事を運ぶ前の配膳台",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          6,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "食事を運ぶ前の配膳台を使う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "origin": [
    15,
    14
  ],
  "private_for": [
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ]
}
---
# クルトの家／1階 家庭の台所

## 用途と暮らし

[[building-h-g2]] の平面案に属する。家庭の食材と下ごしらえ・炉・配膳、家庭の食器の洗いと道具を持つ。研ぎの水と仕事の鍋を家庭の食器と共用しない。炉から居間へ暖かさをどう送るかは戸と間仕切りの立体で照合する。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#KKK...OOO#
#KKK...OOO#
D......OOO#
D.........#
#CCC...QQQ#
#CCC...QQQ#
#.........#
#.........#
#NNN...WWW#
#NNN...WWW#
#NNN...WWW#
###########
```
