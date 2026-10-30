---
{
  "id": "room-h-c5-2",
  "kind": "rooms",
  "title": "ベルンハルトの家／1階 冷めた灰の受取りと分別・出荷",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "floor": 0,
  "room_name": "冷めた灰の受取りと分別・出荷",
  "use": "貯蔵",
  "occupants": [
    "ベルンハルト",
    "モニカ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH.........RRRRR.#",
      "#HHHH...............#",
      "#...................#",
      "#...................D",
      "#...................D",
      "#...................D",
      "#FFF..........PPP...#",
      "#FFF...CCC....PPP...#",
      "#FFF...CCC....PPP...#",
      "#......CCC..........#",
      "#...................#",
      "####DD###############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-h-c5-entry",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        20,
        6
      ],
      "width_cells": 3,
      "target": "map-phanthiet-craft"
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "冷めた灰を受ける閉じた容器の置台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        1,
        1,
        4,
        4
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "冷めた灰を受ける閉じた容器の置台を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "R",
      "name": "用途ごとに分けた灰の袋の置台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        14,
        1,
        5,
        3
      ],
      "access": [
        [
          14,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "用途ごとに分けた灰の袋の置台を使う",
          "rect": [
            14,
            4,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "F",
      "name": "空の袋と蓋付き容器の棚",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
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
          "activity": "空の袋と蓋付き容器の棚を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "W",
      "name": "仕事の道具の洗いと手入れ台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        7,
        1,
        3,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "仕事の道具の洗いと手入れ台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "P",
      "name": "量と袋の状態を確かめる台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        14,
        9,
        3,
        3
      ],
      "access": [
        [
          13,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "量と袋の状態を確かめる台を使う",
          "rect": [
            12,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "出荷する灰の密閉容器の置台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        7,
        10,
        3,
        3
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "出荷する灰の密閉容器の置台を使う",
          "rect": [
            7,
            8,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "N",
      "name": "注文と受渡しの帳面台",
      "owner": "モニカ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。モニカが手入れする案",
      "maintainers": [
        "resident-モニカ"
      ],
      "rect": [
        11,
        1,
        2,
        2
      ],
      "access": [
        [
          11,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "注文と受渡しの帳面台を使う",
          "rect": [
            11,
            3,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ"
  ],
  "ground_storage": [
    {
      "furniture": "H",
      "contents": "冷めた灰（由来と用途・受入状態と量は未確定）",
      "handler": "resident-モニカ"
    },
    {
      "furniture": "R",
      "contents": "冷めた灰（由来と用途・受入状態と量は未確定）",
      "handler": "resident-モニカ"
    },
    {
      "furniture": "C",
      "contents": "冷めた灰（由来と用途・受入状態と量は未確定）",
      "handler": "resident-モニカ"
    }
  ]
}
---
# ベルンハルトの家／1階 冷めた灰の受取りと分別・出荷

## 用途と暮らし

[[building-h-c5]] の平面案に属する。冷めた灰の受取り、用途ごとの分別と出荷、空の袋と蓋付き容器、量と袋の確認、仕事の洗い物と帳面を分ける。熱い灰をこの室へ持ち込む前提にせず、冷めたことを確認する場所と方法は敷地側で別に設計する。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
#####################
#HHHH..WWW.NN.RRRRR.#
#HHHH..WWW.NN.RRRRR.#
#HHHH.........RRRRR.#
#HHHH...............#
#...................#
#...................D
#...................D
#...................D
#FFF..........PPP...#
#FFF...CCC....PPP...#
#FFF...CCC....PPP...#
#......CCC..........#
#...................#
####DD###############
```

## 元の容器と保管時の形

元の灰の袋は冷めた灰の保管用とし、布の膨らんだ胴と縛った口を描く。熱い灰や煙を出す袋として扱わない。ベルンハルトが掃き、モニカが用途に分けて売る関係は `world/town/lines/households/sweep.ts` に対応する。由来ごとの受入確認と粉塵対策は引き続き設計する。 元の家具の形を表示へ戻す修正であり、新しい平面への切替ではない。
