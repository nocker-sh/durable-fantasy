---
{
  "id": "room-h-c1-2",
  "kind": "rooms",
  "title": "ハインリヒの窯場／2階 ハインリヒとテレーゼの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "floor": 1,
  "room_name": "2階 ハインリヒとテレーゼの寝室",
  "use": "寝",
  "occupants": [
    "ハインリヒ",
    "テレーゼ"
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
      "target": "room-h-c1-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ハインリヒの寝台",
      "owner": "ハインリヒ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "ハインリヒの寝台を使う",
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
      "name": "テレーゼの寝台",
      "owner": "テレーゼ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。テレーゼが手入れする案",
      "maintainers": [
        "resident-テレーゼ"
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
          "activity": "テレーゼの寝台を使う",
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
      "name": "ハインリヒの衣服箱",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "ハインリヒの衣服箱を使う",
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
      "name": "テレーゼの衣服箱",
      "owner": "テレーゼ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。テレーゼが手入れする案",
      "maintainers": [
        "resident-テレーゼ"
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
          "activity": "テレーゼの衣服箱を使う",
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
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c1-2-1",
      "resident": "resident-ハインリヒ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c1-2-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-c1-2-2",
      "resident": "resident-テレーゼ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c1-2-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-c1-2-1",
      "resident": "resident-ハインリヒ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-c1-2-2",
      "resident": "resident-テレーゼ",
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
    "resident-ハインリヒ",
    "resident-テレーゼ"
  ]
}
---
# ハインリヒの窯場／2階 ハインリヒとテレーゼの寝室

## 用途と暮らし

[[building-h-c1]] の平面案に属する。ハインリヒとテレーゼそれぞれの寝台と衣服箱を持つ。仕事の土と釉、未乾燥の器を私物や寝具の収納へ置かない。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

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
