---
{
  "id": "room-h-m2-oil-store",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "bed_capacity": 0,
  "title": "アガーテのろうそく屋／1階 灯り油の保管と出荷",
  "room_name": "1階 灯り油の保管と出荷",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    14
  ],
  "use": "貯蔵",
  "occupants": [
    "アガーテ",
    "ジーモン"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "灯り油の閉じた容器の置台",
      "owner": "ジーモン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ジーモンが手入れする案",
      "maintainers": [
        "resident-ジーモン"
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
          "activity": "灯り油の閉じた容器の置台を使う",
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
      "name": "売り歩く分の容器の受け",
      "owner": "ジーモン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ジーモンが手入れする案",
      "maintainers": [
        "resident-ジーモン"
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
          "activity": "売り歩く分の容器の受けを使う",
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
      "name": "戻った容器の受け",
      "owner": "ジーモン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ジーモンが手入れする案",
      "maintainers": [
        "resident-ジーモン"
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
          "activity": "戻った容器の受けを使う",
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
      "name": "汚れた布と使用後の受け",
      "owner": "ジーモン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ジーモンが手入れする案",
      "maintainers": [
        "resident-ジーモン"
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
          "activity": "汚れた布と使用後の受けを使う",
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
      "target": "room-h-m2-entry",
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
      "target": "map-phanthiet-market"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-m2",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン"
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
      "contents": "灯り油の閉じた容器（重量と数量・保管条件は未確定）",
      "handler": "resident-ジーモン"
    }
  ]
}
---
# アガーテのろうそく屋／1階 灯り油の保管と出荷

## 用途と暮らし

[[building-h-m2]] の平面案に属する。灯り油は蝋の加熱と別室に閉じた容器で収める。外の専用の戸から搬入し、売り歩く容器と戻った容器・汚れた布を分ける。火との隔離と漏れの受け・換気、容器の密閉と量・重さは未照合である。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。この平面案の建物と描画への採用はまだ行わない。

## 壺と甕の形

油壺はジーモンの灯り油の容器として、丸い胴から細い口へ絞り、木の栓と口元の紐を持つ閉じた姿にする。茶の広い口や釉の甕の広い蓋を流用しない。元の家具の位置と占有で表示し、容器の量・密閉と漏れの条件はこの形だけで検証済みにしない。

新しい平面案の採用は別に行い、元の描画の対応漏れを直すことと区別する。

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
