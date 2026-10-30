---
{
  "id": "room-guardhouse-4",
  "kind": "rooms",
  "title": "門の詰所／2階 ディーターの寝室",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-guardhouse",
  "floor": 1,
  "origin": [
    10,
    0
  ],
  "room_name": "ディーターの寝室",
  "use": "寝",
  "occupants": [
    "ディーター"
  ],
  "private_for": [
    "resident-ディーター"
  ],
  "bed_capacity": 1,
  "guest_capacity": 0,
  "sleeping_places": [
    {
      "id": "bed-guardhouse-4-1",
      "resident": "resident-ディーター",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "本人の衣服箱を配置。容量と開閉は未照合",
      "storage_id": "storage-guardhouse-4-1",
      "storage_symbol": "L"
    }
  ],
  "personal_storage": [
    {
      "id": "storage-guardhouse-4-1",
      "resident": "resident-ディーター",
      "contents": [
        "衣服",
        "首巻き",
        "私物"
      ],
      "furniture_symbol": "L",
      "compartment": "本人専用の衣服箱"
    }
  ],
  "issues": [
    "敷地と門・道・隣家・地形、戸と窓・梁は未照合",
    "交代と警備・街灯と食事・睡眠、油と道具・生活設備と日課・立体は未照合"
  ],
  "design_dependencies": [
    "building-guardhouse",
    "resident-ディーター"
  ],
  "connections": [
    {
      "kind": "door",
      "door": [
        3,
        10
      ],
      "width_cells": 2,
      "target": "room-guardhouse-upper-hall",
      "target_door": [
        8,
        0
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ディーターの寝台",
      "owner": "ディーター",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ディーターが手入れする案",
      "maintainers": [
        "resident-ディーター"
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
          "activity": "ディーターの寝台を使う",
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
      "name": "ディーターの衣服箱",
      "owner": "ディーター",
      "source": "町の木工所で製作し、寝具は仕立屋へ頼む案。ディーターが手入れする案",
      "maintainers": [
        "resident-ディーター"
      ],
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
          "activity": "ディーターの衣服箱を使う",
          "rect": [
            3,
            7,
            2,
            2
          ]
        }
      ],
      "role": "storage"
    }
  ],
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#BB..#",
      "#BB..#",
      "#BB..#",
      "#BB..#",
      "#....#",
      "#....#",
      "#LL..#",
      "#LL..#",
      "#....#",
      "###DD#"
    ]
  }
}
---
# 門の詰所／2階 ディーターの寝室

## 用途と暮らし

[[building-guardhouse]] の平面案に属する。ディーター本人の寝台と衣服箱を持つ。勤務時間の違う同僚と寝台を共用せず、各人の昼と夜の睡眠を別の室に分ける。遮光と音・換気、実際の睡眠時間と交代は未照合である。

## 未解決の条件

敷地と門・道・構造・戸と窓、勤務の交代と警備・街灯・食事と睡眠、油と装備・汚れと手入れ、給排水と便所・火と灰、四人の衣服と寝具、立体は未照合である。現行の建物と描画は切り替えない。

```grid
######
#BB..#
#BB..#
#BB..#
#BB..#
#....#
#....#
#LL..#
#LL..#
#....#
###DD#
```
