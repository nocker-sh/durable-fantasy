---
{
  "id": "room-h-c3-1",
  "kind": "rooms",
  "title": "エマの家／1階 家庭の台所と四人の食事",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "floor": 0,
  "room_name": "1階 家庭の台所と四人の食事",
  "use": "台所",
  "occupants": [
    "エマ",
    "ニクラス",
    "フリーダ",
    "ローゼマリー"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########DD#########",
      "#KKK.............OOO#",
      "#KKK.............OOO#",
      "#.......ATTTB....OOO#",
      "#........TTT........#",
      "#NNN.....C.E.....WWW#",
      "#NNN.............WWW#",
      "#####################"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-h-c3-entry",
      "target_door": [
        10,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        1,
        1,
        3,
        2
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の下ごしらえ台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "エマ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        17,
        1,
        3,
        3
      ],
      "access": [
        [
          16,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の煮炊きの炉を使う",
          "rect": [
            15,
            1,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        1,
        5,
        3,
        2
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        17,
        5,
        3,
        2
      ],
      "access": [
        [
          16,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            15,
            5,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "四人の食卓",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        9,
        3,
        3,
        2
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "四人の食卓を使う",
          "rect": [
            9,
            1,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "A",
        "B",
        "C",
        "E"
      ]
    },
    {
      "symbol": "A",
      "name": "エマの椅子",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        8,
        3,
        1,
        1
      ],
      "access": [
        [
          7,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "エマの椅子を使う",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "B",
      "name": "ニクラスの椅子",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        12,
        3,
        1,
        1
      ],
      "access": [
        [
          13,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "ニクラスの椅子を使う",
          "rect": [
            13,
            2,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "フリーダの椅子",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        9,
        5,
        1,
        1
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "フリーダの椅子を使う",
          "rect": [
            7,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "ローゼマリーの椅子",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        11,
        5,
        1,
        1
      ],
      "access": [
        [
          12,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "ローゼマリーの椅子を使う",
          "rect": [
            12,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "origin": [
    5,
    18
  ],
  "private_for": [
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-エマ",
        "chair": "A"
      },
      {
        "resident": "resident-ニクラス",
        "chair": "B"
      },
      {
        "resident": "resident-フリーダ",
        "chair": "C"
      },
      {
        "resident": "resident-ローゼマリー",
        "chair": "E"
      }
    ]
  }
}
---
# エマの家／1階 家庭の台所と四人の食事

## 用途と暮らし

[[building-h-c3]] の平面案に属する。四人分の調理と食材・洗い物、本人ごとの食事の席を持つ。柳を湿らせる桶や端材の受けを家庭の食器と混ぜない。ローゼマリーは地上階のまま食事へ来られる。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
##########DD#########
#KKK.............OOO#
#KKK.............OOO#
#.......ATTTB....OOO#
#........TTT........#
#NNN.....C.E.....WWW#
#NNN.............WWW#
#####################
```
