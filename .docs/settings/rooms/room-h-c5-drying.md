---
{
  "id": "room-h-c5-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "bed_capacity": 0,
  "title": "ベルンハルトの家／2階 衣服と寝具の手入れ",
  "room_name": "2階 衣服と寝具の手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    15,
    14
  ],
  "use": "生活",
  "occupants": [
    "ベルンハルト",
    "モニカ",
    "トビアス"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
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
          "activity": "衣服を干す枠甲を使う",
          "rect": [
            4,
            2,
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
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
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
          "activity": "寝具を干す枠乙を使う",
          "rect": [
            5,
            2,
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
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        1,
        8,
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
          "activity": "乾いた寝具の箱を使う",
          "rect": [
            4,
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
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        7,
        8,
        3,
        3
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "洗う前の衣服と寝具の受けを使う",
          "rect": [
            5,
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
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c5-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#RRR...SSS#",
      "#RRR...SSS#",
      "#RRR...SSS#",
      "#RRR...SSS#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#LLL...QQQ#",
      "#LLL...QQQ#",
      "#LLL...QQQ#",
      "###########"
    ]
  },
  "laundry_drying": {
    "racks": [
      {
        "furniture": "R",
        "handler": "resident-ベルンハルト"
      },
      {
        "furniture": "S",
        "handler": "resident-ベルンハルト"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# ベルンハルトの家／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-c5]] の平面案に属する。家庭の衣服と寝具、乾いた寝具と洗う前の受けを分ける。煤の付いた仕事着は仕事側で分けて扱い、そのまま寝具の乾燥枠へ掛けない。三人分の量と換気・灰の混入は未照合である。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#RRR...SSS#
#RRR...SSS#
#RRR...SSS#
#RRR...SSS#
#.........#
#.........#
#.........#
#LLL...QQQ#
#LLL...QQQ#
#LLL...QQQ#
###########
```
