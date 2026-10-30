---
{
  "id": "room-h-m3-2",
  "kind": "rooms",
  "title": "フランツの醸造所／1階 貯蔵庫",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m3",
  "floor": 0,
  "room_name": "貯蔵庫",
  "use": "貯蔵",
  "occupants": [
    "フランツ",
    "マックス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#BBB....CCC#",
      "#BBB....CCC#",
      "#BBB....CCC#",
      "#..........#",
      "#..........#",
      "D....RRR...D",
      "D....RRR...D",
      "#..........D",
      "#..........#",
      "#..........#",
      "#LLL....EEE#",
      "#LLL....EEE#",
      "#LLL....EEE#",
      "#..........#",
      "############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-h-m3-1",
      "target_door": [
        14,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        11,
        6
      ],
      "width_cells": 3,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "熟成する酒樽の置台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
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
          "activity": "熟成する酒樽の置台を使う",
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
        "resident-フランツ"
      ]
    },
    {
      "symbol": "C",
      "name": "酒場へ出す酒樽の置台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。マックスが手入れする案",
      "rect": [
        8,
        1,
        3,
        3
      ],
      "access": [
        [
          7,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "酒場へ出す酒樽の置台を使う",
          "rect": [
            6,
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
      "symbol": "L",
      "name": "清潔な空樽と器の置場",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        1,
        11,
        3,
        3
      ],
      "access": [
        [
          4,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "清潔な空樽と器の置場を使う",
          "rect": [
            4,
            11,
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
      "symbol": "E",
      "name": "戻った空樽の受け",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        8,
        11,
        3,
        3
      ],
      "access": [
        [
          7,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "戻った空樽の受けを使う",
          "rect": [
            6,
            11,
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
      "symbol": "R",
      "name": "栓と器を手入れする台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        5,
        6,
        3,
        2
      ],
      "access": [
        [
          5,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "栓と器を手入れする台を使う",
          "rect": [
            5,
            8,
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
    "水と汚水・搾りかす・洗い物、保管環境と食品の衛生は未照合",
    "原料と酒樽の寸法・重量・搬入経路、敷地と地形・立体・日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m3",
    "resident-フランツ",
    "resident-マックス"
  ],
  "origin": [
    14,
    0
  ],
  "ground_storage": [
    {
      "furniture": "B",
      "contents": "酒樽",
      "handler": "resident-フランツ"
    },
    {
      "furniture": "C",
      "contents": "酒樽",
      "handler": "resident-マックス"
    }
  ]
}
---
# フランツの醸造所／1階 貯蔵庫

## 工程と置場

[[building-h-m3]] の平面案に属する。熟成中と酒場へ出す酒樽、清潔な空樽と戻った空樽を別の置台へ割り当てる。東の搬入口は幅のある戸とし、酒樽を地上階のまま扱う。現行の二階の貯蔵庫から移す提案であり、温度・湿度と灰を避ける換気、樽の回転や転がす身体、運ぶ量と日課は未照合である。

## 作業と住まい

フランツとマックスが担当し、食事と寝床は [[building-tavern]] に維持する。作業の使用面は身体幅で照合するが、容器や搾り台の容量・高さと操作、荷物の幅と重量、食品と排水の衛生を確認済みとはしない。建物の敷地と屋根・戸・梁と換気、原料の受取りと酒場への搬送は引き続き照合する。現行の場所と描画はまだ切り替えない。

```grid
############
#BBB....CCC#
#BBB....CCC#
#BBB....CCC#
#..........#
#..........#
D....RRR...D
D....RRR...D
#..........D
#..........#
#..........#
#LLL....EEE#
#LLL....EEE#
#LLL....EEE#
#..........#
############
```
