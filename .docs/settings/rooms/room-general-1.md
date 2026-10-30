---
{
  "id": "room-general-1",
  "kind": "rooms",
  "title": "ブルーノの道具屋／1階 店先",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-general",
  "floor": 0,
  "room_name": "1階 店先",
  "use": "店",
  "occupants": [
    "ブルーノ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#...........D",
      "#.....EEE...D",
      "D.....EEE...#",
      "D...........#",
      "#...........#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "#CCC.....RRR#",
      "######DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        6,
        12
      ],
      "width_cells": 2,
      "target": "room-general-2",
      "target_door": [
        6,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        12,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    },
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-general-lower-stairs",
      "target_door": [
        5,
        6
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "日用品の商品棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "日用品の商品棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "B",
      "name": "道具の商品棚",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        9,
        1,
        3,
        3
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "道具の商品棚を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "E",
      "name": "小物を見比べる台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        6,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "小物を見比べる台を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "縄の束の置台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        1,
        9,
        3,
        3
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "縄の束の置台を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "shop_stock"
    },
    {
      "symbol": "R",
      "name": "品の受渡しと帳面の台",
      "owner": "ブルーノ",
      "source": "町の木工所・鍛冶場で製作しブルーノが手入れする案",
      "rect": [
        9,
        9,
        3,
        3
      ],
      "access": [
        [
          8,
          9
        ],
        [
          10,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "品の受渡しと帳面の台を使う",
          "rect": [
            7,
            9,
            2,
            2
          ]
        },
        {
          "activity": "客が品を受け取る",
          "rect": [
            9,
            7,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家、戸・窓・梁と地形は未照合",
    "商品の容量と重量・搬送、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-general",
    "resident-ブルーノ"
  ],
  "origin": [
    5,
    0
  ]
}
---
# ブルーノの道具屋／1階 店先

## 用途と暮らし

[[building-general]] の平面案に属する。客は東の入口から商品棚と小物の台、受渡しへ歩く。縄の束を床の占有に含め、ほどいた縄や包みを通路へ放置しない。カウンターの店主側と客側の使用面を分ける。

## 未解決の条件

戸の開閉と視線・音、商品の量と容量、荷物を持つ身体と段差、火と煙・灰と換気、衣服と寝具の手入れ、仕事と休息・日課は未照合である。現行の建物の位置と描画は切り替えない。敷地と立体は建物資料へ結ぶ。

```grid
#############
#AAA.....BBB#
#AAA.....BBB#
#AAA.....BBB#
#...........D
#.....EEE...D
D.....EEE...#
D...........#
#...........#
#CCC.....RRR#
#CCC.....RRR#
#CCC.....RRR#
######DD#####
```
