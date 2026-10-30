---
{
  "id": "room-tailor-1",
  "kind": "rooms",
  "title": "マグダレーナの仕立て屋／1階 店先と採寸",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "floor": 0,
  "room_name": "店先と採寸",
  "use": "店",
  "occupants": [
    "マグダレーナ",
    "ロッテ"
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
      "#M........#",
      "#M........#",
      "#M........D",
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
      "target": "map-phanthiet-market"
    },
    {
      "kind": "door",
      "door": [
        0,
        10
      ],
      "width_cells": 2,
      "target": "room-tailor-lower-stairs",
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
      "target": "room-tailor-2",
      "target_door": [
        0,
        15
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "完成した服を置く棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
          "activity": "完成した服を置く棚を使う",
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
      "name": "包みと注文の見本の棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
          "activity": "包みと注文の見本の棚を使う",
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
      "name": "仕立ての注文と品の受渡し台",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
          "activity": "仕立ての注文と品の受渡し台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        },
        {
          "activity": "仕立ての注文と品の受渡し台を使う",
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
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
    },
    {
      "symbol": "M",
      "name": "採寸のための姿見",
      "owner": "マグダレーナ",
      "source": "姿見と木枠を調達する案。ガラスの調達元と運搬・固定は未確定",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        13,
        1,
        3
      ],
      "access": [
        [
          2,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "採寸のための姿見を使う",
          "rect": [
            2,
            13,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-tailor",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "origin": [
    5,
    0
  ]
}
---
# マグダレーナの仕立て屋／1階 店先と採寸

## 用途と暮らし

[[building-tailor]] の平面案に属する。完成した服と注文、包みと採寸を分ける。姿見の前に立つ使用面を持つが、採寸する人と客の二人分の操作・衣服を脱ぎ着する視線と戸の扱いは未照合である。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
#M........#
#M........#
#M........D
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
