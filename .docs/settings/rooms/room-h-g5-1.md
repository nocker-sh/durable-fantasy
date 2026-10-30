---
{
  "id": "room-h-g5-1",
  "kind": "rooms",
  "title": "クリスティアンの家／1階 居間と四人の食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "floor": 0,
  "room_name": "1階 居間と四人の食事",
  "use": "食事",
  "occupants": [
    "クリスティアン",
    "ドロテア",
    "ラウラ",
    "ベンヤミン"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#HH....FF.#",
      "#HH....FF.#",
      "#.........D",
      "#.........D",
      "#..ATTTB..#",
      "#...TTT...#",
      "#...C.E...#",
      "#.........#",
      "#.........#",
      "#LL....RR.#",
      "#LL....RR.#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-g5-entry",
      "target_door": [
        4,
        4
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        3
      ],
      "width_cells": 2,
      "target": "room-h-g5-2",
      "target_door": [
        0,
        3
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "休むときの外套と膝掛けの受け",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "休むときの外套と膝掛けの受けを使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "F",
      "name": "家族の身の回りの棚",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "家族の身の回りの棚を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "L",
      "name": "家庭の布の棚",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        1,
        10,
        2,
        2
      ],
      "access": [
        [
          3,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の布の棚を使う",
          "rect": [
            3,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "R",
      "name": "家族の茶椀と食卓の物の棚",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        7,
        10,
        2,
        2
      ],
      "access": [
        [
          6,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家族の茶椀と食卓の物の棚を使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "T",
      "name": "四人の食卓",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        4,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "四人の食卓を使う",
          "rect": [
            4,
            3,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "A",
        "B",
        "C",
        "E"
      ]
    },
    {
      "symbol": "A",
      "name": "クリスティアンの椅子",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        3,
        5,
        1,
        1
      ],
      "access": [
        [
          2,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "クリスティアンの椅子を使う",
          "rect": [
            1,
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
      "name": "ドロテアの椅子",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        7,
        5,
        1,
        1
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ドロテアの椅子を使う",
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
      "symbol": "C",
      "name": "ラウラの椅子",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        4,
        7,
        1,
        1
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ラウラの椅子を使う",
          "rect": [
            2,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "ベンヤミンの椅子",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        6,
        7,
        1,
        1
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ベンヤミンの椅子を使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "origin": [
    5,
    14
  ],
  "private_for": [
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-クリスティアン",
        "chair": "A"
      },
      {
        "resident": "resident-ドロテア",
        "chair": "B"
      },
      {
        "resident": "resident-ラウラ",
        "chair": "C"
      },
      {
        "resident": "resident-ベンヤミン",
        "chair": "E"
      }
    ]
  }
}
---
# クリスティアンの家／1階 居間と四人の食事

## 用途と暮らし

[[building-h-g5]] の平面案に属する。四人の家庭の食卓と本人ごとの席、布と食器・身の回りの物を持つ。教材を運ぶ籠と産婆の仕事の籠を、食卓や子どもの私物の棚へ共用しない。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#HH....FF.#
#HH....FF.#
#.........D
#.........D
#..ATTTB..#
#...TTT...#
#...C.E...#
#.........#
#.........#
#LL....RR.#
#LL....RR.#
###########
```
