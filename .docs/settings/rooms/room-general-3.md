---
{
  "id": "room-general-3",
  "kind": "rooms",
  "title": "ブルーノの道具屋／2階 ブルーノの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-general",
  "floor": 1,
  "room_name": "2階 ブルーノの部屋",
  "use": "寝",
  "occupants": [
    "ブルーノ"
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
      "target": "room-general-upper-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ブルーノの個別寝台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
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
          "activity": "ブルーノの個別寝台を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
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
      "role": "storage"
    },
    {
      "symbol": "E",
      "name": "私用の帳面の卓",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
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
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家、戸・窓・梁と地形は未照合",
    "商品の容量と重量・搬送、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-general-3-1",
      "resident": "resident-ブルーノ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "個人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-general-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-general",
    "resident-ブルーノ"
  ],
  "personal_storage": [
    {
      "id": "storage-general-3-1",
      "resident": "resident-ブルーノ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ブルーノ"
  ]
}
---
# ブルーノの道具屋／2階 ブルーノの部屋

## 用途と暮らし

[[building-general]] の平面案に属する。ブルーノの寝台と衣服箱のID・寸法と使用面を維持する。私用の帳面と店の仕入帳・売り物を混ぜず、客を寝具の場所へ通さない。

## 未解決の条件

戸の開閉と視線・音、商品の量と容量、荷物を持つ身体と段差、火と煙・灰と換気、衣服と寝具の手入れ、仕事と休息・日課は未照合である。現行の建物の位置と描画は切り替えない。敷地と立体は建物資料へ結ぶ。

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
