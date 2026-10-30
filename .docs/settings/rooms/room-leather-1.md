---
{
  "id": "room-leather-1",
  "kind": "rooms",
  "title": "ルドルフの革工房／1階 乾いた革の細工と受渡し",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-leather",
  "floor": 0,
  "room_name": "乾いた革の細工と受渡し",
  "use": "店",
  "occupants": [
    "ルドルフ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#...........D",
      "#.....EEE...D",
      "D.....EEE...#",
      "D...........#",
      "#...........#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "######DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        6,
        12
      ],
      "width_cells": 2,
      "target": "room-leather-2",
      "target_door": [
        6,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        12,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-leather-lower-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "完成品の棚",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "完成品の棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "B",
      "name": "裁断と縫いの道具棚",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        9,
        1,
        3,
        3
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "裁断と縫いの道具棚を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "E",
      "name": "乾いた革の裁断と縫いの台",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        6,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "乾いた革の裁断と縫いの台を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "C",
      "name": "なめし終えた乾いた革の棚",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
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
          "activity": "なめし終えた乾いた革の棚を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "R",
      "name": "完成品と注文の受渡し台",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        9,
        9,
        3,
        3
      ],
      "access": [
        [
          8,
          9
        ],
        [
          10,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "完成品と注文の受渡し台を使う",
          "rect": [
            7,
            9,
            2,
            2
          ]
        },
        {
          "activity": "完成品と注文の受渡し台を使う",
          "rect": [
            9,
            7,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-leather",
    "resident-ルドルフ"
  ],
  "origin": [
    5,
    0
  ]
}
---
# ルドルフの革工房／1階 乾いた革の細工と受渡し

## 用途と暮らし

[[building-leather]] の平面案に属する。乾いた革の裁断・縫いと道具、完成品と受渡しを持つ。客がなめし桶や家の台所を通り抜けることを前提にしない。皮を扱った衣服と手で乾いた製品を汚さない移行の方法は未照合である。

## 未解決の条件

敷地と構造、戸・窓・梁と換気、作業の水と汚れ・薬剤・皮の運搬、給排水と便所・家庭の火、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#############
#AAA.....BBB#
#AAA.....BBB#
#AAA.....BBB#
#...........D
#.....EEE...D
D.....EEE...#
D...........#
#...........#
#CCC.....RRR#
#CCC.....RRR#
#CCC.....RRR#
######DD#####
```
