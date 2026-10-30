---
{
  "id": "room-h9-3",
  "kind": "rooms",
  "title": "アウグストの家／2階 屋根裏",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h9",
  "floor": 1,
  "room_name": "屋根裏",
  "use": "生活",
  "occupants": [
    "アウグスト",
    "ヘートヴィヒ",
    "ティム"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#........CC.#",
      "#........AA.#",
      "#........AA.#",
      "#........AA.#",
      "#........AA.#",
      "#...........#",
      "D...........#",
      "D...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#......FFF..#",
      "#......FFF..#",
      "#...........#",
      "#...........#",
      "#############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h9-stairs",
      "door": [
        0,
        7
      ],
      "width_cells": 2,
      "target_door": [
        5,
        7
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "ティムの個別寝台",
      "owner": "ティム",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        9,
        2,
        2,
        4
      ],
      "access": [
        [
          8,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ティムの個別寝台を使う",
          "rect": [
            7,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "ティムの個人収納",
      "owner": "ティム",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        9,
        1,
        2,
        1
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ティムの個人収納を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "owners": [
        "ティム"
      ],
      "compartments": [
        "ティム専用"
      ],
      "role": "storage"
    },
    {
      "symbol": "F",
      "name": "家庭の替えの寝具棚",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        7,
        15,
        3,
        2
      ],
      "access": [
        [
          6,
          15
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の替えの寝具棚を使う",
          "rect": [
            5,
            15,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸の開閉・窓・換気・火気と頭上高の立体は未照合",
    "給排水・便所・燃料と灰・収納容量・日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h9-3-1",
      "resident": "resident-ティム",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "個別収納の占有と使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-h9-3-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h9",
    "resident-ティム"
  ],
  "personal_storage": [
    {
      "id": "storage-h9-3-1",
      "resident": "resident-ティム",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "ティム専用"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-アウグスト",
    "resident-ヘートヴィヒ",
    "resident-ティム"
  ]
}
---
# アウグストの家／2階 屋根裏

## ティムの寝床と家族の寝具

個別の寝台と衣服の区画を持つ。火屋を磨く手伝いは地上の修理台で行い、寝具のそばに油や破損した火屋を置かない。替えの寝具を家族が取り出すため祖父母の立入りを認めるが、寝室を別室への通路にしない。屋根の梁、換気、日差しと寝具の乾燥は未照合である。

## 平面案

一セルは半メートル。戸口は共有壁の同じ位置へ合わせる。

```grid
#############
#........CC.#
#........AA.#
#........AA.#
#........AA.#
#........AA.#
#...........#
D...........#
D...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#......FFF..#
#......FFF..#
#...........#
#...........#
#############
```
