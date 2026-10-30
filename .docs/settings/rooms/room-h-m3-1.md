---
{
  "id": "room-h-m3-1",
  "kind": "rooms",
  "title": "フランツの醸造所／1階 仕込み場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m3",
  "floor": 0,
  "room_name": "仕込み場",
  "use": "作業",
  "occupants": [
    "フランツ",
    "マックス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###############",
      "#NNN......WWW.#",
      "#NNN......WWW.#",
      "#NNN..........#",
      "#.............#",
      "#.............#",
      "D....PPPP.....D",
      "D....PPPP.....D",
      "#....PPPP.....#",
      "#.............#",
      "#.............#",
      "#LLL......FFF.#",
      "#LLL......FFF.#",
      "#LLL......FFF.#",
      "#.............#",
      "###############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        14,
        6
      ],
      "width_cells": 2,
      "target": "room-h-m3-2",
      "target_door": [
        0,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "N",
      "name": "届いたぶどうの籠の置台",
      "owner": "フランツの醸造所",
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
          "activity": "届いたぶどうの籠の置台を使う",
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
      "symbol": "W",
      "name": "水を受けて道具を洗う台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。フランツが手入れする案",
      "rect": [
        10,
        1,
        3,
        2
      ],
      "access": [
        [
          9,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "水を受けて道具を洗う台を使う",
          "rect": [
            8,
            1,
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
      "symbol": "P",
      "name": "ぶどうの搾り台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        5,
        6,
        4,
        3
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "ぶどうの搾り台を使う",
          "rect": [
            3,
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
      "symbol": "L",
      "name": "清潔な布と栓の棚",
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
          "activity": "清潔な布と栓の棚を使う",
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
      "symbol": "F",
      "name": "仕込み樽の置台",
      "owner": "フランツの醸造所",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。フランツが手入れする案",
      "rect": [
        10,
        11,
        3,
        3
      ],
      "access": [
        [
          9,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "仕込み樽の置台を使う",
          "rect": [
            8,
            11,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage",
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
    "resident-マックス",
    "resident-フランツ"
  ],
  "origin": [
    0,
    0
  ],
  "ground_storage": [
    {
      "furniture": "N",
      "contents": "届いたぶどうの籠",
      "handler": "resident-マックス"
    },
    {
      "furniture": "F",
      "contents": "仕込み樽",
      "handler": "resident-フランツ"
    }
  ],
  "parallel_use": [
    {
      "activity": "搾り作業と道具の洗浄",
      "operations": [
        {
          "resident": "フランツ",
          "furniture": "P",
          "space_index": 0
        },
        {
          "resident": "マックス",
          "furniture": "W",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# フランツの醸造所／1階 仕込み場

## 工程と置場

[[building-h-m3]] の平面案に属する。オットーの果樹園から届くぶどうの籠を入口側で受け、搾り台と仕込み樽へ進める。水を受けて道具を洗う台と、清潔な布・栓の棚は分ける。搾りかすと汚水は原料と完成品の戻る道へ混ぜない。水の出どころ・量と保管、搾りかすの回収先、器と手の洗い方はまだ未設計である。

## 作業と住まい

フランツとマックスが担当し、食事と寝床は [[building-tavern]] に維持する。作業の使用面は身体幅で照合するが、容器や搾り台の容量・高さと操作、荷物の幅と重量、食品と排水の衛生を確認済みとはしない。建物の敷地と屋根・戸・梁と換気、原料の受取りと酒場への搬送は引き続き照合する。現行の場所と描画はまだ切り替えない。

```grid
###############
#NNN......WWW.#
#NNN......WWW.#
#NNN..........#
#.............#
#.............#
D....PPPP.....D
D....PPPP.....D
#....PPPP.....#
#.............#
#.............#
#LLL......FFF.#
#LLL......FFF.#
#LLL......FFF.#
#.............#
###############
```
