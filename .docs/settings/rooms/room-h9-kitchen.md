---
{
  "id": "room-h9-kitchen",
  "kind": "rooms",
  "title": "アウグストの家／1階 台所と食卓",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h9",
  "bed_capacity": 0,
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    9,
    0
  ],
  "room_name": "台所と食卓",
  "occupants": [
    "アウグスト",
    "ヘートヴィヒ",
    "ティム"
  ],
  "connections": [
    {
      "kind": "door",
      "target": "room-h9-1",
      "door": [
        0,
        9
      ],
      "width_cells": 2,
      "target_door": [
        9,
        9
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "F",
      "name": "家庭の調理炉",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の石と陶製部材で組む家庭炉の案",
      "rect": [
        6,
        1,
        2,
        2
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "飲用水の蓋付き容器台",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        1,
        1,
        2,
        1
      ],
      "access": [
        [
          1,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "飲用水の蓋付き容器台を使う",
          "rect": [
            1,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "P",
      "name": "家庭の食材棚",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        1,
        11,
        2,
        2
      ],
      "access": [
        [
          3,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            3,
            10,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "家族三人の食卓",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        3,
        5,
        2,
        2
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家族三人の食卓を使う",
          "rect": [
            5,
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
      "name": "アウグストの椅子",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        3,
        4,
        1,
        1
      ],
      "access": [
        [
          4,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "アウグストの椅子を使う",
          "rect": [
            4,
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
      "name": "ヘートヴィヒの椅子",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        5,
        5,
        1,
        1
      ],
      "access": [
        [
          6,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ヘートヴィヒの椅子を使う",
          "rect": [
            6,
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
      "name": "ティムの椅子",
      "owner": "アウグストとヘートヴィヒの世帯",
      "source": "町の木工所で製作し、世帯が修理して使う案",
      "rect": [
        3,
        7,
        1,
        1
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ティムの椅子を使う",
          "rect": [
            4,
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
    "戸の開閉・窓・換気・火気と頭上高の立体は未照合",
    "給排水・便所・燃料と灰・収納容量・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-h9",
    "resident-アウグスト",
    "resident-ヘートヴィヒ",
    "resident-ティム"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#########",
      "#WW...FF#",
      "#.....FF#",
      "#.......#",
      "#..A....#",
      "#..TTB..#",
      "#..TT...#",
      "#..C....#",
      "#.......#",
      "D.......#",
      "D.......#",
      "#PP.....#",
      "#PP.....#",
      "#########"
    ]
  },
  "use": "調理と食事",
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-アウグスト",
        "chair": "A"
      },
      {
        "resident": "resident-ヘートヴィヒ",
        "chair": "B"
      },
      {
        "resident": "resident-ティム",
        "chair": "C"
      }
    ]
  }
}
---
# アウグストの家／1階 台所と食卓

## 家族だけの調理と食事

修理する灯りと食材を分け、家族三人にそれぞれ椅子を割り当てる。台所と食卓を地上階に置き、アウグストとヘートヴィヒが食事のたびに階段を使う間取りにしない。ティムも共用の階段と修理場を経て食卓へ来る。

給水元、洗い場、汚水と灰、薪と煙突は未設計であり、炉と水の容器を置いたことを台所の完成と扱わない。

## 平面案

一セルは半メートル。戸口は共有壁の同じ位置へ合わせる。

```grid
#########
#WW...FF#
#.....FF#
#.......#
#..A....#
#..TTB..#
#..TT...#
#..C....#
#.......#
D.......#
D.......#
#PP.....#
#PP.....#
#########
```
