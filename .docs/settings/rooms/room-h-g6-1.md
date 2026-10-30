---
{
  "id": "room-h-g6-1",
  "kind": "rooms",
  "title": "エドガーの家／1階 居間兼台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g6",
  "floor": 0,
  "room_name": "居間兼台所",
  "use": "台所",
  "occupants": [
    "エドガー",
    "マルグリット"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####DD#####",
      "#OOKK...WW.#",
      "#OO........#",
      "#.........F#",
      "#....TT...F#",
      "#...ATTB..Q#",
      "#........RR#",
      "D........RR#",
      "D..EEPPPP..#",
      "############"
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
      "target": "room-h-g6-2",
      "door": [
        5,
        0
      ],
      "target_door": [
        5,
        6
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "map-phanthiet-gate",
      "door": [
        0,
        7
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "調理と暖房の炉",
      "owner": "retired",
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
      "owner": "retired",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        3,
        1,
        2,
        1
      ],
      "access": [
        [
          3,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食材を切る",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "蓋付きの飲用水容器",
      "owner": "retired",
      "source": "陶工の水容器と門の井戸から本人たちが運ぶ水",
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
      "owner": "retired",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        10,
        3,
        1,
        2
      ],
      "access": [
        [
          9,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食材を取り出す",
          "rect": [
            8,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "retired",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        5,
        4,
        2,
        2
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "食卓を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B"
      ]
    },
    {
      "symbol": "A",
      "name": "エドガーの食卓の椅子",
      "owner": "エドガー",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        4,
        5,
        1,
        1
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "エドガーの椅子を使う",
          "rect": [
            2,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "マルグリットの食卓の椅子",
      "owner": "マルグリット",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        7,
        5,
        1,
        1
      ],
      "access": [
        [
          7,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "マルグリットの椅子を使う",
          "rect": [
            6,
            6,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "R",
      "name": "エドガーの揺り椅子",
      "owner": "エドガー",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        9,
        6,
        2,
        2
      ],
      "access": [
        [
          9,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "揺り椅子を使う",
          "rect": [
            8,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "Q",
      "name": "編みかけと毛糸の蓋付き籠",
      "owner": "マルグリット",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        10,
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
          "activity": "揺り椅子の脇の台を使う",
          "rect": [
            8,
            4,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "P",
      "name": "刃を覆った古い槍の壁掛け",
      "owner": "エドガー",
      "source": "エドガーが門番だった時から持つ古い槍と木の掛け台",
      "rect": [
        5,
        8,
        4,
        1
      ],
      "access": [
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "古い槍を点検する",
          "rect": [
            5,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "E",
      "name": "帰宅時の靴の受け",
      "owner": "retired",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        3,
        8,
        2,
        1
      ],
      "access": [
        [
          2,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "靴を下ろして履き替える",
          "rect": [
            1,
            7,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "揺り椅子の前後の揺れ・立上りと食卓の椅子の可動域は未照合",
    "槍の壁掛けの高さ・支えと取外す姿勢は未照合",
    "手洗い・便所・薪と灰・汚水と濡れ物の場所は未確定",
    "窓・炉と排煙・床の段差と二人の移動の照合未完了"
  ],
  "design_dependencies": [
    "building-h-g6",
    "facility-gate-well"
  ],
  "origin": [
    0,
    6
  ],
  "parallel_use": [
    {
      "activity": "揺り椅子と食卓の席への出入り",
      "operations": [
        {
          "resident": "エドガー",
          "furniture": "R",
          "space_index": 0
        },
        {
          "resident": "マルグリット",
          "furniture": "B",
          "space_index": 0
        }
      ]
    }
  ]
}
---

# エドガーの家／1階 居間兼台所

## 二人の暮らし

元門番の[[resident-エドガー]]と[[resident-マルグリット]]の家である。元門番の収入と現在の隠居の暮らしを混同せず、住民の既存の日課を基準にする。階段を設けず、食事と寝床を同じ地上階でつなぐ。西の戸で靴を下ろし、中央の食卓を二人で使う。

## 炉と食事

北側に炉、下ごしらえ、水の容器を置き、食材は蓋付きの箱へ収める。飲用水は[[facility-gate-well]]から本人たちが運ぶ案とする。炉で暖を取りながら食事を用意できる平面とするが、灰と薪の搬出入、手洗いと汚水の行き先はまだ決まっていない。

## 揺り椅子と編み物

エドガーの揺り椅子は東南へ置き、マルグリットは食卓の席で編み物をする。編みかけと毛糸は専用の籠へしまい、食事の前に台を空ける。食卓の椅子と揺り椅子へ出入りする二人の面は分ける。揺り椅子の静止した占有だけで、揺れる途中や立ち上がる姿勢まで成立したとはしない。

## 古い槍の扱い

槍は現役の詰所の装備ではなく、エドガーが門番だった時から持つ私物である。刃を覆って南壁沿いに横向きで掛ける案とし、戸口へ立て掛けたり、頭上を横切る棒として描いたりしない。掛け台の支えと高さ、外す動作は立体で確認する。

## 平面案

一セルは半メートル。北の戸で[[room-h-g6-2]]へつながる。

```grid
#####DD#####
#OOKK...WW.#
#OO........#
#.........F#
#....TT...F#
#...ATTB..Q#
#........RR#
D........RR#
D..EEPPPP..#
############
```

食事、編み物、道具の点検を同時に成立したものとして扱わず、生活の切替と建具の可動域を別に照合する。


## 作業中の通路

食卓を東へ寄せて北の入口から西の戸へ回る床を取り、椅子と脇の台を組み直す。エドガーの揺り椅子とマルグリットの席を使う面が互いの出入りを塞がないことを検査する。
