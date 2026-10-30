---
{
  "id": "room-woodworker-kitchen",
  "kind": "rooms",
  "title": "ゴットフリートの木工所／2階 家族の台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-woodworker",
  "floor": 1,
  "room_name": "2階 家族の台所",
  "use": "台所",
  "occupants": [
    "ゴットフリート",
    "アントン"
  ],
  "bed_capacity": 0,
  "origin": [
    5,
    0
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "家族の調理炉",
      "owner": "woodworker",
      "source": "石工の調理炉と鍛冶屋の金物",
      "rect": [
        8,
        1,
        2,
        2
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "家族の食事を調理する",
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
      "name": "家庭の下ごしらえ台",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        4,
        1,
        2,
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
      "owner": "woodworker",
      "source": "陶工の容器と井戸から本人たちが運ぶ水",
      "rect": [
        6,
        1,
        1,
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
          "activity": "飲用水を取り出す",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "父子の食卓",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        4,
        2,
        2
      ],
      "access": [
        [
          3,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "食事を配膳する",
          "rect": [
            3,
            2,
            2,
            3
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
      "name": "ゴットフリートの椅子",
      "owner": "ゴットフリート",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        3,
        1,
        1
      ],
      "access": [
        [
          2,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "食卓へ出入りする",
          "rect": [
            2,
            2,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "アントンの椅子",
      "owner": "アントン",
      "source": "木工所で組む木製の家具",
      "rect": [
        3,
        5,
        1,
        1
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "食卓へ出入りする",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "F",
      "name": "蓋付きの食材箱",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        8,
        4,
        2,
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
          "activity": "食材を出し入れする",
          "rect": [
            8,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "R",
      "name": "食器の洗い桶",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        9,
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
          "activity": "食器を洗って受ける",
          "rect": [
            7,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "汚水の蓋付き容器",
      "owner": "woodworker",
      "source": "木工所で組む木製の家具",
      "rect": [
        1,
        7,
        1,
        1
      ],
      "access": [
        [
          2,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "汚水を運び出す",
          "rect": [
            2,
            6,
            2,
            2
          ]
        }
      ]
    }
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "D...KKW.OO#",
      "D.......OO#",
      "#A........#",
      "#TT.....FF#",
      "#TTB......#",
      "#.........#",
      "#Q.......R#",
      "#####DD####"
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
      "target": "room-woodworker-stairs",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target_door": [
        5,
        1
      ]
    },
    {
      "kind": "door",
      "target": "room-woodworker-2",
      "door": [
        5,
        8
      ],
      "width_cells": 2,
      "target_door": [
        5,
        0
      ]
    }
  ],
  "private_for": [
    "resident-ゴットフリート",
    "resident-アントン"
  ],
  "issues": [
    "木屑と居住部の隔離・戸と金具・梁と床の立体照合未完了",
    "便所・換気と排煙・水と灰や汚水の搬出先は未確定"
  ],
  "design_dependencies": [
    "building-woodworker",
    "room-woodworker-stairs",
    "room-woodworker-2",
    "facility-square-well"
  ]
}
---

# ゴットフリートの木工所／2階 家族の台所

## 木工台を食卓にしない

工房の上に家族の台所と食卓を設け、木屑・刃物・仕掛品のある作業台で調理や食事をしない。[[room-woodworker-stairs]]の戸を通って入り、食事の先で[[room-woodworker-2]]へつながる。働きに来るニクラスをこの家の同居人へ変えず、本人の世帯と夜食の日課を保持する。

## 水と火と片付け

食材を下ごしらえし、調理して配膳する。飲用水と洗い物・汚水を分け、運ぶ容器に蓋をする。炉は東の外壁沿いに排煙する案とし、木材や仕掛品を台所へ積まない。井戸からの運搬と灰・汚水の搬出、工房への木屑の出入りは日課と立体で照合する。

## 平面案

```grid
###########
D...KKW.OO#
D.......OO#
#A........#
#TT.....FF#
#TTB......#
#.........#
#Q.......R#
#####DD####
```

これは再設計で追加する区画である。戸と金具、換気と排煙、食器と収納の容量、火と床・梁の納まりは未確定である。
