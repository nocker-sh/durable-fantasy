---
{
  "id": "room-barn-1",
  "kind": "rooms",
  "title": "納屋／1階 干し草置き場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-barn",
  "floor": 0,
  "room_name": "1階 干し草置き場",
  "use": "飼料と穀物の保管・脱穀",
  "occupants": [
    "カール",
    "ウルリケ",
    "フリッツ",
    "ミア",
    "ゲルトルート",
    "ヴァルター"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###############",
      "#AAAA.....BBB.#",
      "#AAAA.....BBB.#",
      "#AAAA.....BBB.#",
      "#AAAA.....BBB.#",
      "#AAAA.....BBB.#",
      "#.............#",
      "#.............#",
      "#.............D",
      "#.............D",
      "#.............#",
      "#SSS..TTTT....#",
      "#SSS..TTTT....#",
      "#SSS..TTTT....#",
      "#.....TTTT....#",
      "#.............#",
      "#.............#",
      "######DDD######"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        14,
        8
      ],
      "width_cells": 2,
      "target": "room-barn-2",
      "target_door": [
        0,
        8
      ]
    },
    {
      "kind": "door",
      "door": [
        6,
        17
      ],
      "width_cells": 3,
      "target": "map-phanthiet"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "乾いた干し草の置場",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ヴァルターが手入れする案",
      "rect": [
        1,
        1,
        4,
        5
      ],
      "access": [
        [
          5,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "乾いた干し草の置場を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
      "maintainers": [
        "resident-ヴァルター"
      ]
    },
    {
      "symbol": "B",
      "name": "使いかけの干し草の置場",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ヴァルターが手入れする案",
      "rect": [
        10,
        1,
        3,
        5
      ],
      "access": [
        [
          9,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "使いかけの干し草の置場を使う",
          "rect": [
            8,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
      "maintainers": [
        "resident-ヴァルター"
      ]
    },
    {
      "symbol": "S",
      "name": "種と穀物の蓋付き箱",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。カールが手入れする案",
      "rect": [
        1,
        11,
        3,
        3
      ],
      "access": [
        [
          4,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "種と穀物の蓋付き箱を使う",
          "rect": [
            4,
            11,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
      "maintainers": [
        "resident-カール"
      ]
    },
    {
      "symbol": "T",
      "name": "脱穀作業の床",
      "owner": "農家のカールとウルリケの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。カールが手入れする案",
      "rect": [
        6,
        11,
        4,
        4
      ],
      "access": [
        [
          5,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "脱穀作業の床を使う",
          "rect": [
            4,
            11,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-カール"
      ]
    }
  ],
  "issues": [
    "干し草と穀物の容量・湿気・灰と換気、虫害と火気の隔離は未照合",
    "荷車と農具・脱穀の操作範囲、荷の重量と搬送、敷地と立体・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-barn",
    "resident-カール",
    "resident-ヴァルター"
  ],
  "origin": [
    0,
    0
  ],
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "乾いた干し草",
      "handler": "resident-ヴァルター"
    },
    {
      "furniture": "B",
      "contents": "使いかけの干し草",
      "handler": "resident-ヴァルター"
    },
    {
      "furniture": "S",
      "contents": "種と穀物",
      "handler": "resident-カール"
    }
  ],
  "parallel_use": [
    {
      "activity": "干し草と種の取出し",
      "operations": [
        {
          "resident": "カール",
          "furniture": "S",
          "space_index": 0
        },
        {
          "resident": "ヴァルター",
          "furniture": "A",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# 納屋／1階 干し草置き場

## 物と作業の配置

[[building-barn]] の平面案に属する。乾いた干し草と使いかけ、種と穀物、脱穀する床を分ける。干し草は人が出入りする床へ積まず、火を使う設備を置かない。収穫と保管の量、床の強さと湿気・虫、灰を避ける換気と脱穀の道具を振る範囲は未照合である。

## 家とのつながり

カールとヴァルターが担当し、世帯の食事と六人の寝床は [[building-farmhouse]] に維持する。南の専用の戸から物を受け、隣室との戸をつなぐ。荷物を持たない身体の平面到達と、一部の二人の取出しを照合する。飼料と農具を畑・牧草地・鶏小屋へ運ぶ量と時間、敷地と段差・立体と描画は引き続き照合する。

```grid
###############
#AAAA.....BBB.#
#AAAA.....BBB.#
#AAAA.....BBB.#
#AAAA.....BBB.#
#AAAA.....BBB.#
#.............#
#.............#
#.............D
#.............D
#.............#
#SSS..TTTT....#
#SSS..TTTT....#
#SSS..TTTT....#
#.....TTTT....#
#.............#
#.............#
######DDD######
```
