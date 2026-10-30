---
{
  "id": "room-h-c4-2",
  "kind": "rooms",
  "title": "マルクスの家／1階 ダニエルとイダの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "floor": 0,
  "room_name": "1階 ダニエルとイダの寝室",
  "use": "寝",
  "occupants": [
    "マルクス",
    "カタリーナ",
    "ダニエル",
    "イダ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#BB.....CC#",
      "#BB.....CC#",
      "#BB.....CC#",
      "#BB.....CC#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#LL.....MM#",
      "#LL.....MM#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c4-entry",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ダニエルの寝台",
      "owner": "ダニエル",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。カタリーナが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-カタリーナ",
        "resident-ダニエル"
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
          "activity": "ダニエルの寝台を使う",
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
      "name": "イダの寝台",
      "owner": "イダ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。カタリーナが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-カタリーナ",
        "resident-イダ"
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
          "activity": "イダの寝台を使う",
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
      "name": "ダニエルの衣服箱",
      "owner": "ダニエル",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。カタリーナが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-カタリーナ",
        "resident-ダニエル"
      ],
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
          "activity": "ダニエルの衣服箱を使う",
          "rect": [
            3,
            8,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "M",
      "name": "イダの衣服箱",
      "owner": "イダ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。カタリーナが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-カタリーナ",
        "resident-イダ"
      ],
      "rect": [
        8,
        8,
        2,
        2
      ],
      "access": [
        [
          7,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "イダの衣服箱を使う",
          "rect": [
            6,
            8,
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
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c4-2-1",
      "resident": "resident-ダニエル",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c4-2-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-c4-2-2",
      "resident": "resident-イダ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c4-2-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c4",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-c4-2-1",
      "resident": "resident-ダニエル",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-c4-2-2",
      "resident": "resident-イダ",
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
    15,
    14
  ],
  "private_for": [
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ]
}
---
# マルクスの家／1階 ダニエルとイダの寝室

## 用途と暮らし

[[building-h-c4]] の平面案に属する。ダニエルとイダの寝床は現行どおり地上階に持ち、それぞれの寝台と衣服箱を分ける。両親は寝具と衣服の世話に入れる。共有する室内の着替えと視線、子どもの動きと物の開閉は未照合である。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#BB.....CC#
#BB.....CC#
#BB.....CC#
#BB.....CC#
#.........#
#.........#
#.........#
#LL.....MM#
#LL.....MM#
#.........#
#.........#
###########
```
