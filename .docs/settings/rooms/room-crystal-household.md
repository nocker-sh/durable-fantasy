---
{
  "id": "room-crystal-household",
  "kind": "rooms",
  "title": "コンスタンティンの結晶屋／2階 台所と食事",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-crystal",
  "bed_capacity": 0,
  "occupants": [
    "コンスタンティン"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    5,
    11
  ],
  "room_name": "2階 台所と食事",
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        3
      ],
      "width_cells": 2,
      "target": "room-crystal-upper-stairs",
      "target_door": [
        5,
        14
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
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
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の調理炉",
      "owner": "コンスタンティン",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。コンスタンティンが手入れする案",
      "rect": [
        5,
        1,
        2,
        2
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の調理炉を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        9,
        1,
        3,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            9,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        1,
        6,
        3,
        1
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ]
    },
    {
      "symbol": "T",
      "name": "一人の食卓",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        7,
        5,
        3,
        2
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "一人の食卓を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "B"
      ],
      "maintainers": [
        "resident-コンスタンティン"
      ],
      "role": "table"
    },
    {
      "symbol": "B",
      "name": "コンスタンティンの食事の椅子",
      "owner": "コンスタンティン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。コンスタンティンが手入れする案",
      "rect": [
        6,
        5,
        1,
        1
      ],
      "access": [
        [
          5,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "コンスタンティンの食事の椅子を使う",
          "rect": [
            4,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat",
      "maintainers": [
        "resident-コンスタンティン"
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "結晶の保管と仕入れ・計量・防犯、家庭の給排水と便所・火と灰、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-crystal",
    "resident-コンスタンティン"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-コンスタンティン",
        "chair": "B"
      }
    ]
  },
  "private_for": [
    "resident-コンスタンティン"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#############",
      "#KKK.OO..NNN#",
      "#KKK.OO..NNN#",
      "D...........#",
      "D...........#",
      "#.....BTTT..#",
      "#WWW...TTT..#",
      "#...........#",
      "#...........#",
      "#...........#",
      "#############"
    ]
  }
}
---
# コンスタンティンの結晶屋／2階 台所と食事

## 用途と暮らし

[[building-crystal]] の平面案に属する。一人の食材・下ごしらえ・調理と洗い物、食事の席を持つ。結晶の計量と包み直しを食卓の用途に混ぜない。

## 未解決の条件

戸と窓・視線と音、結晶の仕入れと搬送・保管条件、錠と計量・商品の量、給排水と便所・家庭の火と灰、衣服と寝具の手入れ、日課と立体は未照合である。現行の建物と描画は切り替えない。

```grid
#############
#KKK.OO..NNN#
#KKK.OO..NNN#
D...........#
D...........#
#.....BTTT..#
#WWW...TTT..#
#...........#
#...........#
#...........#
#############
```
