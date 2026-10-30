---
{
  "id": "room-general-lower-stairs",
  "kind": "rooms",
  "title": "ブルーノの道具屋／1階 店主の階段",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-general",
  "bed_capacity": 0,
  "occupants": [
    "ブルーノ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "room_name": "1階 店主の階段",
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        6
      ],
      "width_cells": 2,
      "target": "room-general-1",
      "target_door": [
        0,
        6
      ]
    },
    {
      "kind": "stair",
      "target": "room-general-upper-stairs",
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
      "name": "店主が上階へ上がる階段",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
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
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家、戸・窓・梁と地形は未照合",
    "商品の容量と重量・搬送、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-general",
    "resident-ブルーノ"
  ],
  "private_for": [
    "resident-ブルーノ"
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
      "#SS..D",
      "#SS..D",
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
      "#....#",
      "######"
    ]
  }
}
---
# ブルーノの道具屋／1階 店主の階段

## 用途と暮らし

[[building-general]] の平面案に属する。店主が上階へ上がる区画を客の通り抜けから分ける。商品や返された品を階段と踊り場の置場にしない。

## 未解決の条件

戸の開閉と視線・音、商品の量と容量、荷物を持つ身体と段差、火と煙・灰と換気、衣服と寝具の手入れ、仕事と休息・日課は未照合である。現行の建物の位置と描画は切り替えない。敷地と立体は建物資料へ結ぶ。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
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
#....#
######
```
