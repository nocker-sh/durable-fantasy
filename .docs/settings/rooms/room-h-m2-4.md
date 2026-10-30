---
{
  "id": "room-h-m2-4",
  "kind": "rooms",
  "title": "アガーテのろうそく屋／2階 フェリックスの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "floor": 1,
  "room_name": "2階 フェリックスの寝室",
  "use": "寝",
  "occupants": [
    "アガーテ",
    "ジーモン",
    "フェリックス"
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
      "target": "room-h-m2-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "フェリックスの寝台",
      "owner": "フェリックス",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。アガーテが寝具と衣服を手入れし、フェリックスが片付ける案",
      "maintainers": [
        "resident-アガーテ",
        "resident-フェリックス"
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
          "activity": "フェリックスの寝台を使う",
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
      "name": "フェリックスの衣服箱",
      "owner": "フェリックス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが寝具と衣服を手入れし、フェリックスが片付ける案",
      "maintainers": [
        "resident-アガーテ",
        "resident-フェリックス"
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
          "activity": "フェリックスの衣服箱を使う",
          "rect": [
            5,
            1,
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
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-m2-4-1",
      "resident": "resident-フェリックス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-m2-4-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "personal_storage": [
    {
      "id": "storage-h-m2-4-1",
      "resident": "resident-フェリックス",
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
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ]
}
---
# アガーテのろうそく屋／2階 フェリックスの寝室

## 用途と暮らし

[[building-h-m2]] の平面案に属する。フェリックスの寝床を上階の個室へ移す案とする。本人の寝床と衣服箱のIDを維持する。両親は寝具と衣服の世話に入れるようにし、熱い蝋の部屋を通らない家族の入口と共用階段につなぐ。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
#.........#
####DD#####
```
