---
{
  "id": "room-h-c1-entry",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "bed_capacity": 0,
  "title": "ハインリヒの窯場／1階 家庭の入口と身支度",
  "room_name": "1階 家庭の入口と身支度",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "仕事靴の受け",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        1,
        6,
        2,
        3
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "仕事靴の受けを使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "帰宅時の手洗い台",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "帰宅時の手洗い台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "外套と前掛けの受け",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        7,
        8,
        3,
        2
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "外套と前掛けの受けを使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        11
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c1-1",
      "target_door": [
        4,
        14
      ]
    },
    {
      "kind": "door",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target": "room-h-c1-lower-stairs",
      "target_door": [
        5,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 2,
      "target": "room-h-c1-materials",
      "target_door": [
        0,
        6
      ]
    }
  ],
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "D......WWW#",
      "D......WWW#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#RR.......D",
      "#RR.......D",
      "#RR....QQQ#",
      "#......QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# ハインリヒの窯場／1階 家庭の入口と身支度

## 用途と暮らし

[[building-h-c1]] の平面案に属する。仕事の土と灰を落として家庭へ戻る入口と身支度を持つ。娘が夜市から戻るときも、工房と屋外窯を通り抜けず上階へ行く案とする。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
D......WWW#
D......WWW#
#.........#
#.........#
#.........#
#RR.......D
#RR.......D
#RR....QQQ#
#......QQQ#
#.........#
####DD#####
```
