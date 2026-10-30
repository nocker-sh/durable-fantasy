---
{
  "id": "room-h-g4-processing",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "bed_capacity": 0,
  "title": "ファルクの家／1階 獲物と皮・脂の受取り",
  "room_name": "獲物と皮・脂の受取り",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    14
  ],
  "use": "貯蔵",
  "occupants": [
    "ファルク",
    "ブリギッテ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "獲物を受け取り切り分ける台",
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
          "activity": "獲物を受け取り切り分ける台を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "B",
      "name": "皮を受ける専用の台",
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
          "activity": "皮を受ける専用の台を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "R",
      "name": "脂を収める閉じた受け",
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
          "activity": "脂を収める閉じた受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "使用後の道具と廃物の受け",
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
          "activity": "使用後の道具と廃物の受けを使う",
          "rect": [
            5,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-h-g4-entry",
      "target_door": [
        10,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        5
      ],
      "width_cells": 3,
      "target": "map-phanthiet-gate"
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
    "resident-ブリギッテ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........D",
      "D.........D",
      "D.........D",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "###########"
    ]
  },
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "持ち帰った獲物（大きさと重量・受入条件は未確定）",
      "handler": "resident-ファルク"
    }
  ]
}
---
# ファルクの家／1階 獲物と皮・脂の受取り

## 用途と暮らし

[[building-h-g4]] の平面案に属する。獲物を受け取って切り分ける台、皮を受ける台、脂の閉じた受け、使用後の道具と廃物を分ける。肉・皮・脂の移動は同時に同じ台を使わず、取扱いの順と洗いを別に検討する。獲物の大きさと重量・持込み方、刃物の操作と排水・廃物は未照合である。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........D
D.........D
D.........D
#RRR...QQQ#
#RRR...QQQ#
#RRR...QQQ#
###########
```
