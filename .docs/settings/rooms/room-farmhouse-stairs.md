---
{
  "id": "room-farmhouse-stairs",
  "kind": "rooms",
  "title": "カールとウルリケの家／2階 階段と共用通路",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "bed_capacity": 0,
  "status": "設計中",
  "design_gate": "未通過",
  "room_name": "階段と共用通路",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "occupants": [
    "カール",
    "ウルリケ",
    "フリッツ",
    "ミア",
    "ゲルトルート",
    "ヴァルター"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "地上階とつながる直階段",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "地上階とつながる直階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "F",
      "name": "替えの寝具棚",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        1,
        20,
        2,
        2
      ],
      "access": [
        [
          3,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "替えの寝具棚を使う",
          "rect": [
            3,
            20,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "stair",
      "target": "room-farmhouse-1",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        3,
        12
      ]
    },
    {
      "kind": "door",
      "target": "room-farmhouse-2",
      "door": [
        5,
        8
      ],
      "width_cells": 2,
      "target_door": [
        0,
        8
      ]
    },
    {
      "kind": "door",
      "target": "room-farmhouse-3",
      "door": [
        5,
        20
      ],
      "width_cells": 2,
      "target_door": [
        0,
        8
      ]
    }
  ],
  "issues": [
    "戸と窓・煙突・梁、身体の操作と頭上高の立体は未照合",
    "給排水・便所・薪と灰、収納容量・寝具の乾燥と日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-farmhouse"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#FF..D",
      "#FF..D",
      "#....#",
      "######"
    ]
  }
}
---
# カールとウルリケの家／2階 階段と共用通路

## 共用通路と寝具

共用の踊り場から夫婦と子どもの寝室へ別々に入る。替えの寝具を通路の棚へ置き、寝室を通り抜けて取り出す形にしない。通路へ収穫物と農具を仮置きしない。

## 平面案

一セルは半メートル。壁と戸口は建物の原点で合わせる。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
#SS..#
#SS..#
#SS..#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#FF..D
#FF..D
#....#
######
```
