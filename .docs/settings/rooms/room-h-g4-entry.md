---
{
  "id": "room-h-g4-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "bed_capacity": 0,
  "title": "ファルクの家／1階 家庭の入口と身支度",
  "room_name": "1階 家庭の入口と身支度",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
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
      "name": "仕事靴の受け",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
      ],
      "rect": [
        1,
        6,
        2,
        3
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "仕事靴の受けを使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "帰宅時の手洗い台",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
      ],
      "rect": [
        7,
        1,
        3,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時の手洗い台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "外套と前掛けの受け",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
      ],
      "rect": [
        7,
        8,
        3,
        2
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "外套と前掛けの受けを使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        11
      ],
      "width_cells": 2,
      "target": "map-phanthiet-gate"
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g4-2",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-g4-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 2,
      "target": "room-h-g4-processing",
      "target_door": [
        0,
        6
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
      "D......WWW#",
      "D......WWW#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#RR.......D",
      "#RR.......D",
      "#RR....QQQ#",
      "#......QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# ファルクの家／1階 家庭の入口と身支度

## 用途と暮らし

[[building-h-g4]] の平面案に属する。猟と仕事から家族の生活へ戻る入口と身支度を持つ。泥と血・仕事着の扱いを家庭の食卓へ持ち込まない。家族が燻し部屋と獲物の台を通らず寝床と食卓へ行く案とする。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
D......WWW#
D......WWW#
#.........#
#.........#
#.........#
#RR.......D
#RR.......D
#RR....QQQ#
#......QQQ#
#.........#
####DD#####
```
