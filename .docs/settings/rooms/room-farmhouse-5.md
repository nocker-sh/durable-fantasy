---
{
  "id": "room-farmhouse-5",
  "kind": "rooms",
  "title": "カールとウルリケの家／1階 作男の寝間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "floor": 0,
  "room_name": "作男の寝間",
  "use": "寝",
  "occupants": [
    "ヴァルター"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##DD###",
      "#...CC#",
      "#.....#",
      "#.....#",
      "#...AA#",
      "#...AA#",
      "#...AA#",
      "#...AA#",
      "#.....#",
      "#######"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-farmhouse-1",
      "door": [
        2,
        0
      ],
      "width_cells": 2,
      "target_door": [
        11,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "ヴァルターの個別寝台",
      "owner": "ヴァルター",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        4,
        4,
        2,
        4
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ヴァルターの個別寝台を使う",
          "rect": [
            2,
            4,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "ヴァルターの個人収納",
      "owner": "ヴァルター",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        4,
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
          "activity": "ヴァルターの個人収納を使う",
          "rect": [
            2,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "ヴァルター"
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
      "id": "bed-farmhouse-5-1",
      "resident": "resident-ヴァルター",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "寝台と個別収納の占有・使用面を平面案へ配置。容量と開閉は未照合",
      "storage_id": "storage-farmhouse-5-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-farmhouse",
    "resident-ヴァルター"
  ],
  "personal_storage": [
    {
      "id": "storage-farmhouse-5-1",
      "resident": "resident-ヴァルター",
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
    9,
    14
  ],
  "private_for": [
    "resident-ヴァルター"
  ]
}
---
# カールとウルリケの家／1階 作男の寝間

## 住み込みの作男の私室

ヴァルターは住み込みの作男であり、ゲルトルートの配偶者ではない。個別の寝台と個人収納を持つ私室を地上階に置き、家族の寝室と共用しない。家庭の食卓には同じ一席を持つ。農具・飼料・収穫物は寝間へ積まず、畑から帰った衣服と私物を分けて扱う。

## 平面案

一セルは半メートル。

```grid
##DD###
#...CC#
#.....#
#.....#
#...AA#
#...AA#
#...AA#
#...AA#
#.....#
#######
```
