---
{
  "id": "room-buyer-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "bed_capacity": 0,
  "title": "ラインホルトの買取所／2階 共用廊下",
  "room_name": "2階 共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
  ],
  "use": "生活",
  "occupants": [
    "ラインホルト",
    "カスパー"
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
      "target": "room-buyer-upper-stairs",
      "target_door": [
        5,
        12
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-buyer-3",
      "target_door": [
        4,
        11
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        0
      ],
      "width_cells": 2,
      "target": "room-buyer-kaspar",
      "target_door": [
        4,
        11
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        4
      ],
      "width_cells": 2,
      "target": "room-buyer-household",
      "target_door": [
        10,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "private_for": [
    "resident-ラインホルト",
    "resident-カスパー"
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
# ラインホルトの買取所／2階 共用廊下

## 用途と暮らし

[[building-buyer]] の平面案に属する。二人が他方の私室を通らず、家庭の台所と食事へ行く共用の廊下とする。仕事の荷を廊下へ仮置きしない。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
##########DD#########
```
