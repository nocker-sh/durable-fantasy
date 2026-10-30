---
{
  "id": "room-guardhouse-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／2階 家庭の衣服と寝具の手入れ",
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
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "target": "room-guardhouse-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
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
        "handler": "resident-ディーター"
      },
      {
        "furniture": "S",
        "handler": "resident-ディーター"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# 門の詰所／2階 家庭の衣服と寝具の手入れ

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。勤務する四人の衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを分ける。油や仕事の汚れを家庭の寝具へそのまま持ち込まない。交代中の手入れと四人分の容量・換気と灰は未照合である。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

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
