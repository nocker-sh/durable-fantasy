---
{
  "id": "room-inn-hall",
  "kind": "rooms",
  "title": "ゲルダの宿／2階 共用廊下",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-inn",
  "bed_capacity": 0,
  "occupants": [
    "ゲルダ",
    "ニーナ",
    "ゼップ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    9
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
      "target": "room-inn-upper-stairs",
      "target_door": [
        5,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target": "room-inn-3",
      "target_door": [
        3,
        9
      ]
    },
    {
      "kind": "door",
      "door": [
        11,
        0
      ],
      "width_cells": 2,
      "target": "room-inn-4",
      "target_door": [
        3,
        9
      ]
    },
    {
      "kind": "door",
      "door": [
        3,
        4
      ],
      "width_cells": 2,
      "target": "room-inn-5",
      "target_door": [
        3,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        11,
        4
      ],
      "width_cells": 2,
      "target": "room-inn-6",
      "target_door": [
        3,
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
    "building-inn"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###DD######DD####",
      "D...............#",
      "D...............#",
      "#...............#",
      "###DD######DD####"
    ]
  }
}
---
# ゲルダの宿／2階 共用廊下

## 用途と配置

[[building-inn]] の平面案に属する。階段から四つの寝室へ別々に入る。客は世帯の寝室を通り抜けず、世帯の者も客室を通らず自室へ入る。廊下に荷物や寝具の棚を置かず、戸の開閉とすれ違いは続けて照合する。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
###DD######DD####
D...............#
D...............#
#...............#
###DD######DD####
```
