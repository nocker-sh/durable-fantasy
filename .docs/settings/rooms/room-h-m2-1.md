---
{
  "id": "room-h-m2-1",
  "kind": "rooms",
  "title": "アガーテのろうそく屋／1階 蝋の加熱と成形・冷却",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-m2",
  "floor": 0,
  "room_name": "1階 蝋の加熱と成形・冷却",
  "use": "作業",
  "occupants": [
    "アガーテ",
    "ジーモン",
    "フェリックス"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#####################",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH..WWW.NN.RRRRR.#",
      "#HHHH.........RRRRR.#",
      "#HHHH...............#",
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
      "target": "room-h-m2-entry",
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
      "target": "map-phanthiet-market"
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "蝋を温める鍋と加熱設備",
      "owner": "アガーテ",
      "source": "町の石工へ加熱設備、鍛冶場へ鍋と金具を頼む案。加熱方式と温度・消火は未確定。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
      ],
      "rect": [
        1,
        1,
        4,
        4
      ],
      "access": [
        [
          5,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "蝋を温める鍋と加熱設備を使う",
          "rect": [
            5,
            2,
            2,
            2
          ]
        }
      ],
      "role": "wax_heater"
    },
    {
      "symbol": "R",
      "name": "成形した蝋を冷ます枠",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "成形した蝋を冷ます枠を使う",
          "rect": [
            14,
            4,
            2,
            2
          ]
        }
      ],
      "role": "wax_cooling"
    },
    {
      "symbol": "F",
      "name": "加熱に使う乾いた薪の受け",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "加熱に使う乾いた薪の受けを使う",
          "rect": [
            4,
            9,
            2,
            2
          ]
        }
      ],
      "role": "fuel_storage"
    },
    {
      "symbol": "W",
      "name": "仕事用の鍋と道具の洗い台",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "仕事用の鍋と道具の洗い台を使う",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "P",
      "name": "獣脂と蜜蝋の材料の受け",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "獣脂と蜜蝋の材料の受けを使う",
          "rect": [
            12,
            9,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    },
    {
      "symbol": "C",
      "name": "冷めたろうそくの完成品の棚",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "冷めたろうそくの完成品の棚を使う",
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
      "name": "芯を準備する台",
      "owner": "アガーテ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。アガーテが手入れする案",
      "maintainers": [
        "resident-アガーテ"
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
          "activity": "芯を準備する台を使う",
          "rect": [
            11,
            3,
            2,
            2
          ]
        }
      ]
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
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "hot_work": {
    "process": "wax",
    "handler": "resident-アガーテ",
    "heat_sources": [
      "H"
    ],
    "cooling": [
      "R"
    ],
    "finished": [
      "C"
    ],
    "fuel": [
      "F"
    ]
  }
}
---
# アガーテのろうそく屋／1階 蝋の加熱と成形・冷却

## 用途と暮らし

[[building-h-m2]] の平面案に属する。蝋の加熱、成形と冷却、冷めた完成品、乾いた薪と材料・芯の準備を分ける。家庭の調理炉や食器を仕事の鍋の代用にしない。加熱方式・温度と消火、熱い物を運ぶ身体とこぼれる蝋は未照合である。

## 未解決の条件

敷地と構造・戸と窓、火と温度・油と蝋の保管と運搬、灰と換気・廃物、給排水と便所・衣服と寝具、勤務と休息・立体は未照合である。現行の建物と描画は切り替えない。



## 家の手伝い

[[resident-フェリックス]] の日課にある「ろうそくの芯を切る」を利用者へ反映する。主担当の作業と補助を分け、熱い物や刃物・材料の置場と補助の位置、通学前後の負担は未照合である。

```grid
#####################
#HHHH..WWW.NN.RRRRR.#
#HHHH..WWW.NN.RRRRR.#
#HHHH.........RRRRR.#
#HHHH...............#
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

## 元の容器と保管時の形

ろうの鍋はアガーテが蜜蝋や獣脂を扱う専用の金属鍋とし、食事の鍋と共用しない。幅のある胴と両側の持ち手、異物を避ける蓋を描く。元の家具には加熱中かどうかの状態がないため、炎や溶けたろうを加えず保管時の形にする。加熱時の支持と熱源は平面案の別の設計として残す。材料と用途は `world/town/lines/households/candle.ts` にある。 元の家具の形を表示へ戻す修正であり、新しい平面への切替ではない。
