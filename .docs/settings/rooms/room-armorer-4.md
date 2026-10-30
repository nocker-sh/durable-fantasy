---
{
  "id": "room-armorer-4",
  "kind": "rooms",
  "title": "ベアトリクスの防具屋／2階 ルイーゼの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "floor": 1,
  "room_name": "2階 ルイーゼの寝室",
  "use": "寝",
  "occupants": [
    "ルイーゼ"
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
      "target": "room-armorer-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ルイーゼの寝台",
      "owner": "ルイーゼ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ルイーゼが手入れする案",
      "maintainers": [
        "resident-ルイーゼ"
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
          "activity": "ルイーゼの寝台を使う",
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
      "name": "ルイーゼの衣服箱",
      "owner": "ルイーゼ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ルイーゼが手入れする案",
      "maintainers": [
        "resident-ルイーゼ"
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
          "activity": "ルイーゼの衣服箱を使う",
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
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-armorer-4-1",
      "resident": "resident-ルイーゼ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-armorer-4-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "personal_storage": [
    {
      "id": "storage-armorer-4-1",
      "resident": "resident-ルイーゼ",
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
    "resident-ルイーゼ"
  ]
}
---
# ベアトリクスの防具屋／2階 ルイーゼの寝室

## 用途と暮らし

[[building-armorer]] の平面案に属する。住み込みの見習いルイーゼの個室として本人の寝台と衣服箱を持つ。材料や防具を本人の衣服箱へ収める代用にしない。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
