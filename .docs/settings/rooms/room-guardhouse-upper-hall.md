---
{
  "id": "room-guardhouse-upper-hall",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／2階 共用廊下",
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
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-guardhouse-upper-stairs",
      "target_door": [
        5,
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
      "target": "room-guardhouse-drying",
      "target_door": [
        10,
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
      "target": "room-guardhouse-3",
      "target_door": [
        3,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        8,
        0
      ],
      "width_cells": 2,
      "target": "room-guardhouse-4",
      "target_door": [
        3,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        13,
        0
      ],
      "width_cells": 2,
      "target": "room-guardhouse-stefan",
      "target_door": [
        3,
        10
      ]
    },
    {
      "kind": "door",
      "door": [
        18,
        0
      ],
      "width_cells": 2,
      "target": "room-guardhouse-veronika",
      "target_door": [
        3,
        10
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
      "###DD###DD###DD###DD#",
      "D...................#",
      "D...................#",
      "#...................#",
      "##########DD#########"
    ]
  }
}
---
# 門の詰所／2階 共用廊下

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。四人の個室と衣服の手入れへ別々に入る。誰かの寝室を通って自分の寝床へ行く構成にせず、勤務の引継ぎと道具の受渡しを寝室の前で行わない。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###DD###DD###DD###DD#
D...................#
D...................#
#...................#
##########DD#########
```
