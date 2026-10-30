---
{
  "id": "room-armorer-2",
  "kind": "rooms",
  "title": "ベアトリクスの防具屋／1階 冷めた品の仕上げ場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-armorer",
  "floor": 0,
  "room_name": "冷めた品の仕上げ場",
  "use": "作業",
  "occupants": [
    "ベアトリクス",
    "ルイーゼ"
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
      "target": "room-armorer-1",
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
      "target": "map-phanthiet-craft"
    }
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "冷めた金属の素材の置台",
      "owner": "ルイーゼ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ルイーゼが手入れする案",
      "maintainers": [
        "resident-ルイーゼ"
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
          "activity": "冷めた金属の素材の置台を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "B",
      "name": "革と詰め物・締め具の棚",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "革と詰め物・締め具の棚を使う",
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
      "name": "工具と締め具の手入れ台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "工具と締め具の手入れ台を使う",
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
      "name": "防具の仕上げと組立ての台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "防具の仕上げと組立ての台を使う",
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
      "name": "組立て中の防具の掛け台",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "組立て中の防具の掛け台を使う",
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
      "name": "使用後の道具と研ぎくずの受け",
      "owner": "ベアトリクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ベアトリクスが手入れする案",
      "maintainers": [
        "resident-ベアトリクス"
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
          "activity": "使用後の道具と研ぎくずの受けを使う",
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
    "材料と防具の荷重・搬送、工具と着合わせの操作、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-armorer",
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "origin": [
    15,
    0
  ],
  "private_for": [
    "resident-ベアトリクス",
    "resident-ルイーゼ"
  ],
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "冷めた金属の材料（受入寸法と重量は未確定）",
      "handler": "resident-ルイーゼ"
    }
  ],
  "parallel_use": [
    {
      "activity": "仕上げと工具の手入れの並行案",
      "operations": [
        {
          "resident": "ベアトリクス",
          "furniture": "T",
          "space_index": 0
        },
        {
          "resident": "ルイーゼ",
          "furniture": "W",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# ベアトリクスの防具屋／1階 冷めた品の仕上げ場

## 用途と暮らし

[[building-armorer]] の平面案に属する。冷めた金属の材料、革と詰め物・道具、仕上げの台と工具の手入れ、組立て中と使用後の受けを分ける。加熱する加工は職人通りの共同の炉を使い、この部屋へ産業用の火床を追加しない。

## 未解決の条件

敷地と構造・戸と窓、金属と防具の荷重・運搬、加工する身体と工具・油と研ぎくず、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。

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
