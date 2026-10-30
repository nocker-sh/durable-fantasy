---
{
  "id": "room-h-m1-3",
  "kind": "rooms",
  "title": "エーリヒの家／2階 ハンナの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "floor": 1,
  "room_name": "2階 ハンナの寝室",
  "use": "寝",
  "occupants": [
    "エーリヒ",
    "マリー",
    "ハンナ"
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
      "target": "room-h-m1-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ハンナの寝台",
      "owner": "ハンナ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。マリーが寝具と衣服を手入れし、ハンナが片付ける案",
      "maintainers": [
        "resident-マリー",
        "resident-ハンナ"
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
          "activity": "ハンナの寝台を使う",
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
      "name": "ハンナの衣服箱",
      "owner": "ハンナ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。マリーが寝具と衣服を手入れし、ハンナが片付ける案",
      "maintainers": [
        "resident-マリー",
        "resident-ハンナ"
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
          "activity": "ハンナの衣服箱を使う",
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
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-m1-3-1",
      "resident": "resident-ハンナ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-m1-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-m1-3-1",
      "resident": "resident-ハンナ",
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
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ]
}
---
# エーリヒの家／2階 ハンナの寝室

## 用途と暮らし

[[building-h-m1]] の平面案に属する。ハンナの寝室として本人の寝台と衣服箱を持つ。両親は寝具と衣服の世話に入れるようにする。紙を仕事の預かり書類と混ぜず、本人の私物の置き先を維持する。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
