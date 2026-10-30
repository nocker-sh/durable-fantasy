---
{
  "id": "room-leather-2",
  "kind": "rooms",
  "title": "ルドルフの革工房／1階 なめし場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-leather",
  "floor": 0,
  "room_name": "なめし場",
  "use": "作業",
  "occupants": [
    "ルドルフ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######DD#####",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#AAA.....BBB#",
      "#...........#",
      "#...........D",
      "#...........D",
      "#CCC.....QQQ#",
      "#CCC.....QQQ#",
      "#############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        6,
        0
      ],
      "width_cells": 2,
      "target": "room-leather-1",
      "target_door": [
        6,
        12
      ]
    },
    {
      "kind": "door",
      "door": [
        12,
        5
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "受け取った皮の受け",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
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
          "activity": "受け取った皮の受けを使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "wet_work",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "B",
      "name": "なめし桶",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        9,
        1,
        3,
        3
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "なめし桶を使う",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "wet_work",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "C",
      "name": "水切りと途中の革の枠",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "水切りと途中の革の枠を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ],
      "role": "wet_work",
      "maintainers": [
        "resident-ルドルフ"
      ]
    },
    {
      "symbol": "Q",
      "name": "端材と使用後の受け",
      "owner": "ルドルフ",
      "source": "町の木工所・鍛冶場へ用途に合う部材と製作を頼む案。ルドルフが手入れする案",
      "rect": [
        9,
        7,
        3,
        2
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "端材と使用後の受けを使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "wet_work",
      "maintainers": [
        "resident-ルドルフ"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "なめしの工程・水と薬剤・汚水・臭気、乾燥量と搬送、家庭の生活設備・日課・描画は未照合"
  ],
  "design_dependencies": [
    "building-leather",
    "resident-ルドルフ"
  ],
  "origin": [
    5,
    12
  ],
  "private_for": [
    "resident-ルドルフ"
  ]
}
---
# ルドルフの革工房／1階 なめし場

## 用途と暮らし

[[building-leather]] の平面案に属する。受け取った皮、なめし桶、水切りと途中の革、端材と使用後の受けを別の家具へ分ける。東の専用入口から皮を入れる案とし、家の階段を搬入路にしない。なめしの方法と薬剤・水量、排水の処理、皮の大きさと乾燥時間・保管環境は未確定である。

## 未解決の条件

敷地と構造、戸・窓・梁と換気、作業の水と汚れ・薬剤・皮の運搬、給排水と便所・家庭の火、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
######DD#####
#AAA.....BBB#
#AAA.....BBB#
#AAA.....BBB#
#...........#
#...........D
#...........D
#CCC.....QQQ#
#CCC.....QQQ#
#############
```
