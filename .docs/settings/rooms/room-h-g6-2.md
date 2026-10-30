---
{
  "id": "room-h-g6-2",
  "kind": "rooms",
  "title": "エドガーの家／1階 寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g6",
  "floor": 0,
  "room_name": "寝室",
  "use": "寝",
  "occupants": [
    "エドガー",
    "マルグリット"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#EEEE..MMMM#",
      "#EEEE..MMMM#",
      "#..........#",
      "#..........#",
      "#CC......FF#",
      "#####DD#####"
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
      "target": "room-h-g6-1",
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
      "symbol": "E",
      "name": "エドガーの寝台",
      "owner": "エドガー",
      "source": "町の木工師から手に入れた家具",
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
      "symbol": "M",
      "name": "マルグリットの寝台",
      "owner": "マルグリット",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        7,
        1,
        4,
        2
      ],
      "access": [
        [
          8,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            8,
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
      "name": "エドガーの衣服箱",
      "owner": "エドガー",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        1,
        5,
        2,
        1
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "エドガー"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "F",
      "name": "マルグリットの衣服箱",
      "owner": "マルグリット",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        9,
        5,
        2,
        1
      ],
      "access": [
        [
          8,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と私物を出し入れする",
          "rect": [
            7,
            4,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "マルグリット"
      ],
      "compartments": [
        "本人の区画"
      ]
    }
  ],
  "issues": [
    "箱と寝具の容量・開閉と着替えの姿勢は未照合",
    "二人の同時の着替え・戸の開閉と目隠しは未照合",
    "夜の明かり・換気と暖気・床の段差の立体照合未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g6-2-1",
      "resident": "resident-エドガー",
      "kind": "個別寝台",
      "grid_symbol": "E",
      "storage_status": "本人の衣服箱へ配置。容量・可動域は未照合",
      "storage_id": "storage-h-g6-2-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-h-g6-2-2",
      "resident": "resident-マルグリット",
      "kind": "個別寝台",
      "grid_symbol": "M",
      "storage_status": "本人の衣服箱へ配置。容量・可動域は未照合",
      "storage_id": "storage-h-g6-2-2",
      "storage_symbol": "F"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g6",
    "resident-エドガー",
    "resident-マルグリット"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g6-2-1",
      "resident": "resident-エドガー",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人の区画"
    },
    {
      "id": "storage-h-g6-2-2",
      "resident": "resident-マルグリット",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "F",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    0,
    0
  ]
}
---

# エドガーの家／1階 寝室

## 二人の常用寝台

エドガーとマルグリットそれぞれの寝台を北側へ横向きに置き、南側へ使用面を取る。寝台と個人収納の固有IDを、本人の寝台と衣服箱へ結び付ける。二人用という家具候補だけで人数を合わせず、一人ずつの占有を持つ。

## 夜と着替え

[[room-h-g6-1]]との戸は中央に置き、寝台や衣服箱の上を通らずに入る。本人の衣服と首巻きは別々の箱へしまう。編み物の在庫や古い槍を寝台の収納として兼用しない。夜の灯り、床の段差、着替えの目隠しと二人の動作の干渉はまだ確定していない。

## 平面案

一セルは半メートルである。

```grid
############
#EEEE..MMMM#
#EEEE..MMMM#
#..........#
#..........#
#CC......FF#
#####DD#####
```

窓と暖気、寝具の厚み、箱と戸の開閉を立体で照合してから描画へ渡す。
