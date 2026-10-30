---
{
  "id": "room-guardhouse-lower-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／1階 四人の階段",
  "room_name": "1階 四人の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "四人が上階へ行く階段",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
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
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
      "target": "room-guardhouse-entry",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-guardhouse-upper-stairs",
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
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
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
# 門の詰所／1階 四人の階段

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。共用の入口から四人の寝室へ上がる。槍と街灯の油の荷を寝室の前へ運ぶ経路にしない。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

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
