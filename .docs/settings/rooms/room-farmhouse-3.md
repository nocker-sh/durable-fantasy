---
{
  "id": "room-farmhouse-3",
  "kind": "rooms",
  "title": "カールとウルリケの家／2階 子ども部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "floor": 1,
  "room_name": "子ども部屋",
  "use": "寝",
  "occupants": [
    "カール",
    "ウルリケ",
    "フリッツ",
    "ミア"
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
        20
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "フリッツの個別寝台",
      "owner": "フリッツ",
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
          "activity": "フリッツの個別寝台を使う",
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
      "name": "フリッツの個人収納",
      "owner": "フリッツ",
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
          "activity": "フリッツの個人収納を使う",
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
        "フリッツ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "B",
      "name": "ミアの個別寝台",
      "owner": "ミア",
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
          "activity": "ミアの個別寝台を使う",
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
      "name": "ミアの個人収納",
      "owner": "ミア",
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
          "activity": "ミアの個人収納を使う",
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
        "ミア"
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
      "id": "bed-farmhouse-3-1",
      "resident": "resident-フリッツ",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-3-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-farmhouse-3-2",
      "resident": "resident-ミア",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-3-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-farmhouse",
    "resident-フリッツ",
    "resident-ミア"
  ],
  "personal_storage": [
    {
      "id": "storage-farmhouse-3-1",
      "resident": "resident-フリッツ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    },
    {
      "id": "storage-farmhouse-3-2",
      "resident": "resident-ミア",
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
    12
  ],
  "private_for": [
    "resident-カール",
    "resident-ウルリケ",
    "resident-フリッツ",
    "resident-ミア"
  ]
}
---
# カールとウルリケの家／2階 子ども部屋

## 子ども二人の寝床

フリッツとミアに一つずつ寝台と個人収納を置く。親の寝室を通らず共用通路から入る。見守りと寝具の手入れのためカールとウルリケも入れるが、部屋を農具や売り物の保管場所に使わない。

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
###########
```
