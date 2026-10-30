---
{
  "id": "room-h-c2-mixing",
  "kind": "rooms",
  "title": "共同の作業場／1階 かまどと調合",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c2",
  "floor": 0,
  "origin": [
    15,
    13
  ],
  "room_name": "1階 かまどと調合",
  "use": "共用",
  "occupants": [
    "イルムガルト"
  ],
  "bed_capacity": 0,
  "guest_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#......HHH#",
      "#......HHH#",
      "#.........#",
      "#.........#",
      "D.........#",
      "D.........#",
      "#.........#",
      "#TTTT..AAA#",
      "#TTTT.....#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        5
      ],
      "width_cells": 2,
      "target": "room-h-c2-entry",
      "target_door": [
        10,
        5
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c2-weaving",
      "target_door": [
        4,
        13
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "共用の調理かまど",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        7,
        1,
        3,
        2
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "共用の調理かまどを使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "role": "hearth"
    },
    {
      "symbol": "T",
      "name": "共用の調合台",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        8,
        4,
        2
      ],
      "access": [
        [
          1,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "共用の調合台を使う",
          "rect": [
            1,
            5,
            3,
            3
          ]
        }
      ],
      "role": "workbench"
    },
    {
      "symbol": "A",
      "name": "調合に使う閉じた器の棚",
      "owner": "町の共同作業場",
      "source": "町の職人へ製作と部材の調達を頼む案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        7,
        8,
        3,
        1
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "調合に使う閉じた器の棚を使う",
          "rect": [
            7,
            9,
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
    "resident-イルムガルト"
  ]
}
---
# 共同の作業場／1階 かまどと調合

## かまどと調合の区画

[[building-h-c2]] の共用かまどと調合台を持つ。[[resident-イルムガルト]] が器と作業面を手入れする案であり、本人の薬屋の勤務とは別に所要時間を照合する。材料は各レシピの定義、加工の規則は `world/core/craft-command.ts`を参照する。

## 調理と調合の切替

調合に使う器の棚を持つが、食器と無条件に共用しない。材料ごとの残留物と洗い・乾燥、調理と調合を交代する条件、熱い容器と燃料・灰・清潔な水と汚水の受けは未設計である。隣の [[room-h-c2-weaving]] へ火の粉と煙や蒸気を流さない。金属を加熱する炉は [[facility-craft-forge]] へ分ける。

現行の敷地と外形への収容、構造と給排水・便所、日課と立体の照合を終えるまで描画へ採用しない。

```grid
####DD#####
#......HHH#
#......HHH#
#.........#
#.........#
D.........#
D.........#
#.........#
#TTTT..AAA#
#TTTT.....#
#.........#
#.........#
###########
```
