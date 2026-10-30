---
{
  "id": "room-h-g2-4",
  "kind": "rooms",
  "title": "クルトの家／2階 ヨハンとリナの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "floor": 1,
  "room_name": "2階 ヨハンとリナの寝室",
  "use": "寝",
  "occupants": [
    "クルト",
    "ザビーネ",
    "ヨハン",
    "リナ"
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
      "target": "room-h-g2-upper-hall",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ヨハンの寝台",
      "owner": "ヨハン",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ザビーネが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ザビーネ",
        "resident-ヨハン"
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
          "activity": "ヨハンの寝台を使う",
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
      "name": "リナの寝台",
      "owner": "リナ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ザビーネが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ザビーネ",
        "resident-リナ"
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
          "activity": "リナの寝台を使う",
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
      "name": "ヨハンの衣服箱",
      "owner": "ヨハン",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ザビーネが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ザビーネ",
        "resident-ヨハン"
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
          "activity": "ヨハンの衣服箱を使う",
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
      "name": "リナの衣服箱",
      "owner": "リナ",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ザビーネが寝具と衣服を手入れし、本人が片付ける案",
      "maintainers": [
        "resident-ザビーネ",
        "resident-リナ"
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
          "activity": "リナの衣服箱を使う",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g2-4-1",
      "resident": "resident-ヨハン",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g2-4-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-g2-4-2",
      "resident": "resident-リナ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g2-4-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g2-4-1",
      "resident": "resident-ヨハン",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-g2-4-2",
      "resident": "resident-リナ",
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
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ]
}
---
# クルトの家／2階 ヨハンとリナの寝室

## 用途と暮らし

[[building-h-g2]] の平面案に属する。双子のヨハンとリナが同じ室を使い、それぞれの寝台と衣服箱を持つ。両親は寝具と衣服の世話に入れる。共有する室内の着替えと視線、子どもの物の開閉は未照合である。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
