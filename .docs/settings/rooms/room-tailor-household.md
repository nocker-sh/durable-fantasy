---
{
  "id": "room-tailor-household",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "bed_capacity": 0,
  "title": "マグダレーナの仕立て屋／2階 家庭の台所と食事",
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
    "マグダレーナ",
    "ロッテ"
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭の下ごしらえ台",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        1,
        2,
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
      ]
    },
    {
      "symbol": "O",
      "name": "家庭の煮炊きの炉",
      "owner": "マグダレーナ",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
        1,
        2,
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
          "activity": "家庭の煮炊きの炉を使う",
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
      "symbol": "N",
      "name": "家庭の食材棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        9,
        2,
        2
      ],
      "access": [
        [
          3,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            3,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "W",
      "name": "家庭の洗い台",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
        9,
        2,
        2
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の洗い台を使う",
          "rect": [
            5,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "二人の食卓",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        4,
        5,
        3,
        1
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "二人の食卓を使う",
          "rect": [
            4,
            3,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "B",
        "C"
      ]
    },
    {
      "symbol": "B",
      "name": "マグダレーナの椅子",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        3,
        5,
        1,
        1
      ],
      "access": [
        [
          2,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "マグダレーナの椅子を使う",
          "rect": [
            1,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "ロッテの椅子",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
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
          "activity": "ロッテの椅子を使う",
          "rect": [
            8,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-tailor-upper-hall",
      "target_door": [
        4,
        4
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-tailor",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "private_for": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#KK....OO.#",
      "#KK....OO.#",
      "#.........#",
      "#.........#",
      "#..BTTTC..#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#NN....WW.#",
      "#NN....WW.#",
      "###########"
    ]
  },
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-マグダレーナ",
        "chair": "B"
      },
      {
        "resident": "resident-ロッテ",
        "chair": "C"
      }
    ]
  }
}
---
# マグダレーナの仕立て屋／2階 家庭の台所と食事

## 用途と暮らし

[[building-tailor]] の平面案に属する。二人の家庭の下ごしらえと調理、食材と食器・洗い物と食事の席を持つ。布の裁断と包み直しを食卓の用途へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#KK....OO.#
#KK....OO.#
#.........#
#.........#
#..BTTTC..#
#.........#
#.........#
#.........#
#NN....WW.#
#NN....WW.#
###########
```
