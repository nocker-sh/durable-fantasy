---
{
  "id": "room-h-g1-2",
  "kind": "rooms",
  "title": "テオの家／1階 寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h-g1",
  "floor": 0,
  "room_name": "寝室",
  "use": "寝",
  "occupants": [
    "テオ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "############",
      "#BB......CC#",
      "#BB........#",
      "#BB........#",
      "#BB......QQ#",
      "#..........#",
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
      "target": "room-h-g1-1",
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
      "symbol": "B",
      "name": "テオの寝台",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        1,
        1,
        2,
        4
      ],
      "access": [
        [
          3,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝具を整えて横になる",
          "rect": [
            3,
            2,
            2,
            2
          ]
        }
      ],
      "role": "bed"
    },
    {
      "symbol": "C",
      "name": "乾いた衣服と私物の箱",
      "owner": "テオ",
      "source": "町の木工師から手に入れた家具",
      "rect": [
        9,
        1,
        2,
        1
      ],
      "access": [
        [
          8,
          1
        ]
      ],
      "use_space": [
        {
          "activity": "衣服と首巻きを出し入れする",
          "rect": [
            7,
            1,
            2,
            2
          ]
        }
      ],
      "role": "storage",
      "owners": [
        "テオ"
      ],
      "compartments": [
        "本人の区画"
      ]
    },
    {
      "symbol": "Q",
      "name": "案内の記録と乾いた道具の箱",
      "owner": "テオ",
      "source": "町の木工師の箱と本人の道案内の覚書",
      "rect": [
        9,
        4,
        2,
        1
      ],
      "access": [
        [
          8,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "覚書と乾いた道具を出し入れする",
          "rect": [
            7,
            3,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "issues": [
    "衣服箱と仕事の箱の容量・蓋と寝具・着替えの姿勢は未照合",
    "戸の金具と目隠し・換気と夜の灯り・日課との照合未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h-g1-2-1",
      "resident": "resident-テオ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "衣服箱Cへ配置。容量と可動域は未照合",
      "storage_id": "storage-h-g1-2-1",
      "storage_symbol": "C"
    }
  ],
  "guest_capacity": 0,
  "design_dependencies": [
    "building-h-g1",
    "room-h-g1-1",
    "resident-テオ"
  ],
  "personal_storage": [
    {
      "id": "storage-h-g1-2-1",
      "resident": "resident-テオ",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "C",
      "compartment": "本人の区画"
    }
  ],
  "origin": [
    0,
    0
  ],
  "door_leaves": [
    {
      "door": [
        5,
        6
      ],
      "hinge": "end",
      "frame_inset_m": 0.05,
      "thickness_m": 0.04,
      "waits_for": [],
      "operation": {
        "body_radius_m": 0.4,
        "orbit_radius_m": 1.5,
        "start_deg": 20,
        "end_deg": 70,
        "waits_for": [
          {
            "furniture": "B",
            "space_index": 0,
            "reason": "寝具の手入れや寝台への出入りと戸の開閉を別の動作として行う"
          }
        ]
      }
    }
  ],
  "private_for": [
    "resident-テオ"
  ]
}
---

# テオの家／1階 寝室

## 本人の寝床と衣服

テオの常用寝台Bと衣服箱Cを、既存の固有IDへ対応させる。寝台の東側に使用面を取り、衣服と首巻き・私物を本人の箱へしまう。旅人から預かった荷、濡れた外套、食材の保管場所として重複使用しない。

## 仕事の記録を乾いた箱へ分ける

道順の覚書と乾いた道具は箱Qへ分け、衣服や寝具の容積で仕事の保管量を満たしたことにしない。記録を取り出して居間の絵地図で案内の準備をし、他人に説明するため本人の寝床へ通す構成にはしない。

## 平面案

一セルは半メートル。[[room-h-g1-1]]から入る本人の私室である。


戸の板厚と枠・本人の操作の平面案を持つ。金具、寝具と箱の容量、目隠しと換気、夜の移動は別に照合する。

## 戸を扱う身体と作業の順番

寝具の手入れや寝台への出入りと戸の開閉を別の動作として行う。戸板の回転とは別に、開閉する身体の円弧と家具の使用面を照合する。同時使用できる面としては扱わず、待つ人の位置と道側からの操作・人の移動の連続は別に照合する。

```grid
############
#BB......CC#
#BB........#
#BB........#
#BB......QQ#
#..........#
#####DD#####
```
