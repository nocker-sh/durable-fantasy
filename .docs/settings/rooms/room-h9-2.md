---
{
  "id": "room-h9-2",
  "kind": "rooms",
  "title": "アウグストの家／1階 寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h9",
  "floor": 0,
  "room_name": "寝室",
  "use": "寝",
  "occupants": [
    "アウグスト",
    "ヘートヴィヒ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD###########",
      "#CC..........FF..#",
      "#AA..........BB..#",
      "#AA..........BB..#",
      "#AA..........BB..#",
      "#AA..........BB..#",
      "##################"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h9-1",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target_door": [
        5,
        13
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "アウグストの個別寝台",
      "owner": "アウグスト",
      "source": "町の木工所で製作し、世帯が修理して使う案",
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
          "activity": "アウグストの個別寝台を使う",
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
      "symbol": "B",
      "name": "ヘートヴィヒの個別寝台",
      "owner": "ヘートヴィヒ",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        13,
        2,
        2,
        4
      ],
      "access": [
        [
          12,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ヘートヴィヒの個別寝台を使う",
          "rect": [
            11,
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
      "name": "アウグストの個人収納",
      "owner": "アウグスト",
      "source": "町の木工所で製作し、世帯が修理して使う案",
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
          "activity": "アウグストの個人収納を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "owners": [
        "アウグスト"
      ],
      "compartments": [
        "アウグスト専用"
      ],
      "role": "storage"
    },
    {
      "symbol": "F",
      "name": "ヘートヴィヒの個人収納",
      "owner": "ヘートヴィヒ",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        13,
        1,
        2,
        1
      ],
      "access": [
        [
          12,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ヘートヴィヒの個人収納を使う",
          "rect": [
            11,
            1,
            2,
            2
          ]
        }
      ],
      "owners": [
        "ヘートヴィヒ"
      ],
      "compartments": [
        "ヘートヴィヒ専用"
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "戸の開閉・窓・換気・火気と頭上高の立体は未照合",
    "給排水・便所・燃料と灰・収納容量・日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h9-2-1",
      "resident": "resident-アウグスト",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "個別収納の占有と使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-h9-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h9-2-2",
      "resident": "resident-ヘートヴィヒ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "個別収納の占有と使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-h9-2-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h9",
    "resident-アウグスト",
    "resident-ヘートヴィヒ"
  ],
  "personal_storage": [
    {
      "id": "storage-h9-2-1",
      "resident": "resident-アウグスト",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "アウグスト専用"
    },
    {
      "id": "storage-h9-2-2",
      "resident": "resident-ヘートヴィヒ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "ヘートヴィヒ専用"
    }
  ],
  "origin": [
    0,
    13
  ],
  "private_for": [
    "resident-アウグスト",
    "resident-ヘートヴィヒ"
  ]
}
---
# アウグストの家／1階 寝室

## 地上階で眠る祖父母

二人に個別の寝台と個別の衣服収納を置く。仕事の預かり品や油を収納へ入れない。家の入口から上階へ行かずに寝室へ入れる。南側の細長い寝室を通り抜けの通路にしない。

窓からの視線、寝具を干す経路と夜間の用便は未照合である。

## 平面案

一セルは半メートル。戸口は共有壁の同じ位置へ合わせる。

```grid
#####DD###########
#CC..........FF..#
#AA..........BB..#
#AA..........BB..#
#AA..........BB..#
#AA..........BB..#
##################
```
