---
{
  "id": "room-h-m1-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "bed_capacity": 0,
  "title": "エーリヒの家／2階 共用廊下",
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
    "エーリヒ",
    "マリー",
    "ハンナ"
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
      "target": "room-h-m1-upper-stairs",
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
      "target": "room-h-m1-2",
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
      "target": "room-h-m1-3",
      "target_door": [
        4,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        4
      ],
      "width_cells": 2,
      "target": "room-h-m1-drying",
      "target_door": [
        10,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "private_for": [
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD########DD#####",
      "D...................#",
      "D...................#",
      "#...................#",
      "##########DD#########"
    ]
  }
}
---
# エーリヒの家／2階 共用廊下

## 用途と暮らし

[[building-h-m1]] の平面案に属する。家族が他方の寝室を通らず衣服と寝具の手入れへ行く共用の廊下とする。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
##########DD#########
```
