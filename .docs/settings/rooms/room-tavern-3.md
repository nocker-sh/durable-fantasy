---
{
  "id": "room-tavern-3",
  "kind": "rooms",
  "title": "フランツの酒場／2階 フランツの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "floor": 1,
  "room_name": "2階 フランツの部屋",
  "use": "寝",
  "occupants": [
    "フランツ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#BB.......#",
      "#BB.......#",
      "#BB.......#",
      "#BB.......#",
      "#.........#",
      "#.........#",
      "#LL.......#",
      "#LL.......#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-tavern-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "個別の寝台",
      "owner": "フランツ",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。フランツが手入れする案",
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
        "resident-フランツ"
      ]
    },
    {
      "symbol": "L",
      "name": "個人の衣服箱",
      "owner": "フランツ",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        1,
        7,
        2,
        2
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "個人の衣服箱を使う",
          "rect": [
            3,
            7,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-フランツ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-tavern-3-1",
      "resident": "resident-フランツ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "専用の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-tavern-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-tavern",
    "resident-フランツ"
  ],
  "personal_storage": [
    {
      "id": "storage-tavern-3-1",
      "resident": "resident-フランツ",
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
    "resident-フランツ"
  ]
}
---
# フランツの酒場／2階 フランツの部屋

## 用途と配置

[[building-tavern]] の平面案に属する。客席と住み込みの寝間の通り抜けを分け、用途ごとの物と使う身体を配置する。

## 未解決の生活

フランツ自身の寝台と衣服箱は住み込みの二人の寝間と分ける。醸造と店の仕事を終えた後の食事・身支度と休息、寝具の容量と手入れ、灯りと窓・換気、上階へ運ぶ私物の経路は未照合である。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
###########
#BB.......#
#BB.......#
#BB.......#
#BB.......#
#.........#
#.........#
#LL.......#
#LL.......#
#.........#
####DD#####
```
