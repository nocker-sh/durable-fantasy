---
{
  "id": "room-h-c5-processing",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c5",
  "bed_capacity": 0,
  "title": "ベルンハルトの家／1階 掃除道具と仕事着の手入れ",
  "room_name": "掃除道具と仕事着の手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    14
  ],
  "use": "貯蔵",
  "occupants": [
    "ベルンハルト",
    "モニカ",
    "トビアス"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "煙突ぶらしと継ぎ竿の棚",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        1,
        1,
        3,
        4
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "煙突ぶらしと継ぎ竿の棚を使う",
          "rect": [
            4,
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
      "name": "屋根の掃除道具と縄の棚",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        7,
        1,
        3,
        4
      ],
      "access": [
        [
          6,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "屋根の掃除道具と縄の棚を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "R",
      "name": "煤の付いた仕事着と洗う前の受け",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        1,
        8,
        3,
        3
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "煤の付いた仕事着と洗う前の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "使用後の道具と廃物の閉じた受け",
      "owner": "ベルンハルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベルンハルトが手入れする案",
      "maintainers": [
        "resident-ベルンハルト"
      ],
      "rect": [
        7,
        8,
        3,
        3
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "使用後の道具と廃物の閉じた受けを使う",
          "rect": [
            5,
            9,
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
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-h-c5-entry",
      "target_door": [
        10,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        5
      ],
      "width_cells": 3,
      "target": "map-phanthiet-craft"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c5",
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "private_for": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........D",
      "D.........D",
      "D.........D",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "###########"
    ]
  }
}
---
# ベルンハルトの家／1階 掃除道具と仕事着の手入れ

## 用途と暮らし

[[building-h-c5]] の平面案に属する。煙突ぶらしと継ぎ竿、屋根の道具と縄、煤の付いた仕事着、使用後の道具と廃物を家庭の衣服と分ける。ここでできる軽い手入れと、仕事の現場や屋根で行う作業は同じ担当量とはしない。

## 未解決の条件

敷地と構造・戸と窓、灰と煤の温度と由来・粉塵と密閉・荷重と運搬、汚水と廃物、家庭の給排水と便所・衣服と寝具、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........D
D.........D
D.........D
#RRR...QQQ#
#RRR...QQQ#
#RRR...QQQ#
###########
```
