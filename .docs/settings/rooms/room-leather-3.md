---
{
  "id": "room-leather-3",
  "kind": "rooms",
  "title": "ルドルフの革工房／2階 ルドルフの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-leather",
  "floor": 1,
  "room_name": "2階 ルドルフの部屋",
  "use": "寝",
  "occupants": [
    "ルドルフ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#BB....EEEE.#",
      "#BB....EEEE.#",
      "#BB.........#",
      "#BB.........#",
      "#...........#",
      "D...........#",
      "D...........#",
      "#LL.........#",
      "#LL.........#",
      "#...........#",
      "#############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-leather-upper-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ルドルフの個別寝台",
      "owner": "ルドルフ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ルドルフが手入れする案",
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
          "activity": "ルドルフの個別寝台を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        1,
        8,
        2,
        2
      ],
      "access": [
        [
          3,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "個人の衣服箱を使う",
          "rect": [
            3,
            8,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "E",
      "name": "私用の帳面の卓",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        7,
        1,
        4,
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
          "activity": "私用の帳面の卓を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ルドルフ"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-leather-3-1",
      "resident": "resident-ルドルフ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "個別の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-leather-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-leather",
    "resident-ルドルフ"
  ],
  "personal_storage": [
    {
      "id": "storage-leather-3-1",
      "resident": "resident-ルドルフ",
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
    5,
    0
  ],
  "private_for": [
    "resident-ルドルフ"
  ]
}
---
# ルドルフの革工房／2階 ルドルフの部屋

## 用途と暮らし

[[building-leather]] の平面案に属する。ルドルフの寝台と衣服箱を持つ。仕事に使った濡れた革と道具を寝具や衣服と混ぜない。仕事着の脱ぎ場と洗濯、臭気を遮る構造と換気は未照合である。

## 未解決の条件

敷地と構造、戸・窓・梁と換気、作業の水と汚れ・薬剤・皮の運搬、給排水と便所・家庭の火、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#############
#BB....EEEE.#
#BB....EEEE.#
#BB.........#
#BB.........#
#...........#
D...........#
D...........#
#LL.........#
#LL.........#
#...........#
#############
```
