---
{
  "id": "room-h-c4-lye",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "bed_capacity": 0,
  "title": "マルクスの家／1階 灰と灰汁の作業",
  "room_name": "1階 灰と灰汁の作業",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    0
  ],
  "use": "作業",
  "occupants": [
    "カタリーナ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "冷めた灰の閉じた容器の置台",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
      ],
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          4,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "冷めた灰の閉じた容器の置台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "B",
      "name": "作った灰汁の閉じた容器の置台",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
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
          "activity": "作った灰汁の閉じた容器の置台を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "C",
      "name": "灰をふるい灰汁を受ける設備",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
      ],
      "rect": [
        1,
        7,
        3,
        3
      ],
      "access": [
        [
          4,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "灰をふるい灰汁を受ける設備を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "role": "lye_processing"
    },
    {
      "symbol": "Q",
      "name": "仕事の道具と残った物の受け",
      "owner": "カタリーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。カタリーナが手入れする案",
      "maintainers": [
        "resident-カタリーナ"
      ],
      "rect": [
        7,
        7,
        3,
        3
      ],
      "access": [
        [
          6,
          8
        ]
      ],
      "use_space": [
        {
          "activity": "仕事の道具と残った物の受けを使う",
          "rect": [
            5,
            8,
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
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-h-c4-entry",
      "target_door": [
        14,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        10,
        4
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "石工の道具と灰汁・容器と粉塵・汚水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c4",
    "resident-マルクス",
    "resident-カタリーナ",
    "resident-ダニエル",
    "resident-イダ"
  ],
  "private_for": [
    "resident-カタリーナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........D",
      "#.........D",
      "#.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "####DD#####"
    ]
  },
  "ground_storage": [
    {
      "furniture": "A",
      "contents": "冷めた灰（由来と入手先・受入状態と量は未確定）",
      "handler": "resident-カタリーナ"
    },
    {
      "furniture": "B",
      "contents": "灰汁の閉じた容器（重さと量・保管条件は未確定）",
      "handler": "resident-カタリーナ"
    }
  ]
}
---
# マルクスの家／1階 灰と灰汁の作業

## 用途と暮らし

[[building-h-c4]] の平面案に属する。冷めた灰、灰をふるい灰汁を受ける設備、出来た灰汁を閉じた容器へ収める場所、使用後の道具と残った物を分ける。灰の由来と入手元・受入条件、作業の方法と量・容器の材質と漏れ・汚水と廃物は未確定であり、石けんを作る工程を追加しない。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........D
#.........D
#.........#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
####DD#####
```

## 元の容器と保管時の形

灰汁の桶はカタリーナの仕事用とし、飲み水の容器と共用しない。木の胴とたが、外せる木蓋を持つ保管時の形を描く。細かい灰から上澄みを取る工程は `world/town/lines/households/mason.ts` に対応し、桶の表示だけで濾し場と汚水の設計を完了としない。 元の家具の形を表示へ戻す修正であり、新しい平面への切替ではない。
