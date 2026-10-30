---
{
  "id": "room-tavern-2",
  "kind": "rooms",
  "title": "フランツの酒場／1階 台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "floor": 0,
  "room_name": "1階 台所",
  "use": "台所",
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
      "####DD#####",
      "#OOO..KKK.#",
      "#OOO..KKK.#",
      "#OOO......#",
      "#.......WW#",
      "#.......WW#",
      "#...QQ...C#",
      "#NNN.....C#",
      "#NNN.....C#",
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
      "target": "room-tavern-1",
      "target_door": [
        4,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "調理の炉",
      "owner": "フランツの酒場",
      "source": "町の石工が炉体を積み、必要な金具は鍛冶場で製作する案。フランツが手入れする案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          1,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "調理の炉を使う",
          "rect": [
            1,
            4,
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
      "symbol": "K",
      "name": "下ごしらえ台",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        6,
        1,
        3,
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
          "activity": "下ごしらえ台を使う",
          "rect": [
            6,
            3,
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
      "symbol": "W",
      "name": "洗い台と給水の受け",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。フランツが手入れする案",
      "rect": [
        8,
        4,
        2,
        2
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "洗い台と給水の受けを使う",
          "rect": [
            6,
            4,
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
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            4,
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
      "symbol": "C",
      "name": "清潔な食器棚",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        9,
        6,
        1,
        3
      ],
      "access": [
        [
          8,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "清潔な食器棚を使う",
          "rect": [
            7,
            6,
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
      "symbol": "Q",
      "name": "使用済み食器の受け",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        4,
        6,
        2,
        1
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "使用済み食器の受けを使う",
          "rect": [
            4,
            7,
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
    "resident-フランツ"
  ],
  "origin": [
    5,
    14
  ],
  "parallel_use": [
    {
      "activity": "調理と清潔な食器の準備",
      "operations": [
        {
          "resident": "フランツ",
          "furniture": "O",
          "space_index": 0
        },
        {
          "resident": "リリー",
          "furniture": "C",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# フランツの酒場／1階 台所

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込みの寝間の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

材料の受取り・調理・食器の準備を分ける。清潔な器と使用済みの受け、家庭の食材の扱い、給水と汚水、炉の薪と灰、換気と火気、配膳と片付けの順序を引き続き照合する。二人が調理と清潔な器の準備を同時にする場合の通路を平面で照合する。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
####DD#####
#OOO..KKK.#
#OOO..KKK.#
#OOO......#
#.......WW#
#.......WW#
#...QQ...C#
#NNN.....C#
#NNN.....C#
###########
```
