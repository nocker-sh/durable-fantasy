---
{
  "id": "room-bakery-3",
  "kind": "rooms",
  "title": "マルタのパン屋／2階 マルタとローザの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-bakery",
  "floor": 1,
  "room_name": "マルタとローザの寝室",
  "use": "寝",
  "occupants": [
    "マルタ",
    "ローザ"
  ],
  "bed_capacity": 2,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "########",
      "#......#",
      "#......#",
      "#MM..RR#",
      "#MM..RR#",
      "#MM..RR#",
      "#MM..RR#",
      "#......#",
      "#......#",
      "#......#",
      "#CC....#",
      "#......#",
      "#......#",
      "###DD###"
    ],
    "legend": {
      "#": "壁",
      ".": "通路・使用面",
      "D": "出入口"
    }
  },
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        13
      ],
      "target": "room-bakery-landing",
      "target_door": [
        3,
        0
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "M",
      "name": "マルタの寝台",
      "owner": "マルタ",
      "source": "大工の寝台と家族の寝具",
      "rect": [
        1,
        3,
        2,
        4
      ],
      "access": [
        [
          3,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "寝台の横で寝具を整える",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "R",
      "name": "ローザの寝台",
      "owner": "ローザ",
      "source": "大工の寝台と家族の寝具",
      "rect": [
        5,
        3,
        2,
        4
      ],
      "access": [
        [
          4,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "寝台の横で寝具を整える",
          "rect": [
            3,
            4,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "衣服と首巻きの衣装箱",
      "owner": "マルタ、ローザ",
      "source": "大工の衣装箱",
      "rect": [
        1,
        10,
        2,
        1
      ],
      "access": [
        [
          3,
          10
        ]
      ],
      "owners": [
        "マルタ",
        "ローザ"
      ],
      "compartments": [
        "上段",
        "下段"
      ],
      "role": "storage",
      "use_space": [
        {
          "activity": "個人の収納区画から衣服を取り出す",
          "rect": [
            3,
            9,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "建物外形と寸法の変更が必要",
    "窓・排煙・排水・便所・屋外窯との接続の照合未完了",
    "実寸での扉開閉・家具使用姿勢の確認未完了",
    "共通の寝台脇と収納の使用空間は、一人ずつ使う順序の照合が未完了"
  ],
  "origin": [
    0,
    0
  ],
  "sleeping_places": [
    {
      "id": "bed-bakery-3-1",
      "resident": "resident-マルタ",
      "kind": "個別寝台",
      "grid_symbol": "M",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_id": "storage-bakery-3-1",
      "storage_symbol": "C"
    },
    {
      "id": "bed-bakery-3-2",
      "resident": "resident-ローザ",
      "kind": "個別寝台",
      "grid_symbol": "R",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_id": "storage-bakery-3-2",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-bakery",
    "room-bakery-landing",
    "resident-マルタ",
    "resident-ローザ"
  ],
  "personal_storage": [
    {
      "id": "storage-bakery-3-1",
      "resident": "resident-マルタ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "上段"
    },
    {
      "id": "storage-bakery-3-2",
      "resident": "resident-ローザ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "下段"
    }
  ]
}
---

# マルタのパン屋／2階 マルタとローザの寝室

## 利用と配置

マルタとローザには別々の寝台を割り当てる。寝台の長辺に立てる中央通路を残し、入口から両方の寝具へ届く。衣装箱は戸口を塞がず、蓋を開けて前に立てる場所を取る。粉を扱う作業や食品の貯蔵は寝間へ持ち込まない。窓、夜の手元灯、暖気の取り込み、着替えの目隠しは北壁と戸の設計時に確定する。

## グリッド

一セルは半メートルで、上が北、左が西である。記号の家具はメタデータの furniture に対応する。access は家具の前で人が立つセルで、入口から到達できることを確認する。占有格子だけで扉の開閉や作業姿勢まで検証できたことにはしない。

```grid
########
#......#
#......#
#MM..RR#
#MM..RR#
#MM..RR#
#MM..RR#
#......#
#......#
#......#
#CC....#
#......#
#......#
###DD###
```

## 建物全体との関係

[[building-bakery]] の再設計案に属する。現行の外形と自動配置を追認する図ではない。台所と売り場、各寝間と踊り場を接続し、生活に必要な設備の未解決事項を閉じてから描画へ進む。

## 寝床の割当

マルタ、ローザにそれぞれ一つの寝台を割り当てる。寝台を交代で共有して人数を合わせる設計にはしない。寝台のIDは sleeping_places に持ち、住民資料の bedroom と bed_id から同じ割当を参照する。割当の確定と、実寸の家具・通路の設計完了は別である。

## 個人収納の割当

マルタ、ローザの衣服・首巻き・私物は personal_storage の固有区画へ割り当てる。共用の食材や仕事の在庫と混ぜない。家具を共有する場合も個人の区画を分け、同じ区画を二人へ重複させない。ID の割当は収納量や開閉の確認を済ませた意味ではない。

## 寝台の間の幅

二つの寝台の間が半メートルしかなかった案を改め、北西の部屋を一セル広げ、ローザの寝台を東へ寄せた。寝具と収納の使用空間は共通の床を使うため、二人が同時に同じ床へ立てるとはしない。着替えの目隠しと使用順序は別に確認する。
