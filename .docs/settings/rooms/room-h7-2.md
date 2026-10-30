---
{
  "id": "room-h7-2",
  "kind": "rooms",
  "title": "マティアスの小屋／1階 寝台の隅",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h7",
  "floor": 0,
  "room_name": "寝台の隅",
  "use": "寝",
  "occupants": [
    "マティアス"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########",
      "#BBBB..CC#",
      "#BBBB....#",
      "#........#",
      "#........#",
      "#........#",
      "#####DD###"
    ],
    "legend": {
      "#": "壁",
      ".": "床と使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-h7-1",
      "door": [
        5,
        6
      ],
      "target_door": [
        5,
        0
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "一人の寝台",
      "owner": "マティアス",
      "source": "町の木工師から購入した家具",
      "rect": [
        1,
        1,
        4,
        2
      ],
      "access": [
        [
          2,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            2,
            3,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "乾いた衣服と私物の箱",
      "owner": "マティアス",
      "source": "町の木工師から購入した家具",
      "rect": [
        7,
        1,
        2,
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
          "activity": "乾いた衣服を出し入れする",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "マティアス"
      ],
      "compartments": [
        "本人の区画"
      ]
    }
  ],
  "issues": [
    "寝具と衣服の容量・戸と箱の可動域は未照合",
    "窓と暖気・換気・目隠しの立体照合未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h7-2-1",
      "resident": "resident-マティアス",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "衣服箱Cへ配置。容量・可動域は未照合",
      "storage_id": "storage-h7-2-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h7",
    "resident-マティアス"
  ],
  "personal_storage": [
    {
      "id": "storage-h7-2-1",
      "resident": "resident-マティアス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    0,
    0
  ]
}
---

# マティアスの小屋／1階 寝台の隅

## 本人の寝床

[[resident-マティアス]]の常用寝台Bと、乾いた衣服・首巻き・私物を収める箱Cを置く。割当済みの寝台・収納IDと家具を結び、羊毛の商品在庫や客用の休憩場所として重複使用しない。寝台の長辺に使用面を取り、衣服箱の面と分ける。

## 生活域からの接続

[[room-h7-1]]との戸を通って寝台へ入る。寝台は戸口から横へ寄せ、通り抜けのために寝台の上を使わない。目隠しと暖気を通す建具の納まりは立体で照合する。泥の付いた靴、搾乳道具や羊毛の袋は寝台区画へ置かない。

## 平面案

一セルは半メートルである。

```grid
##########
#BBBB..CC#
#BBBB....#
#........#
#........#
#........#
#####DD###
```

箱の開閉、着替え、寝具の厚み、窓と暖気の通り道はまだ確定していない。格子があることだけで就寝中の暮らしまで検証済みとしない。
