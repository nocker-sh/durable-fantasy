---
{
  "id": "room-h-m2-drying",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "bed_capacity": 0,
  "title": "アガーテのろうそく屋／2階 衣服と寝具の手入れ",
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
    "アガーテ",
    "ジーモン",
    "フェリックス"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "衣服を干す枠甲",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
      "target": "room-h-m2-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
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
        "handler": "resident-アガーテ"
      },
      {
        "furniture": "S",
        "handler": "resident-アガーテ"
      }
    ],
    "capacity_status": "unverified"
  }
}
---
# アガーテのろうそく屋／2階 衣服と寝具の手入れ

## 用途と暮らし

[[building-h-m2]] の平面案に属する。衣服と寝具の乾燥枠、乾いた寝具と洗う前の受けを分ける。蝋や灯り油の材料の保管を物干しの用途へ混ぜない。三人分の乾燥量と頻度・灰と換気は未照合である。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
