---
{
  "id": "room-h-g5-study",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g5",
  "bed_capacity": 0,
  "title": "クリスティアンの家／1階 教材と授業の準備",
  "room_name": "教材と授業の準備",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "作業",
  "occupants": [
    "クリスティアン"
  ],
  "furniture": [
    {
      "symbol": "A",
      "name": "授業に使う本の棚",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
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
          "activity": "授業に使う本の棚を使う",
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
      "name": "石板と筆記道具の棚",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
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
          "activity": "石板と筆記道具の棚を使う",
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
      "symbol": "T",
      "name": "教材を準備する机",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        1,
        6,
        3,
        2
      ],
      "access": [
        [
          1,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "教材を準備する机を使う",
          "rect": [
            1,
            4,
            2,
            2
          ]
        }
      ],
      "role": "table",
      "seat_symbols": [
        "E"
      ]
    },
    {
      "symbol": "E",
      "name": "本人の筆記の椅子",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        4,
        6,
        1,
        1
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "本人の筆記の椅子を使う",
          "rect": [
            5,
            5,
            2,
            2
          ]
        }
      ],
      "role": "seat"
    },
    {
      "symbol": "C",
      "name": "持ち出す教材の受け",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        7,
        6,
        3,
        1
      ],
      "access": [
        [
          7,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "持ち出す教材の受けを使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "N",
      "name": "準備を終えた記録の棚",
      "owner": "クリスティアン",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クリスティアンが手入れする案",
      "maintainers": [
        "resident-クリスティアン"
      ],
      "rect": [
        1,
        9,
        3,
        1
      ],
      "access": [
        [
          4,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "準備を終えた記録の棚を使う",
          "rect": [
            4,
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
      "target": "room-h-g5-entry",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "教材と仕事の籠・布の手入れ、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-h-g5",
    "resident-クリスティアン",
    "resident-ドロテア",
    "resident-ラウラ",
    "resident-ベンヤミン",
    "building-h-m5",
    "room-h-m5-1"
  ],
  "private_for": [
    "resident-クリスティアン"
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
      "#TTTE..CCC#",
      "#TTT......#",
      "#.........#",
      "#NNN......#",
      "####DD#####"
    ]
  }
}
---
# クリスティアンの家／1階 教材と授業の準備

## 用途と暮らし

[[building-h-g5]] の平面案に属する。授業の本と石板・筆記道具、教材を準備する机と本人の椅子、準備した教材の棚を持つ。授業は寄り合い所で行い、家庭の寝室や食卓へ常設の教室を増やさない。紙と本の量・灯りと湿気・教材の持出しは未照合である。

## 未解決の条件

敷地と構造・戸と窓、教材の準備と持出し・訪問の籠と布の洗いと乾燥、家庭の給排水と便所・火と灰、四人の衣服と寝具、勤務と夜の呼出し・食事と休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#AAA...BBB#
#.........#
#.........#
#.........#
#.........#
#TTTE..CCC#
#TTT......#
#.........#
#NNN......#
####DD#####
```
