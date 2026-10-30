---
{
  "id": "room-h-c5-3",
  "kind": "rooms",
  "title": "ベルンハルトの家／2階 ベルンハルトの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "floor": 1,
  "room_name": "ベルンハルトの寝室",
  "use": "寝",
  "occupants": [
    "ベルンハルト"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "########",
      "#BB....#",
      "#BB....#",
      "#BB....#",
      "#BB....#",
      "#......#",
      "#......#",
      "#LL....#",
      "#LL....#",
      "#......#",
      "###DD###"
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
        3,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ベルンハルトの寝台",
      "owner": "ベルンハルト",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
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
          "activity": "ベルンハルトの寝台を使う",
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
      "name": "ベルンハルトの衣服箱",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
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
          "activity": "ベルンハルトの衣服箱を使う",
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
      "id": "bed-h-c5-3-1",
      "resident": "resident-ベルンハルト",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c5-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト"
  ],
  "personal_storage": [
    {
      "id": "storage-h-c5-3-1",
      "resident": "resident-ベルンハルト",
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
    "resident-ベルンハルト"
  ]
}
---
# ベルンハルトの家／2階 ベルンハルトの寝室

## 用途と暮らし

[[building-h-c5]] の平面案に属する。ベルンハルトの個室として本人の寝台と衣服箱を持つ。他の同居人の寝室や荷の保管を本人の私物の区画へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
########
#BB....#
#BB....#
#BB....#
#BB....#
#......#
#......#
#LL....#
#LL....#
#......#
###DD###
```
