---
{
  "id": "room-h-g2-3",
  "kind": "rooms",
  "title": "クルトの家／2階 クルトとザビーネの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "floor": 1,
  "room_name": "2階 クルトとザビーネの寝室",
  "use": "寝",
  "occupants": [
    "クルト",
    "ザビーネ"
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
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "クルトの寝台",
      "owner": "クルト",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "クルトの寝台を使う",
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
      "name": "ザビーネの寝台",
      "owner": "ザビーネ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "ザビーネの寝台を使う",
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
      "name": "クルトの衣服箱",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "クルトの衣服箱を使う",
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
      "name": "ザビーネの衣服箱",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "ザビーネの衣服箱を使う",
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
      "id": "bed-h-g2-3-1",
      "resident": "resident-クルト",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g2-3-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-g2-3-2",
      "resident": "resident-ザビーネ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-g2-3-2",
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
      "id": "storage-h-g2-3-1",
      "resident": "resident-クルト",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-g2-3-2",
      "resident": "resident-ザビーネ",
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
    "resident-クルト",
    "resident-ザビーネ"
  ]
}
---
# クルトの家／2階 クルトとザビーネの寝室

## 用途と暮らし

[[building-h-g2]] の平面案に属する。両親それぞれの寝台と衣服箱を持つ。仕事の錫と工具、預かった刃物を本人の寝具と私物へ混ぜない。

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
