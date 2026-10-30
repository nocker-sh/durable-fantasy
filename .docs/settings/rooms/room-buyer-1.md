---
{
  "id": "room-buyer-1",
  "kind": "rooms",
  "title": "ラインホルトの買取所／1階 計量と買取の受付",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "floor": 0,
  "room_name": "1階 計量と買取の受付",
  "use": "店",
  "occupants": [
    "ラインホルト",
    "カスパー"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD####",
      "#LLL......#",
      "#LLL......#",
      "#.........#",
      "#.........#",
      "#RRR......#",
      "#RRR......D",
      "#RRR......D",
      "#.........D",
      "#.........#",
      "D.....TTT.#",
      "D.....TTT.#",
      "#.....TTT.#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........D",
      "#.........D",
      "#QQQ......D",
      "#QQQ......#",
      "#QQQ......#",
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
      "target": "room-buyer-lower-stairs",
      "target_door": [
        5,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 3,
      "target": "room-buyer-2",
      "target_door": [
        0,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        19
      ],
      "width_cells": 3,
      "target": "room-buyer-raw-store",
      "target_door": [
        0,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "品の確認と受渡しの台",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        1,
        5,
        3,
        3
      ],
      "access": [
        [
          4,
          5
        ],
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "品の確認と受渡しの台を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        },
        {
          "activity": "客が品と買取の内容を確認する",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "大きな天秤の台",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        6,
        10,
        3,
        3
      ],
      "access": [
        [
          5,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "大きな天秤の台を使う",
          "rect": [
            4,
            10,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "買取と卸しの帳面の棚",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "買取と卸しの帳面の棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "包みと空箱の棚",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        1,
        21,
        3,
        3
      ],
      "access": [
        [
          4,
          21
        ]
      ],
      "use_space": [
        {
          "activity": "包みと空箱の棚を使う",
          "rect": [
            4,
            21,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "origin": [
    5,
    0
  ]
}
---
# ラインホルトの買取所／1階 計量と買取の受付

## 用途と暮らし

[[building-buyer]] の平面案に属する。品と計量・買取の内容を確認し、受付と天秤・帳面・包みを分ける。生皮と毛皮の荷は受付に広げず専用の受取り室へ運ぶ。天秤の計量範囲と搬入する荷の寸法・受入条件は未確定である。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####DD####
#LLL......#
#LLL......#
#.........#
#.........#
#RRR......#
#RRR......D
#RRR......D
#.........D
#.........#
D.....TTT.#
D.....TTT.#
#.....TTT.#
#.........#
#.........#
#.........#
#.........#
#.........#
#.........#
#.........D
#.........D
#QQQ......D
#QQQ......#
#QQQ......#
#.........#
###########
```
