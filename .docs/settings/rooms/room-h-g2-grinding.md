---
{
  "id": "room-h-g2-grinding",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-h-g2",
  "bed_capacity": 0,
  "title": "クルトの家／1階 刃物の研ぎと手入れ",
  "room_name": "1階 刃物の研ぎと手入れ",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 0,
  "origin": [
    15,
    0
  ],
  "use": "作業",
  "occupants": [
    "ザビーネ",
    "リナ"
  ],
  "furniture": [
    {
      "symbol": "G",
      "name": "刃物を研ぐ砥石と支持台",
      "owner": "ザビーネ",
      "source": "母から受け継いだ砥石を含み、荒・中・仕上げを使い分ける。支持台と受けは町の木工所へ製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "刃物を研ぐ砥石と支持台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "workbench"
    },
    {
      "symbol": "W",
      "name": "研ぎに使う水の受け",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "研ぎに使う水の受けを使う",
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
      "symbol": "A",
      "name": "預かった刃物を覆う棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "預かった刃物を覆う棚を使う",
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
      "symbol": "B",
      "name": "研いだ刃物を覆い返す棚",
      "owner": "ザビーネ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。ザビーネが手入れする案",
      "maintainers": [
        "resident-ザビーネ"
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
          "activity": "研いだ刃物を覆い返す棚を使う",
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
        14,
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
    "resident-ザビーネ",
    "resident-リナ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#GGG...WWW#",
      "#GGG...WWW#",
      "#GGG...WWW#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "#AAA...BBB#",
      "####DD#####"
    ]
  }
}
---
# クルトの家／1階 刃物の研ぎと手入れ

## 用途と暮らし

[[building-h-g2]] の平面案に属する。砥石と支持台、仕事の水、預かった刃物と研いだ後の返す品を覆った棚に分ける。刃物を扱う手と身体・研ぎくずと水・道具の手入れは未照合である。

## 未解決の条件

敷地と構造・戸と窓、錫と加熱・冷却・工具と刃物・仕事の水、煙と換気・消火と廃物、家庭の給排水と便所・火と灰、衣服と寝具、勤務と食事・休息、立体は未照合である。この平面案の建物と描画への採用はまだ行わない。



## 日課にある手伝い

[[resident-リナ]] の既存の日課にある手伝いを受け入れる。主担当の責任は変更しない。補助の立ち位置と熱・道具・水の扱いは別に照合する。

## 道具の構造

砥石は、荒・中・仕上げの平たい石を木の支持台へ置き、水滴を受ける縁付きの浅い受けを持つ。母から受け継いだ石を含む既存の台詞に合わせる。由来と使い分けは `world/town/lines/households/tinker.ts` を参照する。ザビーネが刃を動かして研ぎ、リナが日課にある水の手伝いをする。元の家具の位置と占有で表示する。仕事の水は別の置場から使い、刃を手で動かして研ぐ。

この形状の対応は元の描画漏れを直すものであり、新しい平面案と日課の動線を採用した意味にはしない。

```grid
###########
#GGG...WWW#
#GGG...WWW#
#GGG...WWW#
#.........#
#.........#
#.........#
#AAA...BBB#
#AAA...BBB#
#AAA...BBB#
####DD#####
```
