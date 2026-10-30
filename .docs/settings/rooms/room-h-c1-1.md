---
{
  "id": "room-h-c1-1",
  "kind": "rooms",
  "title": "ハインリヒの窯場／1階 成形と乾燥・絵付け",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-c1",
  "floor": 0,
  "room_name": "成形と乾燥・絵付け",
  "use": "作業",
  "occupants": [
    "ハインリヒ",
    "テレーゼ",
    "アデーレ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "#HH....WWW.NN.RRRRR.#",
      "#HH....WWW.NN.RRRRR.#",
      "#.............RRRRR.#",
      "#...................#",
      "#...................#",
      "#...................D",
      "#...................D",
      "#...................D",
      "#FFF..........PPP...#",
      "#FFF...CCC....PPP...#",
      "#FFF...CCC....PPP...#",
      "#......CCC..........#",
      "#...................#",
      "####DD###############"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        14
      ],
      "width_cells": 2,
      "target": "room-h-c1-entry",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        20,
        6
      ],
      "width_cells": 3,
      "target": "map-phanthiet-craft"
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "土を成形するろくろ",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        1,
        1,
        2,
        2
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "土を成形するろくろを使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "pottery_wheel"
    },
    {
      "symbol": "R",
      "name": "成形後の器を乾かす棚",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        14,
        1,
        5,
        3
      ],
      "access": [
        [
          14,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "成形後の器を乾かす棚を使う",
          "rect": [
            14,
            4,
            2,
            2
          ]
        }
      ],
      "role": "greenware_storage"
    },
    {
      "symbol": "F",
      "name": "使う分の土の受け",
      "owner": "アデーレ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アデーレが手入れする案",
      "maintainers": [
        "resident-アデーレ"
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
          9
        ]
      ],
      "use_space": [
        {
          "activity": "使う分の土の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "bulk_storage"
    },
    {
      "symbol": "W",
      "name": "仕事の道具の洗い台",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
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
          "activity": "仕事の道具の洗い台を使う",
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
      "symbol": "P",
      "name": "器に絵付けする台",
      "owner": "テレーゼ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。テレーゼが手入れする案",
      "maintainers": [
        "resident-テレーゼ"
      ],
      "rect": [
        14,
        9,
        3,
        3
      ],
      "access": [
        [
          13,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "器に絵付けする台を使う",
          "rect": [
            12,
            9,
            2,
            2
          ]
        }
      ],
      "role": "workbench"
    },
    {
      "symbol": "C",
      "name": "焼いて冷めた器の棚",
      "owner": "ハインリヒ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ハインリヒが手入れする案",
      "maintainers": [
        "resident-ハインリヒ"
      ],
      "rect": [
        7,
        10,
        3,
        3
      ],
      "access": [
        [
          7,
          9
        ]
      ],
      "use_space": [
        {
          "activity": "焼いて冷めた器の棚を使う",
          "rect": [
            7,
            8,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
    },
    {
      "symbol": "N",
      "name": "釉の甕の受け",
      "owner": "テレーゼ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。テレーゼが手入れする案",
      "maintainers": [
        "resident-テレーゼ"
      ],
      "rect": [
        11,
        1,
        2,
        2
      ],
      "access": [
        [
          11,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "釉の甕の受けを使う",
          "rect": [
            11,
            3,
            2,
            2
          ]
        }
      ],
      "role": "glaze_storage"
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
    "resident-アデーレ",
    "facility-pottery-kiln"
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ハインリヒ",
    "resident-テレーゼ",
    "resident-アデーレ"
  ],
  "ground_storage": [
    {
      "furniture": "F",
      "contents": "使う分の土（含水と重量・量は未確定）",
      "handler": "resident-アデーレ"
    }
  ],
  "parallel_use": [
    {
      "activity": "成形と絵付けの並行案",
      "operations": [
        {
          "resident": "ハインリヒ",
          "furniture": "H",
          "space_index": 0
        },
        {
          "resident": "テレーゼ",
          "furniture": "P",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# ハインリヒの窯場／1階 成形と乾燥・絵付け

## 用途と暮らし

[[building-h-c1]] の平面案に属する。使う分の土、ろくろと洗い台、生乾きの器・釉の受けと絵付け、焼いて冷めた器を分ける。乾燥前の器と焼いた器、仕事の洗い物と家庭の食器を混ぜない。屋外窯へ運ぶ状態と身体の操作は未照合である。

## 未解決の条件

敷地と構造・戸と窓、土と釉・器の運搬と乾燥・焼成と冷却、灰と粉塵・換気と汚水、家庭の給排水と便所・衣服と寝具、仕事と夜市・休息と立体は未照合である。この平面案の建物と描画への採用はまだ行わない。

## 壺と甕の形

釉の甕はテレーゼが仕事で扱う容器で、広い胴と口、閉じた平たい蓋を持つ。茶の器や飲用水の甕の代用品にはせず、器の受けと仕事の道具へ分ける。既存の土色と木の素材を使い、現行の家具の占有の中へ描く。容量と釉の条件・道具の洗いを、この見た目だけで成立したとしない。

新しい平面案の採用は別に行い、元の描画の対応漏れを直すことと区別する。

## 道具の構造

ろくろは、木の支持台と縦の軸、足で回す下の円盤、器を置く上の円盤を持つ蹴ろくろの形にする。上には成形中の小さな器を置く。回転する面を四角い作業台へ読み替えず、元の家具の位置と占有の中に収める。仕事の水と道具は別の洗い台に属し、置場のない桶を描画だけで追加しない。

この形状の対応は元の描画漏れを直すものであり、新しい平面案と日課の動線を採用した意味にはしない。

```grid
#####################
#HH....WWW.NN.RRRRR.#
#HH....WWW.NN.RRRRR.#
#.............RRRRR.#
#...................#
#...................#
#...................D
#...................D
#...................D
#FFF..........PPP...#
#FFF...CCC....PPP...#
#FFF...CCC....PPP...#
#......CCC..........#
#...................#
####DD###############
```
