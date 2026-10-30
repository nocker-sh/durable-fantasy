---
{
  "id": "room-h-m5-upper-stairs",
  "kind": "rooms",
  "title": "町の寄り合い所／2階 記録室への階段",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m5",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "room_name": "2階 記録室への階段",
  "use": "共用",
  "occupants": [
    "エーリヒ"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "issues": [
    "敷地と道・地形・隣家、外観と全階の構造・戸と窓は未照合",
    "授業と寄り合い・記録の時間と音、往復と給排水・便所・燃料と換気、維持費と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-m5",
    "resident-エーリヒ",
    "map-phanthiet-in-h-m5-floor-2"
  ],
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
      "#....D",
      "#....D",
      "#....#",
      "######"
    ]
  },
  "furniture": [
    {
      "symbol": "S",
      "name": "記録室への階段",
      "owner": "町の寄り合いの共用品",
      "source": "町の木工所へ製作を頼み、担当者が手入れする案",
      "maintainers": [
        "resident-エーリヒ"
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
      "role": "stairs",
      "use_space": [
        {
          "activity": "記録室への階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "runtime_kind": "stair",
      "runtime_solid": true
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        16
      ],
      "width_cells": 2,
      "target": "room-h-m5-2",
      "target_door": [
        0,
        16
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-m5-lower-stairs",
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
  "private_for": [
    "resident-エーリヒ"
  ]
}
---
# 町の寄り合い所／2階 記録室への階段

## 用途と利用

[[building-h-m5]] の平面案に属する。書記が記録室へ出入りする。授業の席を通り抜けることと階段の避難・搬入は別に照合する。

## 描画へ渡す前の条件

敷地と道、構造と戸・窓、授業と集会の切替と音、通学と帰宅、給排水と便所・燃料と煙・紙の保管と維持は未照合である。現行の日課の時刻と座標、外形と描画は変更しない。

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
#....D
#....D
#....#
######
```
