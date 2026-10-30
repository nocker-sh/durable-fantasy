---
{
  "id": "room-inn-drying",
  "kind": "rooms",
  "title": "ゲルダの宿／1階 室内干しの部屋",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-inn",
  "bed_capacity": 0,
  "occupants": [
    "ゲルダ",
    "ニーナ",
    "ゼップ"
  ],
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "room_name": "1階 室内干しの部屋",
  "connections": [
    {
      "kind": "door",
      "door": [
        13,
        5
      ],
      "width_cells": 2,
      "target": "room-inn-1",
      "target_door": [
        13,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "濡れた布を掛ける木枠R",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ニーナが手入れする案",
      "rect": [
        1,
        1,
        4,
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
          "activity": "濡れた布を掛ける木枠Rを使う",
          "rect": [
            1,
            3,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack",
      "maintainers": [
        "resident-ニーナ"
      ]
    },
    {
      "symbol": "T",
      "name": "濡れた布を掛ける木枠T",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        12,
        1,
        4,
        2
      ],
      "access": [
        [
          12,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "濡れた布を掛ける木枠Tを使う",
          "rect": [
            12,
            3,
            2,
            2
          ]
        }
      ],
      "role": "drying_rack",
      "maintainers": [
        "resident-ゲルダ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "design_dependencies": [
    "building-inn",
    "resident-ゲルダ",
    "resident-ニーナ"
  ],
  "laundry_drying": {
    "racks": [
      {
        "furniture": "R",
        "handler": "resident-ニーナ"
      },
      {
        "furniture": "T",
        "handler": "resident-ゲルダ"
      }
    ],
    "capacity_status": "unverified"
  },
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#################",
      "#RRRR.......TTTT#",
      "#RRRR.......TTTT#",
      "#...............#",
      "#...............#",
      "#############DD##"
    ]
  }
}
---
# ゲルダの宿／1階 室内干しの部屋

## 用途と配置

[[building-inn]] の平面案に属する。木枠と濡れた布の占有を床から塞ぐ。布の下を客の通路として数えず、食堂から専用の戸で入る。火や食品の棚、清潔な寝具と使用済みの受けをこの部屋へ置かない。干す担当は宿の世帯から割り当てる。

## 未解決の生活

干す布の量・重さ、掛ける高さと湿気・灰を避ける換気、寝具交換と乾燥の時間は未照合である。木枠の占有を置いたことを、全寝具を毎日乾かせる容量の証明にしない。戸と梁、火と煙、地形と日課、描画は引き続き照合する。

```grid
#################
#RRRR.......TTTT#
#RRRR.......TTTT#
#...............#
#...............#
#############DD##
```
