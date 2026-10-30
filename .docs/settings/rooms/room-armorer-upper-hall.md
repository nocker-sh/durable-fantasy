---
{
  "id": "room-armorer-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "bed_capacity": 0,
  "title": "ベアトリクスの防具屋／2階 共用廊下",
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
    "ベアトリクス",
    "ルイーゼ"
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
      "target": "room-armorer-upper-stairs",
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
      "target": "room-armorer-3",
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
      "target": "room-armorer-4",
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
      "target": "room-armorer-household",
      "target_door": [
        10,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "private_for": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
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
# ベアトリクスの防具屋／2階 共用廊下

## 用途と暮らし

[[building-armorer]] の平面案に属する。二人が他方の寝室を通らず家庭の台所と食事へ行く共用の廊下とする。私物と仕事の荷を廊下に積まない。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
##########DD#########
```
