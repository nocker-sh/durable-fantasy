---
{
  "id": "room-h-g2-repair",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "bed_capacity": 0,
  "title": "クルトの家／1階 鍋と釜の鋳掛け",
  "room_name": "1階 鍋と釜の鋳掛け",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    5,
    0
  ],
  "use": "作業",
  "occupants": [
    "クルト",
    "ヨハン"
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "鋳掛けの加熱と鍋を支える設備",
      "owner": "クルト",
      "source": "クルトの鋳掛けの加熱設備を調達する案。熱源の方式と排気・温度・消火は未確定",
      "maintainers": [
        "resident-クルト"
      ],
      "rect": [
        1,
        1,
        3,
        3
      ],
      "access": [
        [
          1,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "鋳掛けの加熱と鍋を支える設備を使う",
          "rect": [
            1,
            4,
            2,
            2
          ]
        }
      ],
      "role": "repair_heat"
    },
    {
      "symbol": "R",
      "name": "修理した熱い鍋と釜を冷ます台",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
      ],
      "rect": [
        7,
        1,
        3,
        3
      ],
      "access": [
        [
          7,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "修理した熱い鍋と釜を冷ます台を使う",
          "rect": [
            7,
            4,
            2,
            2
          ]
        }
      ],
      "role": "repair_cooling"
    },
    {
      "symbol": "B",
      "name": "錫と鋳掛けの道具の閉じた棚",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
      ],
      "rect": [
        4,
        1,
        2,
        1
      ],
      "access": [
        [
          4,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "錫と鋳掛けの道具の閉じた棚を使う",
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
      "symbol": "F",
      "name": "加熱に使う燃料の受け",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "加熱に使う燃料の受けを使う",
          "rect": [
            4,
            8,
            2,
            2
          ]
        }
      ],
      "role": "fuel_storage"
    },
    {
      "symbol": "C",
      "name": "冷めて返す前の鍋と釜の棚",
      "owner": "クルト",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。クルトが手入れする案",
      "maintainers": [
        "resident-クルト"
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
          "activity": "冷めて返す前の鍋と釜の棚を使う",
          "rect": [
            5,
            8,
            2,
            2
          ]
        }
      ],
      "role": "finished_storage"
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
      "target": "room-h-g2-entry",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "building-h-g2",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "private_for": [
    "resident-クルト",
    "resident-ヨハン"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#HHHBB.RRR#",
      "#HHH...RRR#",
      "#HHH...RRR#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#FFF...CCC#",
      "#FFF...CCC#",
      "#FFF...CCC#",
      "####DD#####"
    ]
  },
  "hot_work": {
    "process": "metal_repair",
    "handler": "resident-クルト",
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
# クルトの家／1階 鍋と釜の鋳掛け

## 用途と暮らし

[[building-h-g2]] の平面案に属する。鋳掛けの加熱と鍋の支持、熱い修理品の冷却、錫と道具、燃料、冷めて返す品を分ける。冷めた品と材料だけを共用廊下から運び、熱い物を家族の通り道へ出さない。熱源の方式と温度・錫の材質・換気と消火は未照合である。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。



## 日課にある手伝い

[[resident-ヨハン]] の既存の日課にある手伝いを受け入れる。主担当の責任は変更しない。補助の立ち位置と熱・道具・水の扱いは別に照合する。

```grid
###########
#HHHBB.RRR#
#HHH...RRR#
#HHH...RRR#
#.........#
#.........#
#.........#
#FFF...CCC#
#FFF...CCC#
#FFF...CCC#
####DD#####
```

## 元の容器と保管時の形

鋳掛けの道具箱はクルトの手道具を運び保管する木箱とする。蓋とたが・留め金、握りのある持ち手を描き、熱い鍋と溶けた錫を載せる面にはしない。作業の用途は `world/town/lines/households/tinker.ts` に対応し、工具の内訳と熱源の照合は別に残す。 元の家具の形を表示へ戻す修正であり、新しい平面への切替ではない。
