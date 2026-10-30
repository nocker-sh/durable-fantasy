---
{
  "id": "room-armorer-lower-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "bed_capacity": 0,
  "title": "ベアトリクスの防具屋／1階 住人の階段",
  "room_name": "1階 住人の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "ベアトリクス",
    "ルイーゼ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
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
          "activity": "住まいへ上がる階段を使う",
          "rect": [
            1,
            13,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        10
      ],
      "width_cells": 2,
      "target": "room-armorer-1",
      "target_door": [
        0,
        10
      ]
    },
    {
      "kind": "stair",
      "target": "room-armorer-upper-stairs",
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
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "private_for": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
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
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
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
# ベアトリクスの防具屋／1階 住人の階段

## 用途と暮らし

[[building-armorer]] の平面案に属する。仕事場から住まいへ上がる階段を持つ。重い金属と防具の材料を階段で運搬する前提にしない。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
#SS..D
#SS..D
#SS..#
#....#
#....#
#....#
#....#
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
