---
{
  "id": "room-h-c1-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "bed_capacity": 0,
  "title": "ハインリヒの窯場／2階 衣服と寝具の手入れ",
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
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
      "target": "room-h-c1-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
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
        "handler": "resident-ハインリヒ"
      },
      {
        "furniture": "S",
        "handler": "resident-ハインリヒ"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# ハインリヒの窯場／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-c1]] の平面案に属する。家族の衣服と寝具の乾燥枠・乾いた寝具・洗う前の受けを持つ。生乾きの器や仕事の布を衣服の乾燥枠へ混ぜない。三人分の容量と時間・灰と換気は未照合である。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

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
