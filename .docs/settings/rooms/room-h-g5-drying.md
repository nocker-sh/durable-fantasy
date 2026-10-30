---
{
  "id": "room-h-g5-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "bed_capacity": 0,
  "title": "クリスティアンの家／2階 家庭の衣服と寝具の手入れ",
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
    "クリスティアン",
    "ドロテア",
    "ラウラ",
    "ベンヤミン"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
      "target": "room-h-g5-upper-hall",
      "target_door": [
        10,
        4
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
  "private_for": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
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
        "handler": "resident-ドロテア"
      },
      {
        "furniture": "S",
        "handler": "resident-ドロテア"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# クリスティアンの家／2階 家庭の衣服と寝具の手入れ

## 用途と暮らし

[[building-h-g5]] の平面案に属する。家庭の衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを分ける。訪問の仕事で持ち帰った布を家庭の寝具へそのまま掛けない。四人分の量と乾燥時間・換気と灰は未照合である。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

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
