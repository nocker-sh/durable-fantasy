---
{
  "id": "room-h-c3-work",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-c3",
  "bed_capacity": 0,
  "title": "エマの家／1階 柳と籠編みの仕事",
  "room_name": "1階 柳と籠編みの仕事",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "作業",
  "occupants": [
    "エマ",
    "ローゼマリー",
    "フリーダ"
  ],
  "furniture": [
    {
      "symbol": "L",
      "name": "乾いた柳の束の棚",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
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
          "activity": "乾いた柳の束の棚を使う",
          "rect": [
            4,
            2,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "W",
      "name": "湿らせる柳と仕事の水の受け",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
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
          "activity": "湿らせる柳と仕事の水の受けを使う",
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
      "symbol": "T",
      "name": "エマが籠を編む椅子",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        1,
        7,
        1,
        2
      ],
      "access": [
        [
          2,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "エマが籠を編む椅子を使う",
          "rect": [
            2,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_seat"
    },
    {
      "symbol": "C",
      "name": "ローゼマリーが籠を編む椅子",
      "owner": "ローゼマリー",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ローゼマリーが手入れする案",
      "maintainers": [
        "resident-ローゼマリー"
      ],
      "rect": [
        9,
        7,
        1,
        2
      ],
      "access": [
        [
          8,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "ローゼマリーが籠を編む椅子を使う",
          "rect": [
            7,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_seat"
    },
    {
      "symbol": "R",
      "name": "編み終えた籠と笊の棚",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        1,
        12,
        3,
        2
      ],
      "access": [
        [
          4,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "編み終えた籠と笊の棚を使う",
          "rect": [
            4,
            12,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
    },
    {
      "symbol": "Q",
      "name": "編みかけと道具・端材を分ける棚",
      "owner": "エマ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。エマが手入れする案",
      "maintainers": [
        "resident-エマ"
      ],
      "rect": [
        7,
        12,
        3,
        2
      ],
      "access": [
        [
          6,
          12
        ]
      ],
      "use_space": [
        {
          "activity": "編みかけと道具・端材を分ける棚を使う",
          "rect": [
            5,
            12,
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
        14
      ],
      "width_cells": 2,
      "target": "room-h-c3-entry",
      "target_door": [
        4,
        0
      ]
    },
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "map-phanthiet-craft"
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-c3",
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "private_for": [
    "resident-エマ",
    "resident-ローゼマリー",
    "resident-フリーダ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#LLL...WWW#",
      "#LLL...WWW#",
      "#LLL...WWW#",
      "#LLL......#",
      "#.........#",
      "#.........#",
      "#T.......C#",
      "#T.......C#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#RRR...QQQ#",
      "#RRR...QQQ#",
      "####DD#####"
    ]
  },
  "parallel_use": [
    {
      "activity": "二人が籠を編む並行案",
      "operations": [
        {
          "resident": "エマ",
          "furniture": "T",
          "space_index": 0
        },
        {
          "resident": "ローゼマリー",
          "furniture": "C",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# エマの家／1階 柳と籠編みの仕事

## 用途と暮らし

[[building-h-c3]] の平面案に属する。乾いた柳の束と湿らせる受け、二人の編む椅子、編み終えた籠と笊・編みかけと道具・端材を分ける。椅子と使用面の間に通れる床を保つ。座る姿勢と柳を振る範囲、二人分の材料と必要量・水と湿気は未照合である。

## 未解決の条件

敷地と構造・戸と窓、柳と水・籠を編む姿勢と材料・端材、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。



## 家の手伝い

[[resident-フリーダ]] の日課にある「母の籠の柳を選る」を利用者へ反映する。主担当の作業と補助を分け、熱い物や刃物・材料の置場と補助の位置、通学前後の負担は未照合である。

```grid
####DD#####
#LLL...WWW#
#LLL...WWW#
#LLL...WWW#
#LLL......#
#.........#
#.........#
#T.......C#
#T.......C#
#.........#
#.........#
#.........#
#RRR...QQQ#
#RRR...QQQ#
####DD#####
```

## 籠と材料の形

柳の束はエマの世帯が川べりから採った材料で、同じ向きに揃えた枝を二か所で束ねる。編みかけの籠は編み終えた底と低い側面、その先に残る縦の芯を持ち、完成品や木箱と区別する。材料と作業は `world/town/lines/households/baskets.ts` に対応する。元の家具の描画を直し、新しい平面の採用と湿し場の検証は別に残す。
