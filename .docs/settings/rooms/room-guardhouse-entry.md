---
{
  "id": "room-guardhouse-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／1階 家庭と修理の入口・共用廊下",
  "room_name": "1階 家庭と修理の入口・共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    10
  ],
  "use": "生活",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "furniture": [],
  "connections": [
    {
      "kind": "door",
      "door": [
        20,
        1
      ],
      "width_cells": 2,
      "target": "map-phanthiet-gate"
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-guardhouse-lower-stairs",
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
      "target": "room-guardhouse-1",
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
      "target": "room-guardhouse-gear",
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
      "target": "room-guardhouse-dining",
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
      "target": "room-guardhouse-2",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD########DD#####",
      "D...................D",
      "D...................D",
      "#...................#",
      "####DD########DD#####"
    ]
  }
}
---
# 門の詰所／1階 家庭と修理の入口・共用廊下

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。四人の共用入口から当直の準備・装備、台所と食事、階段へ分かれる。勤務から戻る人が、眠る同僚の寝室を通り抜けることを前提にしない。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................D
D...................D
#...................#
####DD########DD#####
```
