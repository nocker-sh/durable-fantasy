---
{
  "id": "room-h-c5-tobias",
  "kind": "rooms",
  "title": "ベルンハルトの家／2階 トビアスの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "floor": 1,
  "room_name": "トビアスの寝室",
  "use": "寝",
  "occupants": [
    "ベルンハルト",
    "モニカ",
    "トビアス"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#######",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#.....#",
      "#.....#",
      "#LL...#",
      "#LL...#",
      "#.....#",
      "###DD##"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        10
      ],
      "width_cells": 2,
      "target": "room-h-c5-upper-hall",
      "target_door": [
        17,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "トビアスの寝台",
      "owner": "トビアス",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。モニカが寝具と衣服を手入れし、トビアスが片付ける案",
      "maintainers": [
        "resident-モニカ",
        "resident-トビアス"
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
          "activity": "トビアスの寝台を使う",
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
      "name": "トビアスの衣服箱",
      "owner": "トビアス",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。モニカが寝具と衣服を手入れし、トビアスが片付ける案",
      "maintainers": [
        "resident-モニカ",
        "resident-トビアス"
      ],
      "rect": [
        1,
        7,
        2,
        2
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "トビアスの衣服箱を使う",
          "rect": [
            3,
            7,
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
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c5-3-3",
      "resident": "resident-トビアス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c5-3-3",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "personal_storage": [
    {
      "id": "storage-h-c5-3-3",
      "resident": "resident-トビアス",
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
    19,
    0
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ]
}
---
# ベルンハルトの家／2階 トビアスの寝室

## 用途と暮らし

[[building-h-c5]] の平面案に属する。住み込みの弟子トビアスの個室として本人の寝台と衣服箱を持つ。ベルンハルトとモニカは寝具と衣服の世話に入れるようにする。仕事の刷毛と煤の付いた衣服を寝具や本人の清潔な衣服と混ぜない。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
#######
#BB...#
#BB...#
#BB...#
#BB...#
#.....#
#.....#
#LL...#
#LL...#
#.....#
###DD##
```
