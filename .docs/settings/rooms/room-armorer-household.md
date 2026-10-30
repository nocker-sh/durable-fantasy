---
{
  "id": "room-armorer-household",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "bed_capacity": 0,
  "title": "ベアトリクスの防具屋／2階 家庭の台所と食事",
  "room_name": "2階 家庭の台所と食事",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    14
  ],
  "use": "生活",
  "occupants": [
    "ベアトリクス",
    "ルイーゼ"
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          1,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の下ごしらえ台を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "ベアトリクス",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。ベアトリクスが手入れする案",
      "rect": [
        6,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の煮炊きの炉を使う",
          "rect": [
            6,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        12,
        1,
        3,
        2
      ],
      "access": [
        [
          12,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            12,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "W",
      "name": "身支度と食器の洗い台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        1,
        8,
        3,
        2
      ],
      "access": [
        [
          4,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "身支度と食器の洗い台を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        10,
        7,
        3,
        2
      ],
      "access": [
        [
          10,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "二人の食卓を使う",
          "rect": [
            10,
            5,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "B",
        "C"
      ],
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "B",
      "name": "ベアトリクスの椅子",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        9,
        7,
        1,
        1
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ベアトリクスの椅子を使う",
          "rect": [
            7,
            6,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ベアトリクス"
      ]
    },
    {
      "symbol": "C",
      "name": "ルイーゼの椅子",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "rect": [
        13,
        7,
        1,
        1
      ],
      "access": [
        [
          14,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ルイーゼの椅子を使う",
          "rect": [
            14,
            6,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-ベアトリクス"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-armorer-upper-hall",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "private_for": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########DD#########",
      "#KKK..OO....NNN.....#",
      "#KKK..OO....NNN.....#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#...................#",
      "#........BTTTC......#",
      "#WWW......TTT.......#",
      "#WWW................#",
      "#...................#",
      "#####################"
    ]
  },
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ベアトリクス",
        "chair": "B"
      },
      {
        "resident": "resident-ルイーゼ",
        "chair": "C"
      }
    ]
  }
}
---
# ベアトリクスの防具屋／2階 家庭の台所と食事

## 用途と暮らし

[[building-armorer]] の平面案に属する。二人の家庭の下ごしらえと調理・食材と食器、洗い物と食事の席を持つ。仕事の油と研ぎくず・金属粉を食卓と家庭の洗い台へ持ち込まない。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#KKK..OO....NNN.....#
#KKK..OO....NNN.....#
#...................#
#...................#
#...................#
#...................#
#........BTTTC......#
#WWW......TTT.......#
#WWW................#
#...................#
#####################
```
