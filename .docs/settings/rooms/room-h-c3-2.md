---
{
  "id": "room-h-c3-2",
  "kind": "rooms",
  "title": "エマの家／1階 ローゼマリーの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "floor": 0,
  "room_name": "1階 ローゼマリーの寝室",
  "use": "寝",
  "occupants": [
    "エマ",
    "ローゼマリー"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#BB....LL.#",
      "#BB....LL.#",
      "#BB.......#",
      "#BB.......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.C.......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-h-c3-entry",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ローゼマリーの寝台",
      "owner": "ローゼマリー",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ローゼマリーが手入れする案",
      "maintainers": [
        "resident-エマ",
        "resident-ローゼマリー"
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
          "activity": "ローゼマリーの寝台を使う",
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
      "name": "ローゼマリーの衣服箱",
      "owner": "ローゼマリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ローゼマリーが手入れする案",
      "maintainers": [
        "resident-エマ",
        "resident-ローゼマリー"
      ],
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ローゼマリーの衣服箱を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "C",
      "name": "休むための椅子",
      "owner": "ローゼマリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ローゼマリーが手入れする案",
      "maintainers": [
        "resident-エマ",
        "resident-ローゼマリー"
      ],
      "rect": [
        2,
        9,
        1,
        1
      ],
      "access": [
        [
          3,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "休むための椅子を使う",
          "rect": [
            3,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c3-2-1",
      "resident": "resident-ローゼマリー",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c3-2-1",
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
      "id": "storage-h-c3-2-1",
      "resident": "resident-ローゼマリー",
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
    15,
    0
  ],
  "private_for": [
    "resident-エマ",
    "resident-ローゼマリー"
  ]
}
---
# エマの家／1階 ローゼマリーの寝室

## 用途と暮らし

[[building-h-c3]] の平面案に属する。ローゼマリーの寝床を現行どおり地上階へ保ち、本人の寝台と衣服箱を持つ。エマは寝具と衣服の世話に入れる。仕事場と家庭の食事へ階段を必須にせず、他人の寝床を通り抜けない。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#BB....LL.#
#BB....LL.#
#BB.......#
#BB.......#
#.........#
#.........#
#.........#
#.........#
#.C.......#
#.........#
#.........#
#.........#
#.........#
####DD#####
```
