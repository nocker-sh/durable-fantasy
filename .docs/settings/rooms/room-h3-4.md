---
{
  "id": "room-h3-4",
  "kind": "rooms",
  "title": "ヤコブとエルザの家／1階 子どもの寝間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h3",
  "floor": 0,
  "room_name": "子どもの寝間",
  "use": "寝",
  "occupants": [
    "パウル",
    "レナ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD###",
      "#........#",
      "#AA....BB#",
      "#AA....BB#",
      "#AA....BB#",
      "#AA....BB#",
      "#CC....FF#",
      "##########"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h3-2",
      "door": [
        5,
        0
      ],
      "width_cells": 2,
      "target_door": [
        5,
        10
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "パウルの寝台",
      "owner": "パウル",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "パウルの寝台を使う",
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
      "name": "レナの寝台",
      "owner": "レナ",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "レナの寝台を使う",
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
      "symbol": "C",
      "name": "パウルの衣服箱",
      "owner": "パウル",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        1,
        6,
        2,
        1
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "パウルの衣服箱を使う",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "パウル"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    },
    {
      "symbol": "F",
      "name": "レナの衣服箱",
      "owner": "レナ",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        6,
        2,
        1
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "レナの衣服箱を使う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "レナ"
      ],
      "compartments": [
        "本人専用の箱"
      ]
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h3-4-1",
      "resident": "resident-パウル",
      "kind": "個別寝台",
      "grid_symbol": "A",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h3-4-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h3-4-2",
      "resident": "resident-レナ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "家具の占有と使用面を配置。容量と開閉は未照合",
      "storage_id": "storage-h3-4-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h3",
    "resident-パウル",
    "resident-レナ"
  ],
  "personal_storage": [
    {
      "id": "storage-h3-4-1",
      "resident": "resident-パウル",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人専用の箱"
    },
    {
      "id": "storage-h3-4-2",
      "resident": "resident-レナ",
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
    6,
    10
  ],
  "private_for": [
    "resident-パウル",
    "resident-レナ"
  ]
}
---
# ヤコブとエルザの家／1階 子どもの寝間

## 地上の子どもの寝間

パウルとレナは地上の寝間にそれぞれ寝台を持つ。子どもだから狭い寝床でよいとはせず、成長後も使える長さと側面の使用場所を確保する。衣服と首巻きは本人専用の箱へ分け、漁の濡れた道具と同じ場所へしまわない。

台所から中央の通路を通り、それぞれの寝台と衣服箱へ進む。ほかの部屋への通り抜けはない。共有する寝間の目隠しと将来の分室、調理の音と煙、窓と換気、夜の見守りは未解決として残す。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
#####DD###
#........#
#AA....BB#
#AA....BB#
#AA....BB#
#AA....BB#
#CC....FF#
##########
```
