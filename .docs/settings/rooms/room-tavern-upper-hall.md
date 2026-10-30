---
{
  "id": "room-tavern-upper-hall",
  "kind": "rooms",
  "title": "フランツの酒場／2階 共用廊下",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "bed_capacity": 0,
  "occupants": [
    "フランツ",
    "リリー",
    "マックス"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    10
  ],
  "room_name": "2階 共用廊下",
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-tavern-upper-stairs",
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
      "target": "room-tavern-3",
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
      "target": "room-tavern-drying",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "target": "room-tavern-5",
      "door": [
        4,
        4
      ],
      "width_cells": 2,
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "target": "room-tavern-max",
      "door": [
        14,
        4
      ],
      "width_cells": 2,
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-tavern"
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
# フランツの酒場／2階 共用廊下

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込み二人それぞれの個室の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

主人の私室、住み込み二人それぞれの個室、室内干しへ別々の戸で入る。どちらかの寝室を通り道にしない。戸板の開閉とすれ違い、夜の足音と灯り、湿った布の搬送と私物の扱いは未照合である。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
####DD########DD#####
```
