---
{
  "id": "room-smithy-peter",
  "kind": "rooms",
  "title": "ギュンターの鍛冶場／2階 ペーターの部屋",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-smithy",
  "bed_capacity": 1,
  "occupants": [
    "ペーター"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
  ],
  "room_name": "ペーターの部屋",
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
        17
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "個別の寝台",
      "owner": "ペーター",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ペーターが手入れする案",
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
        "resident-ペーター"
      ]
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "ペーター",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ペーターが手入れする案",
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
        "resident-ペーター"
      ]
    }
  ],
  "issues": [
    "火気と炭・火花・熱い加工品、換気と煙突・灰の隔離は未照合",
    "敷地と戸・窓・梁、給排水と便所、仕事と休息・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-smithy",
    "resident-ペーター"
  ],
  "guest_capacity": 0,
  "sleeping_places": [
    {
      "id": "bed-smithy-2-2",
      "resident": "resident-ペーター",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "専用の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-smithy-2-2",
      "storage_symbol": "L"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-smithy-2-2",
      "resident": "resident-ペーター",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "専用の衣服箱"
    }
  ],
  "private_for": [
    "resident-ペーター"
  ],
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
      "#############"
    ]
  }
}
---
# ギュンターの鍛冶場／2階 ペーターの部屋

## 用途と暮らし

[[building-smithy]] の平面案に属する。住み込みの見習いペーターの個室を持ち、主人の寝室を通らず共用階段から入る。寝台と衣服箱のIDと寸法を維持する。

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
#############
```
