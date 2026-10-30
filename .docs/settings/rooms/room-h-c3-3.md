---
{
  "id": "room-h-c3-3",
  "kind": "rooms",
  "title": "エマの家／2階 エマの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "floor": 1,
  "room_name": "2階 エマの寝室",
  "use": "寝",
  "occupants": [
    "エマ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "########",
      "#BB....#",
      "#BB....#",
      "#BB....#",
      "#BB....#",
      "#......#",
      "#......#",
      "#LL....#",
      "#LL....#",
      "#......#",
      "###DD###"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        10
      ],
      "width_cells": 2,
      "target": "room-h-c3-upper-hall",
      "target_door": [
        3,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "エマの寝台",
      "owner": "エマ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
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
          "activity": "エマの寝台を使う",
          "rect": [
            3,
            1,
            2,
            4
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "L",
      "name": "エマの衣服箱",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
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
          "activity": "エマの衣服箱を使う",
          "rect": [
            3,
            7,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c3-3-1",
      "resident": "resident-エマ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c3-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "personal_storage": [
    {
      "id": "storage-h-c3-3-1",
      "resident": "resident-エマ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-エマ"
  ]
}
---
# エマの家／2階 エマの寝室

## 用途と暮らし

[[building-h-c3]] の平面案に属する。エマの個室として本人の寝台と衣服箱を持つ。家族が仕事の籠や柳を本人の寝具の横へ仮置きしない。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
########
#BB....#
#BB....#
#BB....#
#BB....#
#......#
#......#
#LL....#
#LL....#
#......#
###DD###
```
