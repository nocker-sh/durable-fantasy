---
{
  "id": "room-guardhouse-gear",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "bed_capacity": 0,
  "title": "門の詰所／1階 装備と街灯の油の準備",
  "room_name": "装備と街灯の油の準備",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    0
  ],
  "use": "作業",
  "occupants": [
    "オイゲン",
    "ディーター",
    "シュテファン",
    "ヴェロニカ"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "槍を固定する立て掛け台",
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
          "activity": "槍を固定する立て掛け台を使う",
          "rect": [
            1,
            2,
            2,
            2
          ]
        }
      ],
      "role": "weapon_rack"
    },
    {
      "symbol": "B",
      "name": "防具と手入れ道具の棚",
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
        1
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "防具と手入れ道具の棚を使う",
          "rect": [
            7,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "街灯の油の閉じた容器の置台",
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
          "activity": "街灯の油の閉じた容器の置台を使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "Q",
      "name": "点灯の道具と戻った物の受け",
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
          "activity": "点灯の道具と戻った物の受けを使う",
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
      "target": "room-guardhouse-entry",
      "target_door": [
        14,
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
    "resident-ヴェロニカ",
    "building-general"
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
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "#CCC...QQQ#",
      "####DD#####"
    ]
  },
  "ground_storage": [
    {
      "furniture": "C",
      "contents": "道具屋から受け取る街灯の油（量と容器・重量は未確定）",
      "handler": "resident-オイゲン"
    }
  ],
  "supply_buildings": [
    "building-general"
  ]
}
---
# 門の詰所／1階 装備と街灯の油の準備

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。槍と防具、街灯に使う閉じた油の容器、点灯の道具と戻った物を分ける。油を食材と寝具へ混ぜず、寝室の前で道具を受渡ししない。油の量と容器・漏れと火の隔離、武器の長さと抜き差しは未照合である。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#.........#
#.........#
#.........#
#.........#
#.........#
#CCC...QQQ#
#CCC...QQQ#
#CCC...QQQ#
####DD#####
```
