---
{
  "id": "room-h-c3-lower-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 0,
  "title": "エマの家／1階 家族の階段",
  "room_name": "1階 家族の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "エマ",
    "ニクラス",
    "フリーダ",
    "ローゼマリー"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "エマ",
      "source": "町の木工所で製作しエマが手入れする案",
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
          "activity": "店主が上階へ上がる階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-エマ"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        15
      ],
      "width_cells": 2,
      "target": "room-h-c3-entry",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c3-upper-stairs",
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
      "#....D",
      "#....D",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ]
  }
}
---
# エマの家／1階 家族の階段

## 用途と暮らし

[[building-h-c3]] の平面案に属する。家族の入口から上階へ行く。ローゼマリーの寝床と家庭の食事・仕事場は地上階に持ち、階段を日常の必須の経路にしない。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
#....D
#....D
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
######
```
