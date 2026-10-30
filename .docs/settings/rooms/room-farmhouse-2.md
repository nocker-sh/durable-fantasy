---
{
  "id": "room-farmhouse-2",
  "kind": "rooms",
  "title": "カールとウルリケの家／2階 夫婦の寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "floor": 1,
  "room_name": "夫婦の寝室",
  "use": "寝",
  "occupants": [
    "カール",
    "ウルリケ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#CC....FF.#",
      "#AA....BB.#",
      "#AA....BB.#",
      "#AA....BB.#",
      "#AA....BB.#",
      "#.........#",
      "#.........#",
      "D.........#",
      "D.........#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-farmhouse-stairs",
      "door": [
        0,
        8
      ],
      "width_cells": 2,
      "target_door": [
        5,
        8
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "カールの個別寝台",
      "owner": "カール",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        1,
        2,
        2,
        4
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "カールの個別寝台を使う",
          "rect": [
            3,
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
      "name": "カールの個人収納",
      "owner": "カール",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "カールの個人収納を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "カール"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "B",
      "name": "ウルリケの個別寝台",
      "owner": "ウルリケ",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        7,
        2,
        2,
        4
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ウルリケの個別寝台を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "F",
      "name": "ウルリケの個人収納",
      "owner": "ウルリケ",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        7,
        1,
        2,
        1
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ウルリケの個人収納を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ウルリケ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    }
  ],
  "issues": [
    "戸と窓・煙突・梁、身体の操作と頭上高の立体は未照合",
    "給排水・便所・薪と灰、収納容量・寝具の乾燥と日課・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-farmhouse-2-1",
      "resident": "resident-カール",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-farmhouse-2-2",
      "resident": "resident-ウルリケ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-2-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-farmhouse",
    "resident-カール",
    "resident-ウルリケ"
  ],
  "personal_storage": [
    {
      "id": "storage-farmhouse-2-1",
      "resident": "resident-カール",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    },
    {
      "id": "storage-farmhouse-2-2",
      "resident": "resident-ウルリケ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人専用の箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-カール",
    "resident-ウルリケ"
  ]
}
---
# カールとウルリケの家／2階 夫婦の寝室

## 夫婦の寝床

カールとウルリケに別々の寝台と衣服の箱を割り当てる。共用通路から入る私室とし、子ども部屋への通り道にしない。畑の作業着と清潔な寝具の受渡し、屋根の灰下ろしと乾燥は未照合である。

## 平面案

一セルは半メートル。壁と戸口は建物の原点で合わせる。

```grid
###########
#CC....FF.#
#AA....BB.#
#AA....BB.#
#AA....BB.#
#AA....BB.#
#.........#
#.........#
D.........#
D.........#
#.........#
#.........#
###########
```
