---
{
  "id": "room-h-g5-2",
  "kind": "rooms",
  "title": "クリスティアンの家／1階 家庭の台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "floor": 0,
  "room_name": "1階 家庭の台所",
  "use": "台所",
  "occupants": [
    "クリスティアン",
    "ドロテア",
    "ラウラ",
    "ベンヤミン"
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
      "target": "room-h-g5-entry",
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
      "target": "room-h-g5-1",
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。家庭の炉として手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "origin": [
    15,
    14
  ],
  "private_for": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ]
}
---
# クリスティアンの家／1階 家庭の台所

## 用途と暮らし

[[building-h-g5]] の平面案に属する。家庭の食材と下ごしらえ・炉と配膳・食器の洗いと道具を持つ。仕事の布と持ち帰った物の洗いを家庭の食器と共用しない。居間への配膳と暖かさの伝わり方は戸と間仕切りの立体で照合する。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

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
