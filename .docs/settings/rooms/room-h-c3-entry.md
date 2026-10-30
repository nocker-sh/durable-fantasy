---
{
  "id": "room-h-c3-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 0,
  "title": "エマの家／1階 家庭の入口と共用廊下",
  "room_name": "1階 家庭の入口と共用廊下",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "エマ",
    "ニクラス",
    "フリーダ",
    "ローゼマリー"
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
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-c3-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c3-work",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        14,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c3-2",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        4
      ],
      "width_cells": 2,
      "target": "room-h-c3-1",
      "target_door": [
        10,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "private_for": [
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD########DD#####",
      "D...................D",
      "D...................D",
      "#...................#",
      "##########DD#########"
    ]
  }
}
---
# エマの家／1階 家庭の入口と共用廊下

## 用途と暮らし

[[building-h-c3]] の平面案に属する。家族の入口と仕事場・ローゼマリーの寝室・家庭の台所・階段を結ぶ。柳と編みかけの籠を共用廊下へ置かない。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD########DD#####
D...................D
D...................D
#...................#
##########DD#########
```
