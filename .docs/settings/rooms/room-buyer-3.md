---
{
  "id": "room-buyer-3",
  "kind": "rooms",
  "title": "ラインホルトの買取所／2階 ラインホルトの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "floor": 1,
  "room_name": "2階 ラインホルトの寝室",
  "use": "寝",
  "occupants": [
    "ラインホルト"
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
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        11
      ],
      "width_cells": 2,
      "target": "room-buyer-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ラインホルトの寝台",
      "owner": "ラインホルト",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
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
          "activity": "ラインホルトの寝台を使う",
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
      "name": "ラインホルトの衣服箱",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
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
          "activity": "ラインホルトの衣服箱を使う",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-buyer-3-1",
      "resident": "resident-ラインホルト",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-buyer-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "personal_storage": [
    {
      "id": "storage-buyer-3-1",
      "resident": "resident-ラインホルト",
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
    "resident-ラインホルト"
  ]
}
---
# ラインホルトの買取所／2階 ラインホルトの寝室

## 用途と暮らし

[[building-buyer]] の平面案に属する。祖父ラインホルトの個室を持つ。本人の寝台と衣服箱を維持し、孫が倉と台所へ行くための通路にしない。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
#.........#
####DD#####
```
