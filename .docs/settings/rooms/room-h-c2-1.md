---
{
  "id": "room-h-c2-1",
  "kind": "rooms",
  "title": "共同の作業場／1階 木工の作業",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c2",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "room_name": "1階 木工の作業",
  "use": "共用",
  "occupants": [
    "ゴットフリート"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#TTTT..AAA#",
      "#TTTT.....#",
      "#TTTT.....#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#......BBB#",
      "#......BBB#",
      "#CC.......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        13
      ],
      "width_cells": 2,
      "target": "room-h-c2-entry",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "T",
      "name": "木工の共用作業台",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        1,
        1,
        4,
        3
      ],
      "access": [
        [
          1,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "木工の共用作業台を使う",
          "rect": [
            1,
            4,
            4,
            2
          ]
        }
      ],
      "role": "workbench"
    },
    {
      "symbol": "A",
      "name": "短い材料の受け棚",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        7,
        1,
        3,
        1
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "短い材料の受け棚を使う",
          "rect": [
            7,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "B",
      "name": "仕掛品の受け棚",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        7,
        7,
        3,
        2
      ],
      "access": [
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "仕掛品の受け棚を使う",
          "rect": [
            5,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "刃物を閉じて保管する棚",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-ゴットフリート"
      ],
      "rect": [
        1,
        9,
        2,
        1
      ],
      "access": [
        [
          1,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "刃物を閉じて保管する棚を使う",
          "rect": [
            1,
            10,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "issues": [
    "敷地と道・地形・構造と戸・窓は未照合",
    "共用設備の管理と利用の交代・手入れ、給排水と便所・火と煙・材料と廃物、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c2",
    "resident-ゴットフリート"
  ]
}
---
# 共同の作業場／1階 木工の作業

## 木工の工程

[[building-h-c2]] の木工の作業室である。短い材料を受け、台で加工し、仕掛品の棚へ戻す。刃物は閉じた棚へ納め、道具の貸出と返却は [[room-h-c2-entry]] で記録する。保守を [[resident-ゴットフリート]] が担う案とし、自分の木工所での仕事を置き換えない。

## 材料と身体

台の前に使用面を取り、戸口から仕掛品の棚へ届く経路を残す。長材を振り回す作業と大物の組立はこの平面で成立したとしない。鋸を引く距離と刃の飛出し・材料の固定、切屑と粉塵の回収、音と換気は未照合である。繊維の材料を木屑の受けとして使わない。

現行の敷地と外形への収容、構造と給排水・便所、日課と立体の照合を終えるまで描画へ採用しない。

```grid
###########
#TTTT..AAA#
#TTTT.....#
#TTTT.....#
#.........#
#.........#
#.........#
#......BBB#
#......BBB#
#CC.......#
#.........#
#.........#
#.........#
####DD#####
```
