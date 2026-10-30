---
{
  "id": "room-tailor-5",
  "kind": "rooms",
  "title": "マグダレーナの仕立て屋／2階 布と毛の倉",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "floor": 1,
  "room_name": "布と毛の倉",
  "use": "貯蔵",
  "occupants": [
    "マグダレーナ",
    "ロッテ"
  ],
  "bed_capacity": 0,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "####DD#####",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#RR.....SS#",
      "#.........#",
      "#TTT...LLL#",
      "#TTT...LLL#",
      "#.........#",
      "#.........#",
      "###########"
    ]
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        4,
        0
      ],
      "width_cells": 2,
      "target": "room-tailor-upper-hall",
      "target_door": [
        14,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "R",
      "name": "巻いた布を横に支える棚甲",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        1,
        2,
        5
      ],
      "access": [
        [
          3,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "巻いた布を横に支える棚甲を使う",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "S",
      "name": "巻いた布を横に支える棚乙",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        8,
        1,
        2,
        5
      ],
      "access": [
        [
          7,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "巻いた布を横に支える棚乙を使う",
          "rect": [
            6,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "布の量と傷みを確かめる台",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        1,
        7,
        3,
        2
      ],
      "access": [
        [
          4,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "布の量と傷みを確かめる台を使う",
          "rect": [
            4,
            7,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "L",
      "name": "毛と仕立て前の材料の受け",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "maintainers": [
        "resident-マグダレーナ"
      ],
      "rect": [
        7,
        7,
        3,
        2
      ],
      "access": [
        [
          6,
          7
        ]
      ],
      "use_space": [
        {
          "activity": "毛と仕立て前の材料の受けを使う",
          "rect": [
            5,
            7,
            2,
            2
          ]
        }
      ],
      "role": "work_storage"
    }
  ],
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "building-tailor",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "origin": [
    15,
    14
  ],
  "private_for": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ]
}
---
# マグダレーナの仕立て屋／2階 布と毛の倉

## 用途と暮らし

[[building-tailor]] の平面案に属する。布と毛を乾いた状態で保管し、量と傷みを確認する仕事の倉とする。個人の衣服箱と売る布・客の衣服を混ぜない。湿気と灰・虫害、布の巻径と重量・広げる寸法は未照合である。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
####DD#####
#RR.....SS#
#RR.....SS#
#RR.....SS#
#RR.....SS#
#RR.....SS#
#.........#
#TTT...LLL#
#TTT...LLL#
#.........#
#.........#
###########
```
