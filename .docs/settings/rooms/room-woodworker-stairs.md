---
{
  "id": "room-woodworker-stairs",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／2階 家族の階段区画",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-woodworker",
  "floor": 1,
  "room_name": "2階 家族の階段区画",
  "use": "通行",
  "occupants": [
    "ゴットフリート",
    "アントン"
  ],
  "bed_capacity": 0,
  "origin": [
    0,
    0
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "工房から上がる直階段",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "階段の上端へ出入りする",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    }
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....#",
      "######"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "stair",
      "target": "room-woodworker-1",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        3,
        12
      ]
    },
    {
      "kind": "door",
      "target": "room-woodworker-kitchen",
      "door": [
        5,
        1
      ],
      "width_cells": 2,
      "target_door": [
        0,
        1
      ]
    }
  ],
  "private_for": [
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "issues": [
    "木屑と居住部の隔離・戸と金具・梁と床の立体照合未完了",
    "便所・換気と排煙・水と灰や汚水の搬出先は未確定"
  ],
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-1",
    "room-woodworker-kitchen"
  ]
}
---

# ゴットフリートの木工所／2階 家族の階段区画

## 工房と家族の床を分ける

[[room-woodworker-1]]で仕事着と靴を下ろして上がり、上の戸で[[room-woodworker-kitchen]]へ入る。材料や完成品を置く棚にせず、工房の客や働きに来る人の通路と家族の生活を分ける。

## 平面案

```grid
######
#SS..D
#SS..D
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#....#
#....#
######
```

この区画は再設計で追加する計画である。階段の段と踊り場・床開口を断面へ対応させ、戸、木屑と音の遮断、手すりと灯りは別に設計する。
