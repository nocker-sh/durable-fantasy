---
{
  "id": "room-apothecary-5",
  "kind": "rooms",
  "title": "イルムガルトの薬屋／2階 薬草の乾燥と仕分け",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-apothecary",
  "floor": 1,
  "room_name": "2階 薬草の乾燥と仕分け",
  "use": "貯蔵",
  "occupants": [
    "イルムガルト",
    "エーファ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#.........#",
      "#TTT...LLL#",
      "#TTT...LLL#",
      "#.........#",
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
      "target": "room-apothecary-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "薬草を広げる乾燥枠甲",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        1,
        1,
        2,
        5
      ],
      "access": [
        [
          3,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "薬草を広げる乾燥枠甲を使う",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "S",
      "name": "薬草を広げる乾燥枠乙",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
      "rect": [
        8,
        1,
        2,
        5
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "薬草を広げる乾燥枠乙を使う",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "乾きと異物を確かめる台",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
      ],
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
          "activity": "乾きと異物を確かめる台を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "乾燥後の薬草の受け",
      "owner": "イルムガルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。イルムガルトが手入れする案",
      "maintainers": [
        "resident-イルムガルト"
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
          "activity": "乾燥後の薬草の受けを使う",
          "rect": [
            5,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "薬草と薬の保管条件・乾燥と調合の衛生、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-apothecary",
    "resident-イルムガルト",
    "resident-エーファ"
  ],
  "origin": [
    15,
    14
  ],
  "private_for": [
    "resident-イルムガルト",
    "resident-エーファ"
  ]
}
---
# イルムガルトの薬屋／2階 薬草の乾燥と仕分け

## 用途と暮らし

[[building-apothecary]] の平面案に属する。薬草の乾燥と仕分けを行う仕事の部屋であり、人の寝間ではない。乾燥枠と確認台・乾燥後の受けを分ける。換気と灰・湿度、必要な面積と時間、原料ごとの衛生と保管条件は未照合である。

## 未解決の条件

敷地と構造・戸と窓、薬の調合と乾燥・保管の衛生と作業量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#RR.....SS#
#RR.....SS#
#RR.....SS#
#RR.....SS#
#RR.....SS#
#.........#
#TTT...LLL#
#TTT...LLL#
#.........#
#.........#
###########
```
