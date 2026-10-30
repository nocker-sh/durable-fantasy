---
{
  "id": "room-inn-5",
  "kind": "rooms",
  "title": "ゲルダの宿／2階 客室1",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-inn",
  "floor": 1,
  "room_name": "2階 客室1",
  "use": "客室",
  "occupants": [],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###DD####",
      "#BB...CC#",
      "#BB...CC#",
      "#BB...CC#",
      "#BB...CC#",
      "#.......#",
      "#LL...MM#",
      "#LL...MM#",
      "#.......#",
      "#.......#",
      "#########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        0
      ],
      "width_cells": 2,
      "target": "room-inn-hall",
      "target_door": [
        3,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "客用の個別寝台",
      "owner": "ゲルダの宿",
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
          "activity": "客用の個別寝台を使う",
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
      "name": "客枠ごとの荷物置き",
      "owner": "ゲルダの宿",
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
          "activity": "客枠ごとの荷物置きを使う",
          "rect": [
            3,
            6,
            2,
            2
          ]
        }
      ],
      "role": "luggage_storage",
      "maintainers": [
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "C",
      "name": "客用の個別寝台",
      "owner": "ゲルダの宿",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。ゲルダが手入れする案",
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
          "activity": "客用の個別寝台を使う",
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
        "resident-ゲルダ"
      ]
    },
    {
      "symbol": "M",
      "name": "客枠ごとの荷物置き",
      "owner": "ゲルダの宿",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。ゲルダが手入れする案",
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
          "activity": "客枠ごとの荷物置きを使う",
          "rect": [
            4,
            6,
            2,
            2
          ]
        }
      ],
      "role": "luggage_storage",
      "maintainers": [
        "resident-ゲルダ"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "sleeping_places": [],
  "guest_capacity": 2,
  "design_dependencies": [
    "building-inn",
    "resident-ゲルダ"
  ],
  "guest_sleeping_places": [
    {
      "id": "guest-bed-inn-5-1",
      "label": "客枠1",
      "grid_symbol": "B",
      "luggage_id": "guest-luggage-inn-5-1",
      "luggage_symbol": "L"
    },
    {
      "id": "guest-bed-inn-5-2",
      "label": "客枠2",
      "grid_symbol": "C",
      "luggage_id": "guest-luggage-inn-5-2",
      "luggage_symbol": "M"
    }
  ],
  "origin": [
    5,
    13
  ]
}
---
# ゲルダの宿／2階 客室1

## 用途と配置

[[building-inn]] の平面案に属する。共用廊下から入り、各客枠の寝台と荷物置きを分ける。主人たちの寝床と衣服箱を客用に数えない。寝具交換と清掃、荷物を広げる身体と収納容量は引き続き照合する。

## 図面と未解決の生活

この平面は現行の自動配置を置き換えるための案であり、描画へはまだ反映しない。給排水・便所と洗濯、火気・換気、窓と梁、戸の操作、敷地・段差と生活の日課は未照合である。

```grid
###DD####
#BB...CC#
#BB...CC#
#BB...CC#
#BB...CC#
#.......#
#LL...MM#
#LL...MM#
#.......#
#.......#
#########
```
