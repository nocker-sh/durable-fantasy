---
{
  "id": "room-h-c3-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 0,
  "title": "エマの家／2階 衣服と寝具の手入れ",
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
    "エマ",
    "ニクラス",
    "フリーダ",
    "ローゼマリー"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
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
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
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
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        1,
        8,
        4,
        3
      ],
      "access": [
        [
          5,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "乾いた寝具の箱を使う",
          "rect": [
            5,
            9,
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
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        15,
        8,
        4,
        3
      ],
      "access": [
        [
          14,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "洗う前の衣服と寝具の受けを使う",
          "rect": [
            13,
            9,
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
      "target": "room-h-c3-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "private_for": [
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
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
        "handler": "resident-エマ"
      },
      {
        "furniture": "S",
        "handler": "resident-エマ"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# エマの家／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-c3]] の平面案に属する。家庭の衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを分ける。柳の乾燥や仕事の品の保管を物干しへ混ぜない。四人分の量と乾燥頻度・換気と灰は未照合である。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#RRRR..........SSSS.#
#RRRR..........SSSS.#
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
