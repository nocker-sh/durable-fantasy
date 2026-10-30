---
{
  "id": "room-guardhouse-2",
  "kind": "rooms",
  "title": "門の詰所／1階 家庭の台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "floor": 0,
  "room_name": "1階 家庭の台所",
  "use": "台所",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
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
      "target": "room-guardhouse-entry",
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
      "target": "room-guardhouse-dining",
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。家庭の炉として四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "origin": [
    15,
    14
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ]
}
---
# 門の詰所／1階 家庭の台所

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。四人の家庭の食材と調理・配膳・食器の洗いを持つ。勤務の道具と街灯の油の容器を調理と食器へ共用しない。食事の部屋と直通の戸でつなぐ。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

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
