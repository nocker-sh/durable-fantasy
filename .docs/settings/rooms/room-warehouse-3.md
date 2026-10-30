---
{
  "id": "room-warehouse-3",
  "kind": "rooms",
  "title": "町の倉庫／2階 ヒルデとゲオルクの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-warehouse",
  "floor": 1,
  "room_name": "2階 ヒルデとゲオルクの寝室",
  "use": "寝",
  "occupants": [
    "ヒルデ",
    "ゲオルク"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "#BB...LL....MM....CC#",
      "#BB...LL....MM....CC#",
      "#BB...............CC#",
      "#BB...............CC#",
      "#...................#",
      "#...................#",
      "D...................#",
      "D...................#",
      "#...................#",
      "#...................#",
      "#####################"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        7
      ],
      "width_cells": 2,
      "target": "room-warehouse-upper-stairs",
      "target_door": [
        5,
        7
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ヒルデの寝台",
      "owner": "ヒルデ",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
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
          "activity": "ヒルデの寝台を使う",
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
      "name": "ゲオルクの寝台",
      "owner": "ゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        18,
        1,
        2,
        4
      ],
      "access": [
        [
          17,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "ゲオルクの寝台を使う",
          "rect": [
            16,
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
      "name": "ヒルデの衣服箱",
      "owner": "ヒルデ",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        6,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ヒルデの衣服箱を使う",
          "rect": [
            6,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "M",
      "name": "ゲオルクの衣服箱",
      "owner": "ゲオルク",
      "source": "町の木工所・鍛冶場で製作し二人が手入れする案",
      "rect": [
        12,
        1,
        2,
        2
      ],
      "access": [
        [
          12,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ゲオルクの衣服箱を使う",
          "rect": [
            12,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "敷地・道・隣家と地形、戸・窓・梁は未照合",
    "預かり荷の寸法と重量・容量・搬送、給排水と便所・火と灰、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-warehouse-3-1",
      "resident": "resident-ヒルデ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "個別の衣服箱を配置。収納量と開閉は未照合",
      "storage_id": "storage-warehouse-3-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-warehouse-3-2",
      "resident": "resident-ゲオルク",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "個別の衣服箱を配置。収納量と開閉は未照合",
      "storage_id": "storage-warehouse-3-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-warehouse",
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "personal_storage": [
    {
      "id": "storage-warehouse-3-1",
      "resident": "resident-ヒルデ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-warehouse-3-2",
      "resident": "resident-ゲオルク",
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
    "resident-ヒルデ",
    "resident-ゲオルク"
  ]
}
---
# 町の倉庫／2階 ヒルデとゲオルクの寝室

## 用途と暮らし

[[building-warehouse]] の平面案に属する。夫婦が一室を使い、それぞれの寝台と衣服箱を持つ。二人用の寝台一つへ人数だけ割り当てず、私物の区画を重複させない。寝具を広げる量と収納容量は未照合である。

## 未解決の条件

戸と窓・視線と音、荷と身体の操作、給排水と便所・火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####################
#BB...LL....MM....CC#
#BB...LL....MM....CC#
#BB...............CC#
#BB...............CC#
#...................#
#...................#
D...................#
D...................#
#...................#
#...................#
#####################
```
