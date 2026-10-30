---
{
  "id": "room-h-c3-frieda",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 1,
  "title": "エマの家／2階 フリーダの寝室",
  "room_name": "2階 フリーダの寝室",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    19,
    0
  ],
  "use": "寝",
  "occupants": [
    "エマ",
    "フリーダ",
    "ローゼマリー"
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "フリーダの寝台",
      "owner": "フリーダ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。エマが寝具と衣服を手入れし、フリーダが片付ける案",
      "maintainers": [
        "resident-エマ",
        "resident-フリーダ"
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
          "activity": "フリーダの寝台を使う",
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
      "name": "フリーダの衣服箱",
      "owner": "フリーダ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。エマが寝具と衣服を手入れし、フリーダが片付ける案",
      "maintainers": [
        "resident-エマ",
        "resident-フリーダ"
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
          "activity": "フリーダの衣服箱を使う",
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
        17,
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
    "resident-エマ",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#######",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#BB...#",
      "#.....#",
      "#.....#",
      "#LL...#",
      "#LL...#",
      "#.....#",
      "###DD##"
    ]
  },
  "sleeping_places": [
    {
      "id": "bed-h-c3-3-3",
      "resident": "resident-フリーダ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c3-3-3",
      "storage_symbol": "L"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-h-c3-3-3",
      "resident": "resident-フリーダ",
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
# エマの家／2階 フリーダの寝室

## 用途と暮らし

[[building-h-c3]] の平面案に属する。フリーダの個室として本人の寝台と衣服箱を持つ。エマとローゼマリーは寝具と衣服の世話に入れるようにする。木工所の道具や仕事の柳を子どもの私物と混ぜない。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
#######
#BB...#
#BB...#
#BB...#
#BB...#
#.....#
#.....#
#LL...#
#LL...#
#.....#
###DD##
```
