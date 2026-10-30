---
{
  "id": "room-buyer-raw-store",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "bed_capacity": 0,
  "title": "ラインホルトの買取所／1階 生皮と毛皮の受取り・一時保管",
  "room_name": "1階 生皮と毛皮の受取り・一時保管",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    13
  ],
  "use": "貯蔵",
  "occupants": [
    "ラインホルト",
    "カスパー"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "受け取った生皮の受け",
      "owner": "カスパー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カスパーが手入れする案",
      "maintainers": [
        "resident-カスパー"
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
          "activity": "受け取った生皮の受けを使う",
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
      "name": "毛皮を分けて置く受け",
      "owner": "カスパー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カスパーが手入れする案",
      "maintainers": [
        "resident-カスパー"
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
          "activity": "毛皮を分けて置く受けを使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "W",
      "name": "皮の受けと運搬道具の洗い台",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        1,
        9,
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
          "activity": "皮の受けと運搬道具の洗い台を使う",
          "rect": [
            4,
            10,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "Q",
      "name": "使用後の布と廃物の受け",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        7,
        9,
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
          "activity": "使用後の布と廃物の受けを使う",
          "rect": [
            5,
            10,
            2,
            2
          ]
        }
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 3,
      "target": "room-buyer-1",
      "target_door": [
        10,
        19
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        6
      ],
      "width_cells": 3,
      "target": "map-phanthiet-market"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "private_for": [
    "resident-ラインホルト",
    "resident-カスパー"
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
      "#.........#",
      "D.........D",
      "D.........D",
      "D.........D",
      "#WWW...QQQ#",
      "#WWW...QQQ#",
      "#WWW...QQQ#",
      "###########"
    ]
  },
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "受け取った皮（受入条件と保管時間は未確定）",
      "handler": "resident-カスパー"
    },
    {
      "furniture": "B",
      "contents": "受け取った毛皮（受入条件と保管時間は未確定）",
      "handler": "resident-カスパー"
    }
  ]
}
---
# ラインホルトの買取所／1階 生皮と毛皮の受取り・一時保管

## 用途と暮らし

[[building-buyer]] の平面案に属する。生皮と毛皮を乾いた薬草と別室へ受け取り、一時保管する。専用の外の戸と洗い台、使用後の受けを持つ。冷却や防腐を実装した意味ではなく、保管方法と許容時間・臭気と害虫・換気と汚水・廃物は未確定である。

## 未解決の条件

敷地と構造・戸と窓、素材の受入条件と保存・搬送と荷重、臭気と汚れ・灰と衛生、給排水と便所・家庭の火、衣服と寝具の手入れ、仕事と休息・立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
D.........D
D.........D
D.........D
#WWW...QQQ#
#WWW...QQQ#
#WWW...QQQ#
###########
```
