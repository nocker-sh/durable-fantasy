---
{
  "id": "room-h-m1-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "bed_capacity": 0,
  "title": "エーリヒの家／2階 衣服と寝具の手入れ",
  "room_name": "2階 衣服と寝具の手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "エーリヒ",
    "マリー",
    "ハンナ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
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
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
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
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        1,
        5,
        4,
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
          "activity": "乾いた寝具の箱を使う",
          "rect": [
            5,
            5,
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
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        15,
        5,
        4,
        2
      ],
      "access": [
        [
          14,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "洗う前の衣服と寝具の受けを使う",
          "rect": [
            13,
            5,
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
      "target": "room-h-m1-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "private_for": [
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
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
      "#LLLL..........QQQQ.#",
      "#LLLL..........QQQQ.#",
      "#####################"
    ]
  },
  "laundry_drying": {
    "racks": [
      {
        "furniture": "R",
        "handler": "resident-マリー"
      },
      {
        "furniture": "S",
        "handler": "resident-マリー"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# エーリヒの家／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-m1]] の平面案に属する。家族の衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを持つ。仕事の紙を乾かす棚や茶の材料の置場へ代用しない。三人分の量と換気・灰は未照合である。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#RRRR..........SSSS.#
#RRRR..........SSSS.#
#...................#
#...................#
#LLLL..........QQQQ.#
#LLLL..........QQQQ.#
#####################
```
