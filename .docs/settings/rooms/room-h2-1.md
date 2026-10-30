---
{
  "id": "room-h2-1",
  "kind": "rooms",
  "title": "ルカスとベルタの家／1階 居間兼台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h2",
  "floor": 0,
  "room_name": "居間兼台所",
  "use": "台所",
  "occupants": [
    "ルカス",
    "ベルタ",
    "エミール"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###############",
      "#OO.KKK.WW.FF.#",
      "#OO...........#",
      "#.............#",
      "#.............#",
      "#.......C.....#",
      "#RR....ATT....#",
      "#....SS.TTB...#",
      "#....SS.TT....#",
      "D....SS.......#",
      "D....SS.......#",
      "#EE..SS.......#",
      "###############"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        0,
        9
      ],
      "width_cells": 2
    },
    {
      "kind": "stair",
      "target": "room-h2-2",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        7,
        11
      ],
      "target_access": [
        7,
        7
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "carter",
      "source": "石工の炉と鍛冶屋の金物",
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          2,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食事を調理する",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "K",
      "name": "下ごしらえ台",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        4,
        1,
        3,
        1
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食材を切り分ける",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "蓋付き飲用水桶",
      "owner": "carter",
      "source": "桶職人の桶と井戸から家族が運ぶ水",
      "rect": [
        8,
        1,
        2,
        1
      ],
      "access": [
        [
          8,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "飲用水を取り出す",
          "rect": [
            8,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "F",
      "name": "蓋付きの食材箱",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        11,
        1,
        2,
        1
      ],
      "access": [
        [
          11,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食材を出し入れする",
          "rect": [
            10,
            2,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "T",
      "name": "三人の食卓",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        8,
        6,
        2,
        3
      ],
      "access": [
        [
          10,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家族の食卓を使う",
          "rect": [
            10,
            5,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "symbol": "A",
      "name": "ルカスの椅子",
      "owner": "ルカス",
      "source": "町の木工師への造作依頼",
      "rect": [
        7,
        6,
        1,
        1
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "食卓の席へ出入りする",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "ベルタの椅子",
      "owner": "ベルタ",
      "source": "町の木工師への造作依頼",
      "rect": [
        10,
        7,
        1,
        1
      ],
      "access": [
        [
          10,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "ベルタの椅子を使う",
          "rect": [
            10,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "エミールの椅子",
      "owner": "エミール",
      "source": "町の木工師への造作依頼",
      "rect": [
        8,
        5,
        1,
        1
      ],
      "access": [
        [
          9,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "エミールの椅子を使う",
          "rect": [
            9,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "S",
      "name": "屋根裏への家族用階段",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        5,
        7,
        2,
        5
      ],
      "access": [
        [
          7,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "階段の昇降口で向きを変える",
          "rect": [
            7,
            10,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "R",
      "name": "荷運びの綱と道具の箱",
      "owner": "ルカス",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        6,
        2,
        1
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "荷運びの綱と道具を出し入れする",
          "rect": [
            3,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "E",
      "name": "仕事靴と濡れた上着の受け",
      "owner": "carter",
      "source": "町の木工師への造作依頼",
      "rect": [
        1,
        11,
        2,
        1
      ],
      "access": [
        [
          3,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "帰宅時に靴と上着を下ろす",
          "rect": [
            3,
            10,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "敷地・屋外の戸口・荷車置場との接続は未照合",
    "炉と階段の立体・排煙・窓・薪と灰の場所は未確定",
    "手洗い・便所・汚水と濡れ物の乾燥は未確定",
    "椅子と戸の可動域・家族の移動の同時利用は未照合"
  ],
  "design_dependencies": [
    "building-h2",
    "facility-square-well"
  ],
  "origin": [
    0,
    0
  ],
  "parallel_use": [
    {
      "activity": "三人の食卓への出入り",
      "operations": [
        {
          "resident": "ルカス",
          "furniture": "A",
          "space_index": 0
        },
        {
          "resident": "ベルタ",
          "furniture": "B",
          "space_index": 0
        },
        {
          "resident": "エミール",
          "furniture": "C",
          "space_index": 0
        }
      ]
    }
  ]
}
---

# ルカスとベルタの家／1階 居間兼台所

## 荷運びから家へ戻る

[[resident-ルカス]]、[[resident-ベルタ]]、[[resident-エミール]]が食事と身支度に使う。平面の西の戸は敷地案では南へ向く。戸の脇で仕事靴と濡れた上着を下ろし、綱と道具を専用の箱へしまう。荷車や運搬中の他人の荷を食卓や階段へ置かない。荷車を止め、車輪を修理する場所は敷地側で別に設計する。

## 調理と家族の食事

北側に炉・下ごしらえ・水・食材をまとめ、東寄りの食卓に三人の椅子を置く。食卓の出入りの床を人数分分け、調理から配膳する面と区別する。飲用水は[[facility-square-well]]から家族が運ぶ案とし、特定の住民の無償の水配りを前提にしない。

## 階段と通路

中央の家族用階段で[[room-h2-2]]へ上がる。戸から階段の使用面と食卓へは、椅子や荷の上を通らず進む。糸や機織りの部品を運ぶ動作は、階段を歩ける平面検査とは分けて確認する。火を使う面は階段の直下に設けない。

## 平面案

一セルは半メートルである。

```grid
###############
#OO.KKK.WW.FF.#
#OO...........#
#.............#
#.............#
#.......C.....#
#RR....ATT....#
#....SS.TTB...#
#....SS.TT....#
D....SS.......#
D....SS.......#
#EE..SS.......#
###############
```

家具の可動域、灰と汚水の搬出、手洗いと便所、濡れ物の乾燥は未設計であり、現行の描画を切り替える段階ではない。


## 作業中の通路

食卓の席を使う人がいる間も、入口から上階の階段の下端まで通れるよう、東側へ幅を追加して椅子の使う側を組み直す。三人の席への出入りで、他の二人が使う面を占有した状態も検査する。
