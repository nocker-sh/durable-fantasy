---
{
  "id": "room-guardhouse-1",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／1階 当直と引継ぎの準備",
  "room_name": "当直と引継ぎの準備",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "勤務",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "勤務の鍵と閉じた記録の棚",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        1,
        1,
        3,
        1
      ],
      "access": [
        [
          1,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "勤務の鍵と閉じた記録の棚を使う",
          "rect": [
            1,
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
      "name": "携行品を確認する台",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
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
          "activity": "携行品を確認する台を使う",
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
      "name": "引継ぎと地図の卓",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        1,
        6,
        3,
        2
      ],
      "access": [
        [
          4,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "引継ぎと地図の卓を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "role": "table"
    },
    {
      "symbol": "Q",
      "name": "勤務を終えた記録の棚",
      "owner": "四人の共用",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼み、四人が交代で手入れする案",
      "maintainers": [
        "resident-オイゲン",
        "resident-ディーター",
        "resident-シュテファン",
        "resident-ヴェロニカ"
      ],
      "rect": [
        7,
        7,
        3,
        2
      ],
      "access": [
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "勤務を終えた記録の棚を使う",
          "rect": [
            5,
            7,
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
      "target": "room-guardhouse-entry",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "private_for": [
    "resident-オイゲン",
    "resident-ディーター",
    "resident-シュテファン",
    "resident-ヴェロニカ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#AAA...BBB#",
      "#......BBB#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#TTT......#",
      "#TTT...QQQ#",
      "#......QQQ#",
      "#.........#",
      "####DD#####"
    ]
  }
}
---
# 門の詰所／1階 当直と引継ぎの準備

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。勤務の引継ぎと地図の卓、鍵と記録、携行品の確認を持つ。休んでいる人の寝室を当直の待機と同じ用途にしない。勤務の交代と門・巡回・街灯への往復は現行の日課から照合する。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#......BBB#
#.........#
#.........#
#.........#
#TTT......#
#TTT...QQQ#
#......QQQ#
#.........#
####DD#####
```
