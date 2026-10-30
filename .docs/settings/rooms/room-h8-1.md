---
{
  "id": "room-h8-1",
  "kind": "rooms",
  "title": "オットーとクララの家／1階 居間",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h8",
  "floor": 0,
  "room_name": "居間",
  "use": "食事",
  "occupants": [
    "オットー",
    "クララ",
    "ヨナス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##############",
      "#SS.......FF.#",
      "#SS.......FF.#",
      "#SS..........#",
      "#SS....A.....#",
      "#SS....TTB...#",
      "#SS....TT....#",
      "#SS....C.....#",
      "#SS..........#",
      "#SS..........#",
      "#SS..EE...W..D",
      "#SS..........D",
      "#SS..........#",
      "#####DD#######"
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
        13,
        10
      ],
      "width_cells": 2
    },
    {
      "kind": "door",
      "target": "room-h8-2",
      "door": [
        5,
        13
      ],
      "width_cells": 2,
      "target_door": [
        5,
        0
      ]
    },
    {
      "kind": "stair",
      "target": "room-h8-stairs",
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
      "name": "西の直階段",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
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
          "activity": "西の直階段を使う",
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
      "name": "家族三人の食卓",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        5,
        2,
        2
      ],
      "access": [
        [
          9,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家族三人の食卓を使う",
          "rect": [
            9,
            6,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "A",
        "B",
        "C"
      ],
      "role": "table"
    },
    {
      "symbol": "A",
      "name": "オットーの椅子",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        4,
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
          "activity": "オットーの椅子を使う",
          "rect": [
            8,
            3,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "クララの椅子",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        9,
        5,
        1,
        1
      ],
      "access": [
        [
          10,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "クララの椅子を使う",
          "rect": [
            10,
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
      "name": "ヨナスの椅子",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        7,
        7,
        1,
        1
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ヨナスの椅子を使う",
          "rect": [
            8,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "F",
      "name": "家庭で食べる果物の小籠",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        10,
        1,
        2,
        2
      ],
      "access": [
        [
          9,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家庭で食べる果物の小籠を使う",
          "rect": [
            8,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "E",
      "name": "果樹園の上着と靴の棚",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        5,
        10,
        2,
        1
      ],
      "access": [
        [
          7,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "果樹園の上着と靴の棚を使う",
          "rect": [
            7,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "家庭用の洗濯桶",
      "owner": "オットーとクララの世帯",
      "source": "町の木工所で作り、世帯が手入れする家具",
      "rect": [
        10,
        10,
        1,
        1
      ],
      "access": [
        [
          9,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "家庭用の洗濯桶を使う",
          "rect": [
            8,
            9,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "戸と枠・操作する身体・窓と換気の立体照合は未完了",
    "便所・灰・汚水の搬出先、容器容量と日課・描画の照合は未完了"
  ],
  "design_dependencies": [
    "building-h8",
    "resident-オットー",
    "resident-クララ",
    "resident-ヨナス"
  ],
  "origin": [
    0,
    0
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-オットー",
        "chair": "A"
      },
      {
        "resident": "resident-クララ",
        "chair": "B"
      },
      {
        "resident": "resident-ヨナス",
        "chair": "C"
      }
    ]
  }
}
---
# オットーとクララの家／1階 居間

## 店から帰る家族の居間

家族三人が同じ食卓へ座る。オットーの果物売り場は広場にあり、この家を来客の売り場へ変えない。居間の籠は家で食べる分だけを受け、店の商品・傷んだ果物・果樹園の大量の収穫物を通路へ積まない。

入口で果樹園の上着と靴を下ろし、清潔な寝具へ泥を上げない。洗濯桶は家庭の衣類に使う。クララの客の洗濯物を売り物の果物と混ぜず、仕事の洗濯場との受渡しと乾燥は別に設計する。西の階段から共用通路へ上がり、互いの寝室を通らず眠れるようにする。

## 平面

一セルは半メートル。隣室と共有する壁と戸口は建物の原点で合わせる。

```grid
##############
#SS.......FF.#
#SS.......FF.#
#SS..........#
#SS....A.....#
#SS....TTB...#
#SS....TT....#
#SS....C.....#
#SS..........#
#SS..........#
#SS..EE...W..D
#SS..........D
#SS..........#
#####DD#######
```
