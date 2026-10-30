---
{
  "id": "room-smithy-1",
  "kind": "rooms",
  "title": "ギュンターの鍛冶場／1階 開け放しの鍛冶場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-smithy",
  "floor": 0,
  "room_name": "開け放しの鍛冶場",
  "use": "作業",
  "occupants": [
    "ギュンター",
    "ペーター"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#FFF.....WWW#",
      "#FFF.....WWW#",
      "#FFF........#",
      "#.....AA....D",
      "#.....AA....D",
      "#BB.........D",
      "#BB.........D",
      "#........RRR#",
      "#CCC.....RRR#",
      "#CCC.....TTT#",
      "#........TTT#",
      "#######DD####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        7,
        12
      ],
      "width_cells": 2,
      "target": "room-smithy-household",
      "target_door": [
        7,
        0
      ]
    },
    {
      "kind": "opening",
      "door": [
        12,
        4
      ],
      "width_cells": 4,
      "target": "map-phanthiet"
    }
  ],
  "furniture": [
    {
      "symbol": "F",
      "name": "鍛冶の火床",
      "owner": "ギュンターの鍛冶場",
      "source": "町の石工が炉体を積み、必要な金具は鍛冶場で製作する案。ギュンターが手入れする案",
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
          "activity": "鍛冶の火床を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "forge_fire",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "A",
      "name": "金床と台",
      "owner": "ギュンターの鍛冶場",
      "source": "鍛冶場で使う金属の作業設備を調達する案。製造元と運搬は未確定。ギュンターが手入れする案",
      "rect": [
        6,
        4,
        2,
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
          "activity": "金床と台を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "anvil",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "B",
      "name": "熱い加工品を置いて冷ます台",
      "owner": "ギュンターの鍛冶場",
      "source": "鍛冶場で使う金属の作業設備を調達する案。製造元と運搬は未確定。ギュンターが手入れする案",
      "rect": [
        1,
        6,
        2,
        2
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "熱い加工品を置いて冷ます台を使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ],
      "role": "hot_cooling",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "C",
      "name": "蓋付きの炭の受け",
      "owner": "ギュンターの鍛冶場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        1,
        9,
        3,
        2
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "蓋付きの炭の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "fuel_storage",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "T",
      "name": "冷めた品と道具の棚",
      "owner": "ギュンターの鍛冶場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        9,
        10,
        3,
        2
      ],
      "access": [
        [
          8,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "冷めた品と道具の棚を使う",
          "rect": [
            7,
            10,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage",
      "maintainers": [
        "resident-ギュンター"
      ]
    },
    {
      "symbol": "W",
      "name": "加工用の水の受け",
      "owner": "ギュンターの鍛冶場",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。ギュンターが手入れする案",
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "加工用の水の受けを使う",
          "rect": [
            7,
            1,
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
      "symbol": "R",
      "name": "客の品を受け渡す台",
      "owner": "ギュンターの鍛冶場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ギュンターが手入れする案",
      "rect": [
        9,
        8,
        3,
        2
      ],
      "access": [
        [
          8,
          8
        ],
        [
          10,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "客の品を受け渡す台を使う",
          "rect": [
            7,
            8,
            2,
            2
          ]
        },
        {
          "activity": "客へ冷めた品を渡す",
          "rect": [
            9,
            6,
            2,
            2
          ]
        }
      ],
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
    "resident-ギュンター"
  ],
  "origin": [
    5,
    0
  ],
  "hot_work": {
    "handler": "resident-ギュンター",
    "heat_sources": [
      "F"
    ],
    "cooling": [
      "B"
    ],
    "finished": [
      "T"
    ],
    "fuel": [
      "C"
    ]
  }
}
---
# ギュンターの鍛冶場／1階 開け放しの鍛冶場

## 用途と暮らし

[[building-smithy]] の平面案に属する。火床、金床、熱い加工品を冷ます台、冷めた品と道具、炭と加工用水を別の用途へ置く。東側の一部を開けた作業場とし、客の受渡しをその側へ寄せる。開口を架空の閉じた壁や扉として描かない。火花と熱い金属、工具を振る範囲と冷ます時間、炭と水の補充・灰と排水、客との隔離は未照合である。

## 現行との差と未解決の条件

現行の奥の相部屋から上階の個室と家庭の区画へ分ける提案であり、描画や日課を切替済みとはしない。建物の敷地、火と煙・灰と家庭の分離、戸の開閉と視線・音、衣服と寝具の手入れ、体の高さと姿勢を引き続き照合する。

```grid
#############
#FFF.....WWW#
#FFF.....WWW#
#FFF........#
#.....AA....D
#.....AA....D
#BB.........D
#BB.........D
#........RRR#
#CCC.....RRR#
#CCC.....TTT#
#........TTT#
#######DD####
```
