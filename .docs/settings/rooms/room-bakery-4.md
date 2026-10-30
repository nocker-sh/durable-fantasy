---
{
  "id": "room-bakery-4",
  "kind": "rooms",
  "title": "マルタのパン屋／2階 ハンスの部屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-bakery",
  "floor": 1,
  "room_name": "ハンスの部屋",
  "use": "寝",
  "occupants": [
    "ハンス"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#....#",
      "#....#",
      "#HH..#",
      "#HH..#",
      "#HH..#",
      "#HH..#",
      "#....#",
      "#....#",
      "#....#",
      "#CC..#",
      "#....#",
      "#....#",
      "###DD#"
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
        10,
        0
      ],
      "width_cells": 2
    }
  ],
  "furniture": [
    {
      "symbol": "H",
      "name": "ハンスの寝台",
      "owner": "ハンス",
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
          "activity": "寝具を整える",
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
      "owner": "ハンス",
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
      "role": "storage",
      "use_space": [
        {
          "activity": "衣服を取り出す",
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
    "実寸での扉開閉・家具使用姿勢の確認未完了"
  ],
  "origin": [
    7,
    0
  ],
  "sleeping_places": [
    {
      "id": "bed-bakery-4-1",
      "resident": "resident-ハンス",
      "kind": "個別寝台",
      "grid_symbol": "H",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_id": "storage-bakery-4-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-bakery",
    "room-bakery-landing",
    "resident-ハンス"
  ],
  "personal_storage": [
    {
      "id": "storage-bakery-4-1",
      "resident": "resident-ハンス",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "全体"
    }
  ]
}
---

# マルタのパン屋／2階 ハンスの部屋

## 利用と配置

ハンスの寝台は北寄り、衣装箱は南西側に置く。入口から寝台の側面と衣装箱の前へ同じ通路で届く。隣の寝間を通らず共用踊り場から出入りし、早朝のパン仕事で他の寝台をまたがない。作業道具と粉の収納を寝台の下へ押し込む設計にはしない。窓と灯り、暖気、換気の位置は建物全体で照合する。

## グリッド

一セルは半メートルで、上が北、左が西である。記号の家具はメタデータの furniture に対応する。access は家具の前で人が立つセルで、入口から到達できることを確認する。占有格子だけで扉の開閉や作業姿勢まで検証できたことにはしない。

```grid
######
#....#
#....#
#HH..#
#HH..#
#HH..#
#HH..#
#....#
#....#
#....#
#CC..#
#....#
#....#
###DD#
```

## 建物全体との関係

[[building-bakery]] の再設計案に属する。現行の外形と自動配置を追認する図ではない。台所と売り場、各寝間と踊り場を接続し、生活に必要な設備の未解決事項を閉じてから描画へ進む。

## 寝床の割当

ハンスにそれぞれ一つの寝台を割り当てる。寝台を交代で共有して人数を合わせる設計にはしない。寝台のIDは sleeping_places に持ち、住民資料の bedroom と bed_id から同じ割当を参照する。割当の確定と、実寸の家具・通路の設計完了は別である。

## 個人収納の割当

ハンスの衣服・首巻き・私物は personal_storage の固有区画へ割り当てる。共用の食材や仕事の在庫と混ぜない。家具を共有する場合も個人の区画を分け、同じ区画を二人へ重複させない。ID の割当は収納量や開閉の確認を済ませた意味ではない。
