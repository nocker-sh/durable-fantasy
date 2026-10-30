---
{
  "id": "room-tavern-drying",
  "kind": "rooms",
  "title": "フランツの酒場／2階 室内干しと寝具の手入れ",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "bed_capacity": 0,
  "occupants": [
    "フランツ",
    "リリー",
    "マックス"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    15,
    0
  ],
  "room_name": "2階 室内干しと寝具の手入れ",
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-tavern-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "布を掛ける木枠R",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。リリーが手入れする案",
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "布を掛ける木枠Rを使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack",
      "maintainers": [
        "resident-リリー"
      ]
    },
    {
      "symbol": "T",
      "name": "布を掛ける木枠T",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。マックスが手入れする案",
      "rect": [
        8,
        1,
        2,
        4
      ],
      "access": [
        [
          7,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "布を掛ける木枠Tを使う",
          "rect": [
            6,
            1,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack",
      "maintainers": [
        "resident-マックス"
      ]
    },
    {
      "symbol": "L",
      "name": "清潔な寝具の棚",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        1,
        7,
        2,
        2
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "清潔な寝具の棚を使う",
          "rect": [
            3,
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
      "symbol": "Q",
      "name": "使用済み寝具の受け",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        8,
        7,
        2,
        2
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "使用済み寝具の受けを使う",
          "rect": [
            6,
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
    "resident-リリー",
    "resident-マックス",
    "resident-フランツ"
  ],
  "laundry_drying": {
    "racks": [
      {
        "furniture": "R",
        "handler": "resident-リリー"
      },
      {
        "furniture": "T",
        "handler": "resident-マックス"
      }
    ],
    "capacity_status": "unverified"
  },
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#RR.....TT#",
      "#RR.....TT#",
      "#RR.....TT#",
      "#RR.....TT#",
      "#.........#",
      "#.........#",
      "#LL.....QQ#",
      "#LL.....QQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# フランツの酒場／2階 室内干しと寝具の手入れ

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込みの寝間の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

木枠の布を床の占有に含め、布の下を通路として数えない。リリーとマックスに木枠を割り当てるが、布の量と重量、掛ける高さ、灰を避ける換気と湿気、清潔な寝具と使用済みの分離、全寝具と衣服の乾燥時間は未照合である。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
###########
#RR.....TT#
#RR.....TT#
#RR.....TT#
#RR.....TT#
#.........#
#.........#
#LL.....QQ#
#LL.....QQ#
#.........#
####DD#####
```
