---
{
  "id": "room-h-g5-care",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "bed_capacity": 0,
  "title": "クリスティアンの家／1階 訪問の籠と布の手入れ",
  "room_name": "訪問の籠と布の手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    0
  ],
  "use": "作業",
  "occupants": [
    "ドロテア"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "清潔な仕事の布の閉じた棚",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        1,
        1,
        3,
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
          "activity": "清潔な仕事の布の閉じた棚を使う",
          "rect": [
            1,
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
      "name": "持ち出す籠の台",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
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
          "activity": "持ち出す籠の台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "W",
      "name": "仕事の布と道具を確かめる台",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
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
          "activity": "仕事の布と道具を確かめる台を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "role": "workbench"
    },
    {
      "symbol": "Q",
      "name": "持ち帰った物の閉じた受け",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
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
          "activity": "持ち帰った物の閉じた受けを使う",
          "rect": [
            5,
            6,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "K",
      "name": "仕事の洗い台",
      "owner": "ドロテア",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ドロテアが手入れする案",
      "maintainers": [
        "resident-ドロテア"
      ],
      "rect": [
        7,
        9,
        3,
        1
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "仕事の洗い台を使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-h-g5-entry",
      "target_door": [
        14,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン"
  ],
  "private_for": [
    "resident-ドロテア"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#......BBB#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#WWW...QQQ#",
      "#WWW...QQQ#",
      "#.........#",
      "#......KKK#",
      "####DD#####"
    ]
  }
}
---
# クリスティアンの家／1階 訪問の籠と布の手入れ

## 用途と暮らし

[[building-h-g5]] の平面案に属する。仕事に持ち出す籠と清潔な布、確認と折り畳み、持ち帰った物と仕事の洗い台を分ける。家に患者の寝台や処置の設備を加える前提にしない。洗いと乾燥・衛生、訪問先との往復と夜の呼出しは未照合である。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#......BBB#
#.........#
#.........#
#.........#
#WWW...QQQ#
#WWW...QQQ#
#.........#
#......KKK#
####DD#####
```
