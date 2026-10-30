---
{
  "id": "room-tailor-2",
  "kind": "rooms",
  "title": "マグダレーナの仕立て屋／1階 糸と織り・裁断と縫い",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "floor": 0,
  "room_name": "糸と織り・裁断と縫い",
  "use": "作業",
  "occupants": [
    "マグダレーナ",
    "ロッテ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#WWW......#",
      "#WWW......#",
      "#.....TTT.#",
      "#.....TTT.D",
      "#.....TTT.D",
      "#.........D",
      "#.........D",
      "#.........#",
      "D.........#",
      "D.........#",
      "D.........#",
      "#.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
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
        15
      ],
      "width_cells": 3,
      "target": "room-tailor-1",
      "target_door": [
        10,
        15
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        10
      ],
      "width_cells": 4,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "毛と糸の材料棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
          "activity": "毛と糸の材料棚を使う",
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
      "name": "糸巻きと縫製道具の棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
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
          "activity": "糸巻きと縫製道具の棚を使う",
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
      "symbol": "W",
      "name": "糸を紡ぐ糸車",
      "owner": "ロッテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ロッテが手入れする案",
      "maintainers": [
        "resident-ロッテ"
      ],
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          1,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "糸を紡ぐ糸車を使う",
          "rect": [
            1,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "布を織る機織り機",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        6,
        9,
        3,
        3
      ],
      "access": [
        [
          5,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "布を織る機織り機を使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "布を広げる裁断と縫いの台",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        19,
        3,
        4
      ],
      "access": [
        [
          4,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "布を広げる裁断と縫いの台を使う",
          "rect": [
            4,
            20,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "縫いかけの衣服の棚",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
        19,
        3,
        4
      ],
      "access": [
        [
          6,
          20
        ]
      ],
      "use_space": [
        {
          "activity": "縫いかけの衣服の棚を使う",
          "rect": [
            5,
            20,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
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
  "origin": [
    15,
    0
  ],
  "private_for": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "parallel_use": [
    {
      "activity": "裁断と糸を紡ぐ作業の並行案",
      "operations": [
        {
          "resident": "マグダレーナ",
          "furniture": "C",
          "space_index": 0
        },
        {
          "resident": "ロッテ",
          "furniture": "W",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# マグダレーナの仕立て屋／1階 糸と織り・裁断と縫い

## 用途と暮らし

[[building-tailor]] の平面案に属する。毛と糸・道具の棚、糸車と機織り機、布を広げる裁断と縫いの台、縫いかけの衣服を分ける。針と鋏を作業中の布に埋めたままにしない。織る身体と踏み木・椅子、裁断する布の大きさと一時置きは未照合である。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#WWW......#
#WWW......#
#.....TTT.#
#.....TTT.D
#.....TTT.D
#.........D
#.........D
#.........#
D.........#
D.........#
D.........#
#.........#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
#.........#
#.........#
###########
```
