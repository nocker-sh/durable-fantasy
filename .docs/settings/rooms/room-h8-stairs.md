---
{
  "id": "room-h8-stairs",
  "kind": "rooms",
  "title": "オットーとクララの家／2階 階段と共用通路",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h8",
  "floor": 1,
  "room_name": "階段と共用通路",
  "use": "通路",
  "occupants": [
    "オットー",
    "クララ",
    "ヨナス"
  ],
  "bed_capacity": 0,
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
      "#SS..D",
      "#SS..D",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#....D",
      "#....D",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "stair",
      "target": "room-h8-1",
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
      "target": "room-h8-3",
      "door": [
        5,
        7
      ],
      "width_cells": 2,
      "target_door": [
        0,
        7
      ]
    },
    {
      "kind": "door",
      "target": "room-h8-4",
      "door": [
        5,
        13
      ],
      "width_cells": 2,
      "target_door": [
        0,
        3
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "西の直階段",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "西の直階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "design_dependencies": [
    "building-h8"
  ],
  "origin": [
    0,
    0
  ],
  "private_for": [
    "resident-オットー",
    "resident-クララ",
    "resident-ヨナス"
  ]
}
---
# オットーとクララの家／2階 階段と共用通路

## 家族の共用通路

階段を上がった床から両親の寝室とヨナスの寝間へ別々に進む。ヨナスの寝床へ行くために両親の寝台脇を通らず、両親の寝室へ行くためにヨナスを起こさない構成にする。果物籠や洗濯物、薪を通路に置かない。

この区画は現行の家具自動配置にない追加の平面案である。手すりと階段口の頭上高を断面で照合し、戸と目隠し、夜の灯り、梁と窓の立体は未解決として残す。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
######
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
#SS..#
#....D
#....D
#....#
#....#
#....#
#....#
######
```
