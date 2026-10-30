---
{
  "id": "room-buyer-2",
  "kind": "rooms",
  "title": "ラインホルトの買取所／1階 乾いた素材の倉",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-buyer",
  "floor": 0,
  "room_name": "1階 乾いた素材の倉",
  "use": "貯蔵",
  "occupants": [
    "ラインホルト",
    "カスパー"
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
      "D.........D",
      "D.........D",
      "D.........D",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "###########"
    ]
  },
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
        6
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
  "furniture": [
    {
      "symbol": "A",
      "name": "鉱石と石の箱の置台",
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
          "activity": "鉱石と石の箱の置台を使う",
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
      "name": "金属片と金属の素材の置台",
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
          "activity": "金属片と金属の素材の置台を使う",
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
      "symbol": "C",
      "name": "乾いた薬草の密閉容器の棚",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        1,
        9,
        3,
        4
      ],
      "access": [
        [
          4,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "乾いた薬草の密閉容器の棚を使う",
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
      "name": "仕分けの札と空容器の棚",
      "owner": "ラインホルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ラインホルトが手入れする案",
      "maintainers": [
        "resident-ラインホルト"
      ],
      "rect": [
        7,
        9,
        3,
        4
      ],
      "access": [
        [
          6,
          10
        ]
      ],
      "use_space": [
        {
          "activity": "仕分けの札と空容器の棚を使う",
          "rect": [
            5,
            10,
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
    "素材の受入条件・保管と荷の寸法・重量、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-buyer",
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "origin": [
    15,
    0
  ],
  "private_for": [
    "resident-ラインホルト",
    "resident-カスパー"
  ],
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "買い取った鉱石と石（受入重量と寸法は未確定）",
      "handler": "resident-カスパー"
    },
    {
      "furniture": "B",
      "contents": "買い取った金属の素材（受入重量と寸法は未確定）",
      "handler": "resident-カスパー"
    }
  ]
}
---
# ラインホルトの買取所／1階 乾いた素材の倉

## 用途と暮らし

[[building-buyer]] の平面案に属する。鉱石と石、金属の素材の重い荷を地上階へ置く。乾いた薬草は密閉容器へ分ける案だが、粉塵の隔離と容器の寸法・衛生・保存条件は未照合である。原料ごとの条件が合わなければ受入れを分ける。

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
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
###########
```
