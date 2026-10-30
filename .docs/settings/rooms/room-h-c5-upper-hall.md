---
{
  "id": "room-h-c5-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "bed_capacity": 0,
  "title": "ベルンハルトの家／2階 共用廊下",
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
    "ベルンハルト",
    "モニカ",
    "トビアス"
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
      "target": "room-h-c5-upper-stairs",
      "target_door": [
        5,
        11
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        4
      ],
      "width_cells": 2,
      "target": "room-h-c5-1",
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
      "target": "room-h-c5-drying",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c5-3",
      "target_door": [
        3,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c5-monica",
      "target_door": [
        3,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        17,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c5-tobias",
      "target_door": [
        3,
        10
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
      "###DD#####DD#####DD##",
      "D...................#",
      "D...................#",
      "#...................#",
      "####DD########DD#####"
    ]
  }
}
---
# ベルンハルトの家／2階 共用廊下

## 用途と暮らし

[[building-h-c5]] の平面案に属する。三人が他方の寝室を通らず家庭の台所と衣服の手入れへ行く共用廊下とする。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###DD#####DD#####DD##
D...................#
D...................#
#...................#
####DD########DD#####
```
