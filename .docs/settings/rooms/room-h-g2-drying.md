---
{
  "id": "room-h-g2-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "bed_capacity": 0,
  "title": "クルトの家／2階 家庭の衣服と寝具の手入れ",
  "room_name": "2階 家庭の衣服と寝具の手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "クルト",
    "ザビーネ",
    "ヨハン",
    "リナ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        1,
        1,
        4,
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
          "activity": "衣服を干す枠甲を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack"
    },
    {
      "symbol": "S",
      "name": "寝具を干す枠乙",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        15,
        1,
        4,
        2
      ],
      "access": [
        [
          15,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を干す枠乙を使う",
          "rect": [
            15,
            3,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack"
    },
    {
      "symbol": "L",
      "name": "乾いた寝具の箱",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        1,
        9,
        4,
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
          "activity": "乾いた寝具の箱を使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "Q",
      "name": "洗う前の衣服と寝具の受け",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
      ],
      "rect": [
        15,
        9,
        4,
        3
      ],
      "access": [
        [
          14,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "洗う前の衣服と寝具の受けを使う",
          "rect": [
            13,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g2-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "private_for": [
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########DD#########",
      "#RRRR..........SSSS.#",
      "#RRRR..........SSSS.#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#LLLL..........QQQQ.#",
      "#LLLL..........QQQQ.#",
      "#LLLL..........QQQQ.#",
      "#####################"
    ]
  },
  "laundry_drying": {
    "racks": [
      {
        "furniture": "R",
        "handler": "resident-ザビーネ"
      },
      {
        "furniture": "S",
        "handler": "resident-ザビーネ"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# クルトの家／2階 家庭の衣服と寝具の手入れ

## 用途と暮らし

[[building-h-g2]] の平面案に属する。家庭の衣服と寝具の枠、乾いた寝具と洗う前の受けを分ける。研ぎくずと金属・仕事の油が付いた衣服は仕事側で分け、家庭の寝具へそのまま掛けない。四人分の量と時間・換気と灰は未照合である。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#RRRR..........SSSS.#
#RRRR..........SSSS.#
#...................#
#...................#
#...................#
#...................#
#...................#
#...................#
#LLLL..........QQQQ.#
#LLLL..........QQQQ.#
#LLLL..........QQQQ.#
#####################
```
