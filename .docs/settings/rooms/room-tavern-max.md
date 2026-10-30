---
{
  "id": "room-tavern-max",
  "kind": "rooms",
  "title": "フランツの酒場／2階 マックスの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tavern",
  "floor": 1,
  "room_name": "マックスの部屋",
  "use": "寝",
  "occupants": [
    "マックス"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#CC.......#",
      "#CC.......#",
      "#CC.......#",
      "#CC.......#",
      "#.........#",
      "#.........#",
      "#MM.......#",
      "#MM.......#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "target": "room-tavern-upper-hall",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target_door": [
        14,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "C",
      "name": "個別の寝台",
      "owner": "マックス",
      "source": "町の木工所で寝台を作り、寝具は仕立屋へ頼む案。マックスが手入れする案",
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
          "activity": "個別の寝台を使う",
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
        "resident-マックス"
      ]
    },
    {
      "symbol": "M",
      "name": "個人の衣服箱",
      "owner": "マックス",
      "source": "町の木工所と鍛冶場へ用途に合う木部と金具の製作を頼む案。マックスが手入れする案",
      "rect": [
        1,
        7,
        2,
        2
      ],
      "access": [
        [
          3,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "個人の衣服箱を使う",
          "rect": [
            3,
            7,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "maintainers": [
        "resident-マックス"
      ]
    }
  ],
  "issues": [
    "戸・窓・梁と頭上高、敷地と外観は未照合",
    "給排水と便所・火と煙・灰、洗濯と収納容量、日課と描画は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-tavern-5-2",
      "resident": "resident-マックス",
      "kind": "個別寝台",
      "grid_symbol": "C",
      "storage_status": "専用の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-tavern-5-2",
      "storage_symbol": "M"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-tavern",
    "room-tavern-upper-hall",
    "resident-マックス"
  ],
  "personal_storage": [
    {
      "id": "storage-tavern-5-2",
      "resident": "resident-マックス",
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
    15,
    14
  ],
  "private_for": [
    "resident-マックス"
  ]
}
---
# フランツの酒場／2階 マックスの部屋

## 暮らしと個室

[[resident-マックス]] の専用の寝台と衣服箱を持ち、[[room-tavern-upper-hall]] から専用の戸で入る。他の住み込みの者の寝室を通路へ使わず、客を通さない。寝台と収納のID・家具の寸法・使用面は相部屋の案から維持する。

## 未解決の生活

現行の酒場の相部屋とは異なる個室の提案であり、描画や日課の居場所を切替済みとしない。戸と施錠・視線、壁の音と灯り、着替えと衣服の容量、仕事を終えた後の休息と寝具の手入れは未照合である。敷地と建物の立体は [[building-tavern]] を参照する。

```grid
####DD#####
#CC.......#
#CC.......#
#CC.......#
#CC.......#
#.........#
#.........#
#MM.......#
#MM.......#
###########
```
