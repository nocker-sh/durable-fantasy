---
{
  "id": "room-h-c1-materials",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "bed_capacity": 0,
  "title": "ハインリヒの窯場／1階 土と出荷する器の倉",
  "room_name": "土と出荷する器の倉",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    14
  ],
  "use": "貯蔵",
  "occupants": [
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "補充分の土の置台",
      "owner": "アデーレ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アデーレが手入れする案",
      "maintainers": [
        "resident-アデーレ"
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
          "activity": "補充分の土の置台を使う",
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
      "name": "出荷する器を保護した箱の受け",
      "owner": "アデーレ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アデーレが手入れする案",
      "maintainers": [
        "resident-アデーレ"
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
          "activity": "出荷する器を保護した箱の受けを使う",
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
      "symbol": "R",
      "name": "戻った梱包材の受け",
      "owner": "アデーレ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アデーレが手入れする案",
      "maintainers": [
        "resident-アデーレ"
      ],
      "rect": [
        1,
        8,
        3,
        3
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "戻った梱包材の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "破損した器と使用後の受け",
      "owner": "アデーレ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アデーレが手入れする案",
      "maintainers": [
        "resident-アデーレ"
      ],
      "rect": [
        7,
        8,
        3,
        3
      ],
      "access": [
        [
          6,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "破損した器と使用後の受けを使う",
          "rect": [
            5,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        0,
        6
      ],
      "width_cells": 2,
      "target": "room-h-c1-entry",
      "target_door": [
        10,
        6
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        5
      ],
      "width_cells": 3,
      "target": "map-phanthiet-craft"
    }
  ],
  "issues": [
    "窯を含む敷地と道・隣家・地形、戸と窓・梁は未照合",
    "土と釉の保管・成形と乾燥・焼成と冷却の工程、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-c1",
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
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
      "#.........D",
      "D.........D",
      "D.........D",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "###########"
    ]
  },
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "補充分の土（含水と重量・量は未確定）",
      "handler": "resident-アデーレ"
    }
  ]
}
---
# ハインリヒの窯場／1階 土と出荷する器の倉

## 用途と暮らし

[[building-h-c1]] の平面案に属する。補充分の土、出荷する器を保護した箱、戻った梱包材・破損した器と使用後の受けを分ける。粉塵と器の清潔さ、陶片と釉を含む廃物、土と箱の荷重と容量は未照合である。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........D
D.........D
D.........D
#RRR...QQQ#
#RRR...QQQ#
#RRR...QQQ#
###########
```
