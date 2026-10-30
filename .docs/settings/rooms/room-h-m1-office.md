---
{
  "id": "room-h-m1-office",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "bed_capacity": 0,
  "title": "エーリヒの家／1階 代書と客の依頼",
  "room_name": "1階 代書と客の依頼",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "作業",
  "occupants": [
    "エーリヒ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "未使用の紙と封の材料の棚",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
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
          "activity": "未使用の紙と封の材料の棚を使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "B",
      "name": "筆記道具の棚",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
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
          "activity": "筆記道具の棚を使う",
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
      "symbol": "T",
      "name": "依頼を聞き書く机",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        5,
        5,
        3,
        2
      ],
      "access": [
        [
          5,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "依頼を聞き書く机を使う",
          "rect": [
            5,
            3,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "C",
        "E"
      ]
    },
    {
      "symbol": "C",
      "name": "エーリヒの筆記の椅子",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        4,
        5,
        1,
        1
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "エーリヒの筆記の椅子を使う",
          "rect": [
            2,
            4,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "依頼人の椅子",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        6,
        7,
        1,
        1
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "依頼人の椅子を使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "S",
      "name": "受けた依頼と預かり書類の閉じた棚",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        1,
        10,
        3,
        3
      ],
      "access": [
        [
          4,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "受けた依頼と預かり書類の閉じた棚を使う",
          "rect": [
            4,
            10,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "書き終えた手紙と証文の受渡し棚",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        7,
        10,
        3,
        3
      ],
      "access": [
        [
          6,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "書き終えた手紙と証文の受渡し棚を使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-h-m1-entry",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#...CTTT..#",
      "#....TTT..#",
      "#.....E...#",
      "#.........#",
      "#.........#",
      "#SSS...QQQ#",
      "#SSS...QQQ#",
      "#SSS...QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# エーリヒの家／1階 代書と客の依頼

## 用途と暮らし

[[building-h-m1]] の平面案に属する。客の依頼と書く机、未使用の紙と筆記道具、預かり書類、書き終えた手紙と証文を分ける。本人と依頼人の椅子を持ち、茶の壺を紙の机へ置く前提にしない。依頼人の話が家庭や別の客へ漏れない視線と音は未照合である。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#...CTTT..#
#....TTT..#
#.....E...#
#.........#
#.........#
#SSS...QQQ#
#SSS...QQQ#
#SSS...QQQ#
#.........#
####DD#####
```
