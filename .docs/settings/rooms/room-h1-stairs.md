---
{
  "id": "room-h1-stairs",
  "kind": "rooms",
  "title": "ヴィルヘルムの家／2階 階段区画",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h1",
  "floor": 1,
  "room_name": "2階 階段区画",
  "use": "通行",
  "occupants": [
    "ヴィルヘルム",
    "ゾフィー"
  ],
  "bed_capacity": 0,
  "origin": [
    0,
    0
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "一階からの直階段",
      "owner": "elder",
      "source": "町の木工師に作ってもらった家具",
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
  "connections": [
    {
      "kind": "stair",
      "target": "room-h1-1",
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
      "kind": "opening",
      "target": "room-h1-landing",
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
  "issues": [
    "床開口・梁と手すり・灯りと通行の立体照合未完了"
  ],
  "design_dependencies": [
    "building-h1",
    "room-h1-1",
    "room-h1-landing"
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
  }
}
---

# ヴィルヘルムの家／2階 階段区画

## 私室と分ける階段

[[room-h1-1]]から上がる直階段を、私室とは別の区画として設計する。上端の踊り場から東の開口で[[room-h1-landing]]へ出て、二人の私室へ分かれる。階段の開口を個人の寝床の中へ置き、就寝中の人の横を通る構成にはしない。

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

床高と段・床開口・屋根下面は[[building-h1]]へ対応させる。床開口と手すり、夜の灯り、下階へ声や明かりが通る範囲は別に立体で照合する。この区画は現行コードの部屋を追認したものではなく、再設計で追加する計画である。
