---
{
  "id": "room-inn-3",
  "kind": "rooms",
  "title": "ゲルダの宿／2階 ゲルダとニーナの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-inn",
  "floor": 1,
  "room_name": "2階 ゲルダとニーナの部屋",
  "use": "寝",
  "occupants": [
    "ゲルダ",
    "ニーナ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "#########",
      "#BB...CC#",
      "#BB...CC#",
      "#BB...CC#",
      "#BB...CC#",
      "#.......#",
      "#LL...MM#",
      "#LL...MM#",
      "#.......#",
      "###DD####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        9
      ],
      "width_cells": 2,
      "target": "room-inn-hall",
      "target_door": [
        3,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "個別寝台",
      "owner": "ゲルダ",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ゲルダが手入れする案",
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "個別寝台を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "L",
      "name": "衣服箱",
      "owner": "ゲルダ",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
      "rect": [
        1,
        6,
        2,
        2
      ],
      "access": [
        [
          3,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服箱を使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "C",
      "name": "個別寝台",
      "owner": "ニーナ",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ニーナが手入れする案",
      "rect": [
        6,
        1,
        2,
        4
      ],
      "access": [
        [
          5,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "個別寝台を使う",
          "rect": [
            4,
            1,
            2,
            2
          ]
        }
      ],
      "role": "bed",
      "maintainers": [
        "resident-ニーナ"
      ]
    },
    {
      "symbol": "M",
      "name": "衣服箱",
      "owner": "ニーナ",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ニーナが手入れする案",
      "rect": [
        6,
        6,
        2,
        2
      ],
      "access": [
        [
          5,
          6
        ]
      ],
      "use_space": [
        {
          "activity": "衣服箱を使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-ニーナ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-inn-3-1",
      "resident": "resident-ゲルダ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "固有の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-inn-3-1",
      "storage_symbol": "L"
    },
    {
      "id": "bed-inn-3-2",
      "resident": "resident-ニーナ",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "固有の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-inn-3-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-inn",
    "resident-ゲルダ",
    "resident-ニーナ"
  ],
  "personal_storage": [
    {
      "id": "storage-inn-3-1",
      "resident": "resident-ゲルダ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "専用の衣服箱"
    },
    {
      "id": "storage-inn-3-2",
      "resident": "resident-ニーナ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "M",
      "compartment": "専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-ゲルダ",
    "resident-ニーナ"
  ]
}
---
# ゲルダの宿／2階 ゲルダとニーナの部屋

## 用途と配置

[[building-inn]] の平面案に属する。共用廊下から専用の戸を通って入る。寝台と衣服箱は一人ずつ分ける。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
#########
#BB...CC#
#BB...CC#
#BB...CC#
#BB...CC#
#.......#
#LL...MM#
#LL...MM#
#.......#
###DD####
```
