---
{
  "id": "room-crystal-3",
  "kind": "rooms",
  "title": "コンスタンティンの結晶屋／2階 コンスタンティンの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-crystal",
  "floor": 1,
  "room_name": "2階 コンスタンティンの部屋",
  "use": "寝",
  "occupants": [
    "コンスタンティン"
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
      "target": "room-crystal-upper-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "コンスタンティンの個別寝台",
      "owner": "コンスタンティン",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。コンスタンティンが手入れする案",
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
          "activity": "コンスタンティンの個別寝台を使う",
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
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "E",
      "name": "私用の帳面の卓",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
        "resident-コンスタンティン"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-crystal-3-1",
      "resident": "resident-コンスタンティン",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-crystal-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-crystal",
    "resident-コンスタンティン"
  ],
  "personal_storage": [
    {
      "id": "storage-crystal-3-1",
      "resident": "resident-コンスタンティン",
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
    "resident-コンスタンティン"
  ]
}
---
# コンスタンティンの結晶屋／2階 コンスタンティンの部屋

## 用途と暮らし

[[building-crystal]] の平面案に属する。本人の個別寝台と衣服箱を持つ。売る結晶と商売の金庫を衣服箱へ収める代用にせず、個人の持ち物の区画を分ける。

## 未解決の条件

戸と窓・視線と音、結晶の仕入れと搬送・保管条件、錠と計量・商品の量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

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
