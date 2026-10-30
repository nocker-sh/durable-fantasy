---
{
  "id": "room-h1-landing",
  "kind": "rooms",
  "title": "ヴィルヘルムの家／2階 共用の踊り場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h1",
  "floor": 1,
  "room_name": "2階 共用の踊り場",
  "use": "通行",
  "occupants": [
    "ヴィルヘルム",
    "ゾフィー"
  ],
  "bed_capacity": 0,
  "origin": [
    5,
    0
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "台所の炉から屋根へ通る煙道",
      "owner": "elder",
      "source": "石工のマルクスへ頼む煉瓦の煙道の案。下階の炉と同じ共通座標で断面をつなぐ",
      "role": "flue",
      "runtime_kind": "chimney-shaft",
      "runtime_solid": true,
      "rect": [
        9,
        1,
        1,
        1
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "煙道の外側を確認する",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゾフィー"
      ]
    }
  ],
  "connections": [
    {
      "kind": "opening",
      "target": "room-h1-stairs",
      "door": [
        0,
        1
      ],
      "width_cells": 2,
      "target_door": [
        5,
        1
      ]
    },
    {
      "kind": "door",
      "target": "room-h1-3",
      "door": [
        1,
        3
      ],
      "width_cells": 2,
      "target_door": [
        1,
        0
      ]
    },
    {
      "kind": "door",
      "target": "room-h1-4",
      "door": [
        6,
        3
      ],
      "width_cells": 2,
      "target_door": [
        1,
        0
      ]
    }
  ],
  "issues": [
    "私室の戸の開閉とすれ違い・梁と照明の立体照合未完了",
    "台所の煙道の床と屋根への支持・熱と強度、清掃口と補修の日課は未照合"
  ],
  "design_dependencies": [
    "building-h1",
    "room-h1-stairs",
    "room-h1-3",
    "room-h1-4",
    "room-h1-2",
    "resident-マルクス",
    "resident-ゾフィー"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "D........H#",
      "D.........#",
      "#DD###DD###"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  }
}
---

# ヴィルヘルムの家／2階 共用の踊り場

## 私室へ分かれる床

[[room-h1-stairs]]から入り、[[room-h1-3]]と[[room-h1-4]]へ分かれる共用の床である。階段から一方の私室を通り抜けて他方へ入る構成にせず、二人の睡眠と着替えを共用の通行から分ける。廊下を本棚や植木鉢の置き場として埋めない。

## 平面案

```grid
###########
D........H#
D.........#
#DD###DD###
```

一セルは半メートルである。二つの私室の戸とすれ違い、夜の足元の灯りを別に設計する。この区画は再設計で追加する計画であり、現行の描画にはまだ反映しない。


## 台所から通る煙道

H は [[room-h1-2]] の調理炉 O の上にある煙道で、建物の共通座標で炉と同じ断面をつなぐ。踊り場の北東の端へ寄せ、階段から二つの私室へ向かう戸口を塞がない。壁の外側の使用面は外観の確認用であり、この場所から内部の煤を取り除けるとは扱わない。

断面の壁厚と床の襟・持送り、屋根へ抜ける位置は [[building-h1]] に従う。家具と通行の離隔、熱と強度、清掃口と補修の日課は別に照合する。物を置く棚や二階の暖炉として兼用しない。
