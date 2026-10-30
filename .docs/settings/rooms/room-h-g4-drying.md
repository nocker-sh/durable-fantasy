---
{
  "id": "room-h-g4-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "bed_capacity": 0,
  "title": "ファルクの家／2階 衣服と寝具の手入れ",
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
    "ファルク",
    "ブリギッテ",
    "ロルフ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
      "target": "room-h-g4-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g4",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "private_for": [
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
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
        "handler": "resident-ファルク"
      },
      {
        "furniture": "S",
        "handler": "resident-ファルク"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# ファルクの家／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-g4]] の平面案に属する。家族の衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを分ける。獣皮や仕事の汚れた布を家族の寝具と同じ枠へ干さない。三人分の量と換気・灰と臭気は未照合である。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
