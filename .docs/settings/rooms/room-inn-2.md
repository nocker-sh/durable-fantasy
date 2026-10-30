---
{
  "id": "room-inn-2",
  "kind": "rooms",
  "title": "ゲルダの宿／1階 台所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-inn",
  "floor": 0,
  "room_name": "1階 台所",
  "use": "台所",
  "occupants": [
    "ゲルダ",
    "ニーナ",
    "ゼップ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "##########DD#####",
      "#OOO..KKKK...WWW#",
      "#OOO..KKKK...WWW#",
      "#OOO............#",
      "#............NNN#",
      "#QQQ.........NNN#",
      "#QQQ..CCCC...NNN#",
      "#################"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        10,
        0
      ],
      "width_cells": 2,
      "target": "room-inn-1",
      "target_door": [
        10,
        11
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "O",
      "name": "調理のかまど",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
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
          "activity": "調理のかまどを使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "K",
      "name": "下ごしらえ台",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        6,
        1,
        4,
        2
      ],
      "access": [
        [
          6,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "下ごしらえ台を使う",
          "rect": [
            6,
            3,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "W",
      "name": "洗い台と給水の受け",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ台と水受けの製作を頼む案。水漏れと耐水性は未照合。ゲルダが手入れする案",
      "rect": [
        13,
        1,
        3,
        2
      ],
      "access": [
        [
          12,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "洗い台と給水の受けを使う",
          "rect": [
            11,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "N",
      "name": "家庭と客の食材棚",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        13,
        4,
        3,
        3
      ],
      "access": [
        [
          12,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "家庭と客の食材棚を使う",
          "rect": [
            11,
            5,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "C",
      "name": "清潔な食器棚",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        6,
        6,
        4,
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
          "activity": "清潔な食器棚を使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "Q",
      "name": "使用済み食器の受け",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        1,
        5,
        3,
        2
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "使用済み食器の受けを使う",
          "rect": [
            4,
            5,
            2,
            2
          ]
        }
      ],
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
    "resident-ゲルダ"
  ],
  "origin": [
    5,
    16
  ],
  "parallel_use": [
    {
      "activity": "調理と清潔な食器の準備と食材の取出し",
      "operations": [
        {
          "resident": "ゼップ",
          "furniture": "O",
          "space_index": 0
        },
        {
          "resident": "ニーナ",
          "furniture": "C",
          "space_index": 0
        },
        {
          "resident": "ゲルダ",
          "furniture": "N",
          "space_index": 0
        }
      ]
    }
  ]
}
---
# ゲルダの宿／1階 台所

## 用途と配置

[[building-inn]] の平面案に属する。北の戸から食堂へ配膳する。食材、下ごしらえ、かまど、清潔な食器、使用済みの食器の受けを分ける。三人の宣言した作業が出入口を塞がないことを照合する。水の搬入と排水、薪と灰の屋外経路、洗い台の衛生と供給量は未設計である。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
##########DD#####
#OOO..KKKK...WWW#
#OOO..KKKK...WWW#
#OOO............#
#............NNN#
#QQQ.........NNN#
#QQQ..CCCC...NNN#
#################
```
