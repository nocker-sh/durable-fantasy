---
{
  "id": "room-h-c1-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "bed_capacity": 0,
  "title": "ハインリヒの窯場／2階 家族の階段",
  "room_name": "2階 家族の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
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
          "activity": "住まいへ上がる階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ハインリヒ"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        11
      ],
      "width_cells": 2,
      "target": "room-h-c1-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c1-lower-stairs",
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
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
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
      "#SS..D",
      "#SS..D",
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
# ハインリヒの窯場／2階 家族の階段

## 用途と暮らし

[[building-h-c1]] の平面案に属する。家族の共用廊下へつなぐ。夜市からの帰宅時の灯りと物音、手摺と段差は未照合である。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

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
#SS..D
#SS..D
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
