---
{
  "id": "room-tailor-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "bed_capacity": 0,
  "title": "マグダレーナの仕立て屋／2階 共用廊下",
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
    "マグダレーナ",
    "ロッテ"
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
      "target": "room-tailor-upper-stairs",
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
      "target": "room-tailor-3",
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
      "target": "room-tailor-4",
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
      "target": "room-tailor-household",
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
      "target": "room-tailor-5",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-tailor",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "private_for": [
    "resident-マグダレーナ",
    "resident-ロッテ"
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
# マグダレーナの仕立て屋／2階 共用廊下

## 用途と暮らし

[[building-tailor]] の平面案に属する。二人が他方の私室を通らず、家庭と布の倉へ行く共用の廊下とする。物干しや布の在庫で通路を塞がない。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................#
D...................#
#...................#
####DD########DD#####
```
