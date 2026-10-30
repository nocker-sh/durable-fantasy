---
{
  "id": "room-farmhouse-1",
  "kind": "rooms",
  "title": "カールとウルリケの家／1階 台所と居間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-farmhouse",
  "floor": 0,
  "room_name": "台所と居間",
  "use": "台所",
  "occupants": [
    "カール",
    "ウルリケ",
    "フリッツ",
    "ミア",
    "ゲルトルート",
    "ヴァルター"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "################",
      "#SSNN.WW..JJJ..#",
      "#SSNN.....JJJ..#",
      "#SS............D",
      "#SS............D",
      "#SS.....E.A..HH#",
      "#SS...BTTTT..HH#",
      "#SS....TTTT....#",
      "#SS...FTTTT....#",
      "#SS....TTTT....#",
      "#SS....C.G.....#",
      "#SS............#",
      "#SS............#",
      "#..KK..........#",
      "#####DD####DD###"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "map-phanthiet",
      "door": [
        15,
        3
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "room-farmhouse-4",
      "door": [
        5,
        14
      ],
      "width_cells": 2,
      "target_door": [
        5,
        0
      ]
    },
    {
      "kind": "door",
      "target": "room-farmhouse-5",
      "door": [
        11,
        14
      ],
      "width_cells": 2,
      "target_door": [
        2,
        0
      ]
    },
    {
      "kind": "stair",
      "target": "room-farmhouse-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        12
      ],
      "target_access": [
        3,
        1
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "上階への直階段",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "上階への直階段を使う",
          "rect": [
            3,
            11,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "家族六人の食卓",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        7,
        6,
        4,
        4
      ],
      "access": [
        [
          11,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "家族六人の食卓を使う",
          "rect": [
            11,
            7,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C",
        "E",
        "F",
        "G"
      ],
      "role": "table"
    },
    {
      "symbol": "A",
      "name": "カールの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        10,
        5,
        1,
        1
      ],
      "access": [
        [
          11,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "カールの椅子を使う",
          "rect": [
            11,
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
      "name": "ウルリケの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        6,
        6,
        1,
        1
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "ウルリケの椅子を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "フリッツの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        7,
        10,
        1,
        1
      ],
      "access": [
        [
          7,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "フリッツの椅子を使う",
          "rect": [
            6,
            11,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "ミアの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        8,
        5,
        1,
        1
      ],
      "access": [
        [
          8,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "ミアの椅子を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "F",
      "name": "ゲルトルートの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        6,
        8,
        1,
        1
      ],
      "access": [
        [
          5,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "ゲルトルートの椅子を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "G",
      "name": "ヴァルターの椅子",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        9,
        10,
        1,
        1
      ],
      "access": [
        [
          10,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "ヴァルターの椅子を使う",
          "rect": [
            10,
            10,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "H",
      "name": "家庭の調理炉",
      "owner": "カールとウルリケの世帯",
      "source": "町の石と陶製部材で組む家庭炉の案",
      "rect": [
        13,
        5,
        2,
        2
      ],
      "access": [
        [
          13,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "炉の南側で火を扱う",
          "rect": [
            13,
            7,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "J",
      "name": "家庭の調理台",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        10,
        1,
        3,
        2
      ],
      "access": [
        [
          10,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理台を使う",
          "rect": [
            10,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の飲用水の蓋付き容器台",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        6,
        1,
        2,
        1
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の飲用水の蓋付き容器台を使う",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "K",
      "name": "畑から帰った上着と靴の置台",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、農家の世帯が修理して使う案",
      "rect": [
        3,
        13,
        2,
        1
      ],
      "access": [
        [
          5,
          13
        ]
      ],
      "use_space": [
        {
          "activity": "畑から帰った靴の置台を使う",
          "rect": [
            5,
            12,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の保存食の蓋付き箱の棚",
      "owner": "カールとウルリケの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        3,
        1,
        2,
        2
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の保存食を取り出す",
          "rect": [
            3,
            3,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸と窓・煙突・梁、身体の操作と頭上高の立体は未照合",
    "給排水・便所・薪と灰、収納容量・寝具の乾燥と日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-farmhouse",
    "resident-カール",
    "resident-ウルリケ",
    "resident-フリッツ",
    "resident-ミア",
    "resident-ゲルトルート",
    "resident-ヴァルター"
  ],
  "origin": [
    0,
    0
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-カール",
        "chair": "A"
      },
      {
        "resident": "resident-ウルリケ",
        "chair": "B"
      },
      {
        "resident": "resident-フリッツ",
        "chair": "C"
      },
      {
        "resident": "resident-ミア",
        "chair": "E"
      },
      {
        "resident": "resident-ゲルトルート",
        "chair": "F"
      },
      {
        "resident": "resident-ヴァルター",
        "chair": "G"
      }
    ]
  },
  "parallel_use": [
    {
      "activity": "炊事と給水と家庭の保存食の取出し",
      "operations": [
        {
          "resident": "ウルリケ",
          "furniture": "H",
          "space_index": 0
        },
        {
          "resident": "カール",
          "furniture": "N",
          "space_index": 0
        },
        {
          "resident": "ヴァルター",
          "furniture": "W",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# カールとウルリケの家／1階 台所と居間

## 六人が食べる住まい

家族五人と住み込みの作男ヴァルターに別々の椅子を割り当て、家庭の調理台と食卓を分ける。畑の靴と上着は地上階で下ろし、寝具と食材の収納へ土を持ち込まない。靴の泥を落とす屋外の場所と洗い水は別に設計する。

家庭で食べる保存食は N の蓋付き箱の棚に置く。大量の穀物や飼料、町へ売る商品は [[building-barn]] と農作業の場所に分け、台所や寝室へ積まない。箱の容量と補充頻度は未照合である。

祖母と作男の私室へは階段を使わず行き、夫婦と子ども部屋へは共用階段から分かれる。

## 平面案

一セルは半メートル。

```grid
################
#SSNN.WW..JJJ..#
#SSNN.....JJJ..#
#SS............D
#SS............D
#SS.....E.A..HH#
#SS...BTTTT..HH#
#SS....TTTT....#
#SS...FTTTT....#
#SS....TTTT....#
#SS....C.G.....#
#SS............#
#SS............#
#..KK..........#
#####DD####DD###
```


## 作業中の通路

ウルリケの炊事、カールの家庭の保存食の取出し、ヴァルターの給水を同時に行う組合せを記録する。保存食の棚は北西へ寄せ、上着と靴の棚は共用にまとめる。炉を南側から扱う面と椅子の配置を組み直し、他の二人が使用面に立っていても入口・階段・寝室の戸口へ通れることを検査する。火気の離隔と立体、収納容量と日課は別に照合する。
