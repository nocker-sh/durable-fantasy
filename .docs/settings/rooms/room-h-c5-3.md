---
{
  "id": "room-h-c5-3",
  "kind": "rooms",
  "title": "ベルンハルトの家／2階 ベルンハルトとモニカの寝室",
  "status": "設計中",
  "source": "apps/main/world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "floor": 1,
  "room_name": "ベルンハルトとモニカの寝室",
  "use": "寝",
  "occupants": [
    "ベルンハルト",
    "モニカ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###############",
      "#BB.....MM....#",
      "#BB.....MM....#",
      "#BB.....MM....#",
      "#BB.....MM....#",
      "#.............#",
      "#.............#",
      "#LL.....NN....#",
      "#LL.....NN....#",
      "#.............#",
      "###DD##########"
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
    },
    {
      "symbol": "M",
      "name": "モニカの寝台",
      "owner": "モニカ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        8,
        1,
        2,
        4
      ],
      "access": [
        [
          10,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "モニカの寝台を使う",
          "rect": [
            10,
            1,
            2,
            4
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "N",
      "name": "モニカの衣服箱",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        8,
        7,
        2,
        2
      ],
      "access": [
        [
          10,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "モニカの衣服箱を使う",
          "rect": [
            10,
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
    },
    {
      "id": "bed-h-c5-3-2",
      "resident": "resident-モニカ",
      "kind": "個別寝台",
      "grid_symbol": "M",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c5-3-2",
      "storage_symbol": "N"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ"
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
    },
    {
      "id": "storage-h-c5-3-2",
      "resident": "resident-モニカ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "N",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ"
  ]
}
---

# ベルンハルトの家／2階 ベルンハルトとモニカの寝室

## 用途と暮らし

[[building-h-c5]] の平面案に属する。夫婦のベルンハルトとモニカが一つの寝室を使い、それぞれの寝台と衣服箱を持つ。西にベルンハルト、東にモニカの寝台と箱を置き、着替えと寝具を整える床を本人ごとに取る。灰を売る荷と注文の帳面、煤の付いた仕事着を寝具の横へ積まない。弟子のトビアスは別の部屋で寝る。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###############
#BB.....MM....#
#BB.....MM....#
#BB.....MM....#
#BB.....MM....#
#.............#
#.............#
#LL.....NN....#
#LL.....NN....#
#.............#
###DD##########
```
