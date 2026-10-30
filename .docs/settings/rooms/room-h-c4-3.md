---
{
  "id": "room-h-c4-3",
  "kind": "rooms",
  "title": "マルクスの家／2階 マルクスとカタリーナの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "floor": 1,
  "room_name": "2階 マルクスとカタリーナの寝室",
  "use": "寝",
  "occupants": [
    "マルクス",
    "カタリーナ"
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
      "#...................#",
      "#...................#",
      "#...................#",
      "##########DD#########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        10
      ],
      "width_cells": 2,
      "target": "room-h-c4-upper-hall",
      "target_door": [
        10,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "マルクスの寝台",
      "owner": "マルクス",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "マルクスの寝台を使う",
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
      "name": "カタリーナの寝台",
      "owner": "カタリーナ",
      "source": "町の木工所で寝台を作り、仕立屋へ寝具を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
      ],
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
          "activity": "カタリーナの寝台を使う",
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
      "name": "マルクスの衣服箱",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
      ],
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
          "activity": "マルクスの衣服箱を使う",
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
      "name": "カタリーナの衣服箱",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
      ],
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
          "activity": "カタリーナの衣服箱を使う",
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
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-c4-3-1",
      "resident": "resident-マルクス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c4-3-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-h-c4-3-2",
      "resident": "resident-カタリーナ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-h-c4-3-2",
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
      "id": "storage-h-c4-3-1",
      "resident": "resident-マルクス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    },
    {
      "id": "storage-h-c4-3-2",
      "resident": "resident-カタリーナ",
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
    "resident-マルクス",
    "resident-カタリーナ"
  ]
}
---
# マルクスの家／2階 マルクスとカタリーナの寝室

## 用途と暮らし

[[building-h-c4]] の平面案に属する。両親それぞれの寝台と衣服箱を持つ。仕事の灰汁と石工の道具を寝具の横へ持ち込まない。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####################
#BB...LL....MM....CC#
#BB...LL....MM....CC#
#BB...............CC#
#BB...............CC#
#...................#
#...................#
#...................#
#...................#
#...................#
##########DD#########
```
