---
{
  "id": "room-h-c2-lower-stairs",
  "kind": "rooms",
  "title": "共同の作業場／1階 物置への階段",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c2",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "1階 物置への階段",
  "use": "共用",
  "occupants": [
    "ゴットフリート"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
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
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....D",
      "#....D",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        20
      ],
      "width_cells": 2,
      "target": "room-h-c2-entry",
      "target_door": [
        0,
        7
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c2-upper-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        2,
        13
      ],
      "target_access": [
        3,
        1
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "軽い工具を持って上がる階段",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          2,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "軽い工具を持って上がる階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "role": "stairs"
    }
  ],
  "issues": [
    "敷地と道・地形・構造と戸・窓は未照合",
    "共用設備の管理と利用の交代・手入れ、給排水と便所・火と煙・材料と廃物、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c2",
    "resident-ゴットフリート"
  ]
}
---
# 共同の作業場／1階 物置への階段

## 物置へ上がる経路

[[room-h-c2-entry]] から軽い工具を持って [[room-h-c2-upper-stairs]] へ上がる。階段の手入れは [[resident-ゴットフリート]] が担う案とする。作業室の大型設備を屋根裏へ搬入するための階段にはしない。

## 踊り場と戸

踊り場を荷の一時置場に使わない。手すりと手に持つ箱の幅、片手で戸を扱えるか、戸を開けておく金具と灯りは未照合である。段と開口・頭上の寸法は建物の stair_sections を参照する。

現行の敷地と外形への収容、構造と給排水・便所、日課と立体の照合を終えるまで描画へ採用しない。

```grid
######
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
#SS..#
#SS..#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....D
#....D
#....#
#....#
#....#
######
```
