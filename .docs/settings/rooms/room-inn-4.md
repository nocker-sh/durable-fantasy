---
{
  "id": "room-inn-4",
  "kind": "rooms",
  "title": "ゲルダの宿／2階 ゼップの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-inn",
  "floor": 1,
  "room_name": "2階 ゼップの部屋",
  "use": "寝",
  "occupants": [
    "ゼップ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#########",
      "#BB.....#",
      "#BB.....#",
      "#BB.....#",
      "#BB.....#",
      "#.......#",
      "#LL.....#",
      "#LL.....#",
      "#.......#",
      "###DD####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        9
      ],
      "width_cells": 2,
      "target": "room-inn-hall",
      "target_door": [
        11,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "個別寝台",
      "owner": "ゼップ",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ゼップが手入れする案",
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
          "activity": "個別寝台を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "maintainers": [
        "resident-ゼップ"
      ]
    },
    {
      "symbol": "L",
      "name": "衣服箱",
      "owner": "ゼップ",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゼップが手入れする案",
      "rect": [
        1,
        6,
        2,
        2
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服箱を使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ゼップ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-inn-4-1",
      "resident": "resident-ゼップ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "固有の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-inn-4-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-inn",
    "resident-ゼップ"
  ],
  "personal_storage": [
    {
      "id": "storage-inn-4-1",
      "resident": "resident-ゼップ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "専用の衣服箱"
    }
  ],
  "origin": [
    13,
    0
  ],
  "private_for": [
    "resident-ゼップ"
  ]
}
---
# ゲルダの宿／2階 ゼップの部屋

## 用途と配置

[[building-inn]] の平面案に属する。共用廊下から専用の戸を通って入る。寝台と衣服箱は一人ずつ分ける。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
#########
#BB.....#
#BB.....#
#BB.....#
#BB.....#
#.......#
#LL.....#
#LL.....#
#.......#
###DD####
```
