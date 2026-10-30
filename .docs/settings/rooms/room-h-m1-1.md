---
{
  "id": "room-h-m1-1",
  "kind": "rooms",
  "title": "エーリヒの家／1階 家庭の台所と戸口の茶売り",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m1",
  "floor": 0,
  "room_name": "1階 家庭の台所と戸口の茶売り",
  "use": "台所",
  "occupants": [
    "エーリヒ",
    "マリー",
    "ハンナ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#KKK...OOO#",
      "#KKK...OOO#",
      "#......OOO#",
      "#.........D",
      "#.........D",
      "#NNN...QQQ#",
      "#NNN...QQQ#",
      "#NNN...QQQ#",
      "#.........#",
      "#LL.......#",
      "#.........#",
      "#..BTTTC..#",
      "#...TTT...#",
      "#....E....#",
      "#.........#",
      "#.........#",
      "D.........#",
      "D......RRR#",
      "#WWW...RRR#",
      "#WWW......#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        17
      ],
      "width_cells": 2,
      "target": "room-h-m1-entry",
      "target_door": [
        10,
        3
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "K",
      "name": "家庭と茶売りの下ごしらえ台",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
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
          "activity": "家庭と茶売りの下ごしらえ台を使う",
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
      "name": "家庭と湯を沸かす炉",
      "owner": "マリー",
      "source": "町の石工が炉体を積み、鍛冶場へ金具を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        7,
        1,
        3,
        3
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "家庭と湯を沸かす炉を使う",
          "rect": [
            5,
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
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        1,
        6,
        3,
        3
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "家庭の食材棚を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    },
    {
      "symbol": "Q",
      "name": "茶の壺と清潔な茶椀の受け",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        7,
        6,
        3,
        3
      ],
      "access": [
        [
          6,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "茶の壺と清潔な茶椀の受けを使う",
          "rect": [
            5,
            6,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "L",
      "name": "茶売りの薬草の蓋付きの棚",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        1,
        10,
        2,
        1
      ],
      "access": [
        [
          3,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "茶売りの薬草の蓋付きの棚を使う",
          "rect": [
            3,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "T",
      "name": "家族三人の食卓",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        4,
        12,
        3,
        2
      ],
      "access": [
        [
          5,
          11
        ]
      ],
      "use_space": [
        {
          "activity": "家族三人の食卓を使う",
          "rect": [
            4,
            10,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "B",
        "C",
        "E"
      ]
    },
    {
      "symbol": "B",
      "name": "エーリヒの椅子",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        3,
        12,
        1,
        1
      ],
      "access": [
        [
          2,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "エーリヒの椅子を使う",
          "rect": [
            1,
            11,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "マリーの椅子",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        7,
        12,
        1,
        1
      ],
      "access": [
        [
          8,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "マリーの椅子を使う",
          "rect": [
            8,
            11,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "E",
      "name": "ハンナの椅子",
      "owner": "エーリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エーリヒが手入れする案",
      "maintainers": [
        "resident-エーリヒ"
      ],
      "rect": [
        5,
        14,
        1,
        1
      ],
      "access": [
        [
          5,
          15
        ]
      ],
      "use_space": [
        {
          "activity": "ハンナの椅子を使う",
          "rect": [
            4,
            15,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "W",
      "name": "家庭と茶椀の洗い台",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        1,
        19,
        3,
        2
      ],
      "access": [
        [
          4,
          19
        ]
      ],
      "use_space": [
        {
          "activity": "家庭と茶椀の洗い台を使う",
          "rect": [
            4,
            19,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "R",
      "name": "使った茶椀と返った容器の受け",
      "owner": "マリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マリーが手入れする案",
      "maintainers": [
        "resident-マリー"
      ],
      "rect": [
        7,
        18,
        3,
        2
      ],
      "access": [
        [
          6,
          18
        ]
      ],
      "use_space": [
        {
          "activity": "使った茶椀と返った容器の受けを使う",
          "rect": [
            5,
            18,
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
    "依頼の書類と紙の保管・筆記と茶売りの動線、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m1",
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "origin": [
    15,
    0
  ],
  "private_for": [
    "resident-エーリヒ",
    "resident-マリー",
    "resident-ハンナ"
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-エーリヒ",
        "chair": "B"
      },
      {
        "resident": "resident-マリー",
        "chair": "C"
      },
      {
        "resident": "resident-ハンナ",
        "chair": "E"
      }
    ]
  }
}
---
# エーリヒの家／1階 家庭の台所と戸口の茶売り

## 用途と暮らし

[[building-h-m1]] の平面案に属する。家庭の調理と湯、食材と食器、三人の食卓に加え、戸口で売る薬草茶の材料・茶の壺と清潔な茶椀、使用後の受けを分ける。茶は家に入らない客へ戸口で渡す案とし、家庭の食卓を客席へ増やさない。家の食事と茶売りの時間と器具の洗い・飲用水は未照合である。

## 未解決の条件

敷地と構造・戸と窓、依頼と書類の保管・筆記と茶売りの動線、給排水と便所・火と灰・紙の湿気、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。この平面案の建物と描画への採用はまだ行わない。

## 壺と甕の形

茶の壺はマリーの茶売りに使う器で、丸い胴と広い蓋、小さな持ち手を持つ。清潔な茶椀の受けに属し、油や釉の容器へ読み替えない。既存の土色の帯を使い、現行の元の位置と占有の中へ形を収める。

新しい平面案の採用は別に行い、元の描画の対応漏れを直すことと区別する。

```grid
###########
#KKK...OOO#
#KKK...OOO#
#......OOO#
#.........D
#.........D
#NNN...QQQ#
#NNN...QQQ#
#NNN...QQQ#
#.........#
#LL.......#
#.........#
#..BTTTC..#
#...TTT...#
#....E....#
#.........#
#.........#
D.........#
D......RRR#
#WWW...RRR#
#WWW......#
###########
```
