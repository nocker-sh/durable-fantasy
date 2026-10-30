---
{
  "id": "room-h-g4-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "bed_capacity": 0,
  "title": "ファルクの家／2階 共用廊下",
  "room_name": "2階 共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    10
  ],
  "use": "生活",
  "occupants": [
    "ファルク",
    "ブリギッテ",
    "ロルフ"
  ],
  "furniture": [],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-g4-upper-stairs",
      "target_door": [
        5,
        11
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g4-3",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g4-4",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        4
      ],
      "width_cells": 2,
      "target": "room-h-g4-1",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        4
      ],
      "width_cells": 2,
      "target": "room-h-g4-drying",
      "target_door": [
        4,
        0
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
      "####DD########DD#####",
      "D...................#",
      "D...................#",
      "#...................#",
      "####DD########DD#####"
    ]
  }
}
---
# ファルクの家／2階 共用廊下

## 用途と暮らし

[[building-h-g4]] の平面案に属する。家族が他方の寝室を通らず家庭の台所と衣服の手入れへ行く共用廊下とする。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
####DD########DD#####
```
