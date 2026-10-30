---
{
  "id": "room-h-c4-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "bed_capacity": 0,
  "title": "マルクスの家／2階 家族の階段",
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
    "マルクス",
    "カタリーナ",
    "ダニエル",
    "イダ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "家族が上階へ行く階段",
      "owner": "マルクス",
      "source": "町の木工所で製作しマルクスが手入れする案",
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
          "activity": "店主が上階へ上がる階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-マルクス"
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
      "target": "room-h-c4-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-h-c4-lower-stairs",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c4",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "private_for": [
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
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
      "#....#",
      "######"
    ]
  }
}
---
# マルクスの家／2階 家族の階段

## 用途と暮らし

[[building-h-c4]] の平面案に属する。家庭の共用廊下へつなぐ。灯りと手摺、夜間に子どもの寝床へ降りる経路と物音は未照合である。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
#....#
######
```
