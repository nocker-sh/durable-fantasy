---
{
  "id": "room-tailor-upper-stairs",
  "kind": "rooms",
  "source": "world/town/houses.ts",
  "town": "town-phanthiet",
  "building": "building-tailor",
  "bed_capacity": 0,
  "title": "マグダレーナの仕立て屋／2階 住人の階段",
  "room_name": "2階 住人の階段",
  "status": "設計中",
  "design_gate": "未通過",
  "floor": 1,
  "origin": [
    0,
    0
  ],
  "use": "生活",
  "occupants": [
    "マグダレーナ",
    "ロッテ"
  ],
  "furniture": [
    {
      "symbol": "S",
      "name": "住まいへ上がる階段",
      "owner": "マグダレーナ",
      "source": "町の木工所と鍛冶場へ用途に合う部材と製作を頼む案。マグダレーナが手入れする案",
      "rect": [
        1,
        1,
        2,
        12
      ],
      "access": [
        [
          3,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "住まいへ上がる階段を使う",
          "rect": [
            3,
            1,
            2,
            2
          ]
        }
      ],
      "maintainers": [
        "resident-マグダレーナ"
      ]
    }
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        5,
        11
      ],
      "width_cells": 2,
      "target": "room-tailor-upper-hall",
      "target_door": [
        0,
        1
      ]
    },
    {
      "kind": "stair",
      "target": "room-tailor-lower-stairs",
      "furniture": "S",
      "target_furniture": "S",
      "access": [
        3,
        1
      ],
      "target_access": [
        2,
        13
      ]
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
  "private_for": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..#",
      "#SS..D",
      "#SS..D",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "#....#",
      "######"
    ]
  }
}
---
# マグダレーナの仕立て屋／2階 住人の階段

## 用途と暮らし

[[building-tailor]] の平面案に属する。共用廊下から二人の私室・家庭と布の倉へ行く。布の運搬量と階段での姿勢・手摺の操作は未照合である。

## 未解決の条件

敷地と構造・戸と窓、布と毛の容量・搬送、採寸と裁断・織りと縫いの操作、家庭の給排水と便所・火と灰、衣服と寝具の手入れ、仕事と食事・休息、立体は未照合である。現行の建物と描画は切り替えない。

```grid
######
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..#
#SS..D
#SS..D
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
#....#
######
```
