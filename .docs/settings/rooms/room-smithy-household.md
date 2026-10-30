---
{
  "id": "room-smithy-household",
  "kind": "rooms",
  "title": "ギュンターの鍛冶場／1階 食事と身支度",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-smithy",
  "bed_capacity": 0,
  "occupants": [
    "ギュンター",
    "ペーター"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    12
  ],
  "room_name": "食事と身支度",
  "connections": [
    {
      "kind": "door",
      "door": [
        7,
        0
      ],
      "width_cells": 2,
      "target": "room-smithy-1",
      "target_door": [
        7,
        12
      ]
    },
    {
      "kind": "door",
      "door": [
        5,
        9
      ],
      "width_cells": 2,
      "target": "map-phanthiet"
    },
    {
      "kind": "door",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target": "room-smithy-lower-stairs",
      "target_door": [
        5,
        15
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          1,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の下ごしらえ台を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "ギュンターの世帯",
      "source": "町の石工が炉体を積み、必要な金具は鍛冶場で製作する案。ギュンターが手入れする案",
      "rect": [
        5,
        1,
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
          "activity": "家庭の調理炉を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台と給水の受け",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。ギュンターが手入れする案",
      "rect": [
        1,
        6,
        3,
        1
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台と給水の受けを使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "Q",
      "name": "仕事靴と上着の受け",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        1,
        8,
        3,
        1
      ],
      "access": [
        [
          4,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "仕事靴と上着の受けを使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "T",
      "name": "家庭の食卓",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食卓を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "B",
        "C"
      ],
      "maintainers": [
        "resident-ギュンター"
      ],
      "role": "table"
    },
    {
      "symbol": "B",
      "name": "ギュンターの椅子",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        6,
        5,
        1,
        1
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ギュンターの椅子を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "C",
      "name": "ペーターの椅子",
      "owner": "ギュンターの世帯",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        8,
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
          "activity": "ペーターの椅子を使う",
          "rect": [
            6,
            7,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ギュンター"
      ]
    }
  ],
  "issues": [
    "火気と炭・火花・熱い加工品、換気と煙突・灰の隔離は未照合",
    "敷地と戸・窓・梁、給排水と便所、仕事と休息・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-smithy",
    "resident-ギュンター",
    "resident-ペーター"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ギュンター",
        "chair": "B"
      },
      {
        "resident": "resident-ペーター",
        "chair": "C"
      }
    ]
  },
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#######DD####",
      "#KKK.OO..NNN#",
      "#KKK.OO..NNN#",
      "D...........#",
      "D...........#",
      "#.....BTTT..#",
      "#WWW...TTT..#",
      "#.......C...#",
      "#QQQ........#",
      "#####DD######"
    ]
  }
}
---
# ギュンターの鍛冶場／1階 食事と身支度

## 用途と暮らし

[[building-smithy]] の平面案に属する。鍛冶場の道具と家庭の食材を分け、仕事靴と上着を下ろしてから調理と食事をする。二人の席を個別に持つ。煤と汚れを持ち込まない切替、給排水と食品の扱い、私物と仕事の時間は未照合である。

## 現行との差と未解決の条件

現行の奥の相部屋から上階の個室と家庭の区画へ分ける提案であり、描画や日課を切替済みとはしない。建物の敷地、火と煙・灰と家庭の分離、戸の開閉と視線・音、衣服と寝具の手入れ、体の高さと姿勢を引き続き照合する。

```grid
#######DD####
#KKK.OO..NNN#
#KKK.OO..NNN#
D...........#
D...........#
#.....BTTT..#
#WWW...TTT..#
#.......C...#
#QQQ........#
#####DD######
```
