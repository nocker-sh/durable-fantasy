---
{
  "id": "room-farmhouse-4",
  "kind": "rooms",
  "title": "カールとウルリケの家／1階 ゲルトルートの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "floor": 0,
  "room_name": "ゲルトルートの部屋",
  "use": "寝",
  "occupants": [
    "ゲルトルート",
    "ミア"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD###",
      "#CC......#",
      "#AA......#",
      "#AA......#",
      "#AA......#",
      "#AA...GG.#",
      "#.....GG.#",
      "#.....H..#",
      "#........#",
      "##########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-farmhouse-1",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target_door": [
        5,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "ゲルトルートの個別寝台",
      "owner": "ゲルトルート",
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
          "activity": "ゲルトルートの個別寝台を使う",
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
      "name": "ゲルトルートの個人収納",
      "owner": "ゲルトルート",
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
          "activity": "ゲルトルートの個人収納を使う",
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
        "ゲルトルート"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "G",
      "name": "ゲルトルートの糸車",
      "owner": "ゲルトルート",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        6,
        5,
        2,
        2
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ゲルトルートの糸車を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "H"
      ]
    },
    {
      "symbol": "H",
      "name": "糸紡ぎの椅子",
      "owner": "ゲルトルート",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        6,
        7,
        1,
        1
      ],
      "access": [
        [
          5,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "糸紡ぎの椅子を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "戸と窓・煙突・梁、身体の操作と頭上高の立体は未照合",
    "給排水・便所・薪と灰、収納容量・寝具の乾燥と日課・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-farmhouse-4-1",
      "resident": "resident-ゲルトルート",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-4-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-farmhouse",
    "resident-ゲルトルート"
  ],
  "personal_storage": [
    {
      "id": "storage-farmhouse-4-1",
      "resident": "resident-ゲルトルート",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    }
  ],
  "origin": [
    0,
    14
  ],
  "private_for": [
    "resident-ゲルトルート",
    "resident-ミア"
  ]
}
---
# カールとウルリケの家／1階 ゲルトルートの部屋

## 地上階で眠り糸を紡ぐ祖母

ゲルトルートの個別寝台と衣服の箱を持つ。食卓と入口へ階段を使わず行け、他の寝室や食品棚への通り道にしない。糸車と椅子を寝台から分けて置き、ミアだけが糸車に触るという関係に合わせて立入りを認める。毛糸の収納量、作業中の使い分けと日課、寝具の乾燥と夜の用便は未照合である。

## 平面案

一セルは半メートル。

```grid
#####DD###
#CC......#
#AA......#
#AA......#
#AA......#
#AA...GG.#
#.....GG.#
#.....H..#
#........#
##########
```
