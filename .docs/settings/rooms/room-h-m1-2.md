---
{
  "id": "room-h-m1-2",
  "kind": "rooms",
  "title": "エーリヒの家／2階 エーリヒとマリーの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "floor": 1,
  "room_name": "2階 エーリヒとマリーの寝室",
  "use": "寝",
  "occupants": [
    "エーリヒ",
    "マリー"
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
      "target": "room-h-m1-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "エーリヒの寝台",
      "owner": "エーリヒ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
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
          "activity": "エーリヒの寝台を使う",
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
      "name": "マリーの寝台",
      "owner": "マリー",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
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
          "activity": "マリーの寝台を使う",
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
      "name": "エーリヒの衣服箱",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
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
          "activity": "エーリヒの衣服箱を使う",
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
      "name": "マリーの衣服箱",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
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
          "activity": "マリーの衣服箱を使う",
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
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-m1-2-1",
      "resident": "resident-エーリヒ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-m1-2-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-m1-2-2",
      "resident": "resident-マリー",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-m1-2-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-m1-2-1",
      "resident": "resident-エーリヒ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-m1-2-2",
      "resident": "resident-マリー",
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
    "resident-エーリヒ",
    "resident-マリー"
  ]
}
---
# エーリヒの家／2階 エーリヒとマリーの寝室

## 用途と暮らし

[[building-h-m1]] の平面案に属する。両親それぞれの寝台と衣服箱を持つ。依頼人の書類と本人の私物・寝具を同じ箱へ入れない。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

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
