---
{
  "id": "room-h-g5-4",
  "kind": "rooms",
  "title": "クリスティアンの家／2階 ラウラとベンヤミンの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "floor": 1,
  "room_name": "2階 ラウラとベンヤミンの寝室",
  "use": "寝",
  "occupants": [
    "クリスティアン",
    "ドロテア",
    "ラウラ",
    "ベンヤミン"
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
      "target": "room-h-g5-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ラウラの寝台",
      "owner": "ラウラ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ドロテアが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ドロテア",
        "resident-ラウラ"
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
          "activity": "ラウラの寝台を使う",
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
      "name": "ベンヤミンの寝台",
      "owner": "ベンヤミン",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ドロテアが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ドロテア",
        "resident-ベンヤミン"
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
          "activity": "ベンヤミンの寝台を使う",
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
      "name": "ラウラの衣服箱",
      "owner": "ラウラ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ドロテアが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ドロテア",
        "resident-ラウラ"
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
          "activity": "ラウラの衣服箱を使う",
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
      "name": "ベンヤミンの衣服箱",
      "owner": "ベンヤミン",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ドロテアが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ドロテア",
        "resident-ベンヤミン"
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
          "activity": "ベンヤミンの衣服箱を使う",
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
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g5-4-1",
      "resident": "resident-ラウラ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g5-4-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-g5-4-2",
      "resident": "resident-ベンヤミン",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g5-4-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g5-4-1",
      "resident": "resident-ラウラ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-g5-4-2",
      "resident": "resident-ベンヤミン",
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
    0
  ],
  "private_for": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ]
}
---
# クリスティアンの家／2階 ラウラとベンヤミンの寝室

## 用途と暮らし

[[building-h-g5]] の平面案に属する。ラウラとベンヤミンが同じ室を使い、それぞれの寝台と衣服箱を持つ。両親は寝具と衣服の世話に入れる。共有する室内の着替えと視線、子どもの物の開閉は未照合である。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

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
