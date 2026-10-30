---
{
  "id": "room-h-c2-upper-stairs",
  "kind": "rooms",
  "title": "共同の作業場／2階 物置への階段",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c2",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "2階 物置への階段",
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
      "target": "room-h-c2-2",
      "target_door": [
        0,
        20
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c2-lower-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        2,
        13
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
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "軽い工具を持って上がる階段を使う",
          "rect": [
            3,
            1,
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
# 共同の作業場／2階 物置への階段

## 屋根裏の出入り

[[room-h-c2-lower-stairs]] から [[room-h-c2-2]] へ出る。手入れを [[resident-ゴットフリート]] が担う案とする。戸の前と段の最上部を保管の床として数えない。

## 見通しと手入れ

暗い屋根裏から降りる人が段の端を見分けられる灯りと、工具を片手で持つ場合の支持を設計する。屋根と梁・開口の納まり、手すりの連続、埃と灰を落とす際の下階への影響は未照合である。

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
