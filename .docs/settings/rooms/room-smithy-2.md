---
{
  "id": "room-smithy-2",
  "kind": "rooms",
  "title": "ギュンターの鍛冶場／2階 ギュンターの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-smithy",
  "floor": 1,
  "room_name": "ギュンターの部屋",
  "use": "寝",
  "occupants": [
    "ギュンター"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#BB.........#",
      "#BB.........#",
      "#BB.........#",
      "#BB.........#",
      "#...........#",
      "D...........#",
      "D...........#",
      "#LL.........#",
      "#LL.........#",
      "#...........#",
      "#############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-smithy-upper-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "個別の寝台",
      "owner": "ギュンター",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ギュンターが手入れする案",
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
          "activity": "個別の寝台を使う",
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
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "ギュンター",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        1,
        8,
        2,
        2
      ],
      "access": [
        [
          3,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "個人の衣服箱を使う",
          "rect": [
            3,
            8,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ギュンター"
      ]
    }
  ],
  "issues": [
    "火気と炭・火花・熱い加工品、換気と煙突・灰の隔離は未照合",
    "敷地と戸・窓・梁、給排水と便所、仕事と休息・日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-smithy-2-1",
      "resident": "resident-ギュンター",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "専用の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-smithy-2-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-smithy",
    "resident-ギュンター"
  ],
  "personal_storage": [
    {
      "id": "storage-smithy-2-1",
      "resident": "resident-ギュンター",
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
    5,
    0
  ],
  "private_for": [
    "resident-ギュンター"
  ]
}
---
# ギュンターの鍛冶場／2階 ギュンターの部屋

## 用途と暮らし

[[building-smithy]] の平面案に属する。ギュンターの寝台と衣服箱を持ち、共用階段から専用の戸で入る。熱い加工品と炭、見習いの私物を寝具の場所へ混ぜない。

## 現行との差と未解決の条件

現行の奥の相部屋から上階の個室と家庭の区画へ分ける提案であり、描画や日課を切替済みとはしない。建物の敷地、火と煙・灰と家庭の分離、戸の開閉と視線・音、衣服と寝具の手入れ、体の高さと姿勢を引き続き照合する。

```grid
#############
#BB.........#
#BB.........#
#BB.........#
#BB.........#
#...........#
D...........#
D...........#
#LL.........#
#LL.........#
#...........#
#############
```
