---
{
  "id": "room-h-g4-4",
  "kind": "rooms",
  "title": "ファルクの家／2階 ロルフの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "floor": 1,
  "room_name": "ロルフの寝室",
  "use": "寝",
  "occupants": [
    "ロルフ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#BB....LL.#",
      "#BB....LL.#",
      "#BB.......#",
      "#BB.......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-h-g4-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ロルフの寝台",
      "owner": "ロルフ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ロルフが手入れする案",
      "maintainers": [
        "resident-ロルフ"
      ],
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ロルフの寝台を使う",
          "rect": [
            3,
            1,
            2,
            4
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "L",
      "name": "ロルフの衣服箱",
      "owner": "ロルフ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ロルフが手入れする案",
      "maintainers": [
        "resident-ロルフ"
      ],
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ロルフの衣服箱を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g4-4-1",
      "resident": "resident-ロルフ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g4-4-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g4",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g4-4-1",
      "resident": "resident-ロルフ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "origin": [
    15,
    0
  ],
  "private_for": [
    "resident-ロルフ"
  ]
}
---
# ファルクの家／2階 ロルフの寝室

## 用途と暮らし

[[building-h-g4]] の平面案に属する。ロルフの個室とし、本人の寝台と衣服箱のIDを維持する。仕事をする二人の通り抜けを本人の寝室の用途へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#BB....LL.#
#BB....LL.#
#BB.......#
#BB.......#
#.........#
#.........#
#.........#
#.........#
#.........#
####DD#####
```
