---
{
  "id": "room-armorer-1",
  "kind": "rooms",
  "title": "ベアトリクスの防具屋／1階 店先と受渡し",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "floor": 0,
  "room_name": "店先と受渡し",
  "use": "店",
  "occupants": [
    "ベアトリクス",
    "ルイーゼ"
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
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        0,
        10
      ],
      "width_cells": 2,
      "target": "room-armorer-lower-stairs",
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
      "target": "room-armorer-2",
      "target_door": [
        0,
        15
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "完成した鎧の掛け台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "完成した鎧の掛け台を使う",
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
      "name": "完成した盾の掛け台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "完成した盾の掛け台を使う",
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
      "name": "防具と代金の受渡し台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "防具と代金の受渡し台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        },
        {
          "activity": "防具と代金の受渡し台を使う",
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
      "name": "注文と寸法の帳面台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "注文と寸法の帳面台を使う",
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
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "origin": [
    5,
    0
  ]
}
---
# ベアトリクスの防具屋／1階 店先と受渡し

## 用途と暮らし

[[building-armorer]] の平面案に属する。完成した鎧と盾、注文と品の受渡し・帳面を分ける。防具を身に着ける際の二人分の身体と視線・腕を動かす範囲、受渡しを待つ客は未照合である。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
