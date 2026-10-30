---
{
  "id": "room-h-c3-niklas",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 1,
  "title": "エマの家／2階 ニクラスの寝室",
  "room_name": "2階 ニクラスの寝室",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    12,
    0
  ],
  "use": "寝",
  "occupants": [
    "ニクラス"
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ニクラスの寝台",
      "owner": "ニクラス",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ニクラスが手入れする案",
      "maintainers": [
        "resident-ニクラス"
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
          "activity": "ニクラスの寝台を使う",
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
      "name": "ニクラスの衣服箱",
      "owner": "ニクラス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ニクラスが手入れする案",
      "maintainers": [
        "resident-ニクラス"
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
          "activity": "ニクラスの衣服箱を使う",
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
        10,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "private_for": [
    "resident-ニクラス"
  ],
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
  "sleeping_places": [
    {
      "id": "bed-h-c3-3-2",
      "resident": "resident-ニクラス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c3-3-2",
      "storage_symbol": "L"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-h-c3-3-2",
      "resident": "resident-ニクラス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "guest_capacity": 0
}
---
# エマの家／2階 ニクラスの寝室

## 用途と暮らし

[[building-h-c3]] の平面案に属する。ニクラスの個室として本人の寝台と衣服箱を持つ。木工所へ働きに出る既存の仕事を保ち、エマの仕事部屋の常勤の担当へ置き換えない。

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
