---
{
  "id": "room-h-g4-3",
  "kind": "rooms",
  "title": "ファルクの家／2階 ファルクとブリギッテの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g4",
  "floor": 1,
  "room_name": "2階 ファルクとブリギッテの寝室",
  "use": "寝",
  "occupants": [
    "ファルク",
    "ブリギッテ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#BB.....CC#",
      "#BB.....CC#",
      "#BB.....CC#",
      "#BB.....CC#",
      "#.........#",
      "#.........#",
      "#LL.....MM#",
      "#LL.....MM#",
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
      "target": "room-h-g4-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ファルクの寝台",
      "owner": "ファルク",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
          "activity": "ファルクの寝台を使う",
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
      "symbol": "C",
      "name": "ブリギッテの寝台",
      "owner": "ブリギッテ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        8,
        1,
        2,
        4
      ],
      "access": [
        [
          7,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ブリギッテの寝台を使う",
          "rect": [
            6,
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
      "name": "ファルクの衣服箱",
      "owner": "ファルク",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ファルクが手入れする案",
      "maintainers": [
        "resident-ファルク"
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
          "activity": "ファルクの衣服箱を使う",
          "rect": [
            3,
            7,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "M",
      "name": "ブリギッテの衣服箱",
      "owner": "ブリギッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ブリギッテが手入れする案",
      "maintainers": [
        "resident-ブリギッテ"
      ],
      "rect": [
        8,
        7,
        2,
        2
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ブリギッテの衣服箱を使う",
          "rect": [
            6,
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
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g4-3-1",
      "resident": "resident-ファルク",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g4-3-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-g4-3-2",
      "resident": "resident-ブリギッテ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g4-3-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g4",
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g4-3-1",
      "resident": "resident-ファルク",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-g4-3-2",
      "resident": "resident-ブリギッテ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "M",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ファルク",
    "resident-ブリギッテ"
  ]
}
---
# ファルクの家／2階 ファルクとブリギッテの寝室

## 用途と暮らし

[[building-h-g4]] の平面案に属する。ファルクとブリギッテそれぞれの寝台と衣服箱を持つ。仕事の皮・脂と肉、猟の道具を寝具や私物の収納へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、猟と食肉・皮と脂の処理と運搬、燻しと冷却・煙と温度・汚水と廃物、家庭の給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#BB.....CC#
#BB.....CC#
#BB.....CC#
#BB.....CC#
#.........#
#.........#
#LL.....MM#
#LL.....MM#
#.........#
####DD#####
```
