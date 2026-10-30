---
{
  "id": "room-tailor-3",
  "kind": "rooms",
  "title": "マグダレーナの仕立て屋／2階 マグダレーナの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "floor": 1,
  "room_name": "2階 マグダレーナの寝室",
  "use": "寝",
  "occupants": [
    "マグダレーナ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "###########",
      "#BB....LL.#",
      "#BB....LL.#",
      "#BB.......#",
      "#BB.......#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "####DD#####"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        10
      ],
      "width_cells": 2,
      "target": "room-tailor-upper-hall",
      "target_door": [
        4,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "マグダレーナの寝台",
      "owner": "マグダレーナ",
      "source": "町の木工所で寝台を作り、仕立て屋で寝具を仕立てる案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
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
          "activity": "マグダレーナの寝台を使う",
          "rect": [
            3,
            1,
            2,
            4
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "L",
      "name": "マグダレーナの衣服箱",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
        1,
        2,
        2
      ],
      "access": [
        [
          6,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "マグダレーナの衣服箱を使う",
          "rect": [
            5,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "sleeping_places": [
    {
      "id": "bed-tailor-3-1",
      "resident": "resident-マグダレーナ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-tailor-3-1",
      "storage_symbol": "L"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-tailor",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "personal_storage": [
    {
      "id": "storage-tailor-3-1",
      "resident": "resident-マグダレーナ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "origin": [
    5,
    0
  ],
  "private_for": [
    "resident-マグダレーナ"
  ]
}
---
# マグダレーナの仕立て屋／2階 マグダレーナの寝室

## 用途と暮らし

[[building-tailor]] の平面案に属する。マグダレーナの個室とし、本人の寝台と衣服箱を持つ。縫製の仕事を引き継ぐ人の通り抜けを、寝室の用途へ混ぜない。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
###########
#BB....LL.#
#BB....LL.#
#BB.......#
#BB.......#
#.........#
#.........#
#.........#
#.........#
#.........#
####DD#####
```
