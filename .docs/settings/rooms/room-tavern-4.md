---
{
  "id": "room-tavern-4",
  "kind": "rooms",
  "title": "フランツの酒場／1階 酒蔵",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "floor": 0,
  "room_name": "1階 酒蔵",
  "use": "貯蔵",
  "occupants": [
    "フランツ",
    "リリー",
    "マックス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#BBB...CCC#",
      "#BBB...CCC#",
      "#BBB...CCC#",
      "#.........#",
      "#.........#",
      "#RRR...VVV#",
      "#RRR...VVV#",
      "#.........#",
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
      "target": "room-tavern-1",
      "target_door": [
        14,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "搬入した酒樽の置台",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。マックスが手入れする案",
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
          "activity": "搬入した酒樽の置台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
      "maintainers": [
        "resident-マックス"
      ]
    },
    {
      "symbol": "C",
      "name": "給仕へ出す酒樽の置台",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。マックスが手入れする案",
      "rect": [
        7,
        1,
        3,
        3
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "給仕へ出す酒樽の置台を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
      "maintainers": [
        "resident-マックス"
      ]
    },
    {
      "symbol": "R",
      "name": "空の器の棚",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        1,
        6,
        3,
        2
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "空の器の棚を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    },
    {
      "symbol": "V",
      "name": "樽の栓と器を手入れする台",
      "owner": "フランツの酒場",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        7,
        6,
        3,
        2
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "樽の栓と器を手入れする台を使う",
          "rect": [
            5,
            6,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-フランツ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-tavern",
    "resident-マックス",
    "resident-フランツ"
  ],
  "origin": [
    15,
    14
  ],
  "ground_storage": [
    {
      "furniture": "B",
      "contents": "酒樽",
      "handler": "resident-マックス"
    },
    {
      "furniture": "C",
      "contents": "酒樽",
      "handler": "resident-マックス"
    }
  ]
}
---
# フランツの酒場／1階 酒蔵

## 用途と配置

[[building-tavern]] の平面案に属する。酒樽は地上階へ移す案とし、客席から専用の戸で入る。樽の搬入・給仕と空の器の手入れを分ける。現行の二階の酒蔵とは異なり、描画と日課へまだ反映しない。樽の重さ・転がす経路・幅と作業姿勢は未照合である。

## 未解決の生活

酒樽の搬入から置台と給仕、空になった器と栓の手入れを分ける。酒の温度と保管、樽の重さと転がす幅、戸と床の段差、醸造の仕事場への往復は未照合である。地上階の戸でつながることを、樽を実際に運べる寸法と重量の証明にはしない。 建物全体の敷地と立体・描画への条件は [[building-tavern]] を参照する。

```grid
####DD#####
#BBB...CCC#
#BBB...CCC#
#BBB...CCC#
#.........#
#.........#
#RRR...VVV#
#RRR...VVV#
#.........#
###########
```
