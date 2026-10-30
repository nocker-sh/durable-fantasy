---
{
  "id": "room-apothecary-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "bed_capacity": 0,
  "title": "イルムガルトの薬屋／2階 共用廊下",
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
    "イルムガルト",
    "エーファ"
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
      "target": "room-apothecary-upper-stairs",
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
      "target": "room-apothecary-3",
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
      "target": "room-apothecary-4",
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
      "target": "room-apothecary-household",
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
      "target": "room-apothecary-5",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "薬草と薬の保管条件・乾燥と調合の衛生、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-apothecary",
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "private_for": [
    "resident-イルムガルト",
    "resident-エーファ"
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
# イルムガルトの薬屋／2階 共用廊下

## 用途と暮らし

[[building-apothecary]] の平面案に属する。二人が他方の寝室を通らず、家庭の台所と仕事の乾燥部屋へ行く廊下とする。湿った薬草を廊下の床で乾かさない。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
####DD########DD#####
```
