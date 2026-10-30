---
{
  "id": "room-h-c4-tools",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c4",
  "bed_capacity": 0,
  "title": "マルクスの家／1階 石工の道具の保管と手入れ",
  "room_name": "1階 石工の道具の保管と手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "作業",
  "occupants": [
    "マルクス"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "石鑿と槌の閉じた道具棚",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "石鑿と槌の閉じた道具棚を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "B",
      "name": "縄と現場の道具の棚",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "縄と現場の道具の棚を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "金具と修理部材の棚",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "金具と修理部材の棚を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "Q",
      "name": "仕事着と使用後の道具の受け",
      "owner": "マルクス",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マルクスが手入れする案",
      "maintainers": [
        "resident-マルクス"
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
          "activity": "仕事着と使用後の道具の受けを使う",
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
        4,
        0
      ]
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
    "resident-マルクス"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "####DD#####"
    ]
  }
}
---
# マルクスの家／1階 石工の道具の保管と手入れ

## 用途と暮らし

[[building-h-c4]] の平面案に属する。石鑿と槌、現場の道具と縄、修理する部材、仕事着と使用後の道具を分ける。石積みと煙突・炉の修理は仕事先の現場で行う既存の仕事を保ち、この部屋に大きな石材を加工する設備を追加しない。

## 未解決の条件

敷地と構造・戸と窓、道具と灰・灰汁の扱いと容器・粉塵と漏れ、汚水と廃物、家庭の給排水と便所・火と灰、衣服と寝具、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
#.........#
#.........#
#.........#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
####DD#####
```
