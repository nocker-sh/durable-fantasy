---
{
  "id": "room-h-g4-2",
  "kind": "rooms",
  "title": "ファルクの家／1階 燻しと冷却",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "floor": 0,
  "room_name": "燻しと冷却",
  "use": "作業",
  "occupants": [
    "ファルク",
    "ブリギッテ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH.........RRRRR.#",
      "#HHHH...............#",
      "#...................#",
      "#...................D",
      "#...................D",
      "#...................D",
      "#FFF..........PPP...#",
      "#FFF...CCC....PPP...#",
      "#FFF...CCC....PPP...#",
      "#......CCC..........#",
      "#...................#",
      "####DD###############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-h-g4-entry",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        20,
        6
      ],
      "width_cells": 3,
      "target": "map-phanthiet-gate"
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "肉を燻す設備と煙の熱源",
      "owner": "ブリギッテ",
      "source": "町の石工と鍛冶場へ燻す設備を頼む案。方式と温度・煙の制御と消火は未確定。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        1,
        1,
        4,
        4
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "肉を燻す設備と煙の熱源を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "smoking_heat"
    },
    {
      "symbol": "R",
      "name": "燻した肉を冷ます保護した枠",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        14,
        1,
        5,
        3
      ],
      "access": [
        [
          14,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "燻した肉を冷ます保護した枠を使う",
          "rect": [
            14,
            4,
            2,
            2
          ]
        }
      ],
      "role": "smoked_food_cooling"
    },
    {
      "symbol": "F",
      "name": "燻しに使う乾いた薪の受け",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
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
          9
        ]
      ],
      "use_space": [
        {
          "activity": "燻しに使う乾いた薪の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "fuel_storage"
    },
    {
      "symbol": "W",
      "name": "燻製用の道具の洗い台",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
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
          "activity": "燻製用の道具の洗い台を使う",
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
      "symbol": "P",
      "name": "燻す前の肉の専用の受け",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        14,
        9,
        3,
        3
      ],
      "access": [
        [
          13,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "燻す前の肉の専用の受けを使う",
          "rect": [
            12,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "冷めた燻製を保護した棚",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        7,
        10,
        3,
        3
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "冷めた燻製を保護した棚を使う",
          "rect": [
            7,
            8,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
    },
    {
      "symbol": "N",
      "name": "食肉の包みと清潔な容器の棚",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        11,
        1,
        2,
        2
      ],
      "access": [
        [
          11,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "食肉の包みと清潔な容器の棚を使う",
          "rect": [
            11,
            3,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g4",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ファルク",
    "resident-ブリギッテ"
  ],
  "hot_work": {
    "process": "smoking",
    "handler": "resident-ブリギッテ",
    "heat_sources": [
      "H"
    ],
    "cooling": [
      "R"
    ],
    "finished": [
      "C"
    ],
    "fuel": [
      "F"
    ]
  }
}
---
# ファルクの家／1階 燻しと冷却

## 用途と暮らし

[[building-h-g4]] の平面案に属する。燻す前の肉と仕事の洗い台、燻す設備と薪、燻した後の冷却、冷めた品を保護する棚と包装材を分ける。生肉を置いた受けと燻した肉の受けを共用しない。燻しの方式と温度・時間、食肉の状態と保存条件は未確定であり、棚を分けるだけで食べられる加工が成立したとはしない。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####################
#HHHH..WWW.NN.RRRRR.#
#HHHH..WWW.NN.RRRRR.#
#HHHH.........RRRRR.#
#HHHH...............#
#...................#
#...................D
#...................D
#...................D
#FFF..........PPP...#
#FFF...CCC....PPP...#
#FFF...CCC....PPP...#
#......CCC..........#
#...................#
####DD###############
```
