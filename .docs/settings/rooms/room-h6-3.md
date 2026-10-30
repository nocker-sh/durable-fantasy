---
{
  "id": "room-h6-3",
  "kind": "rooms",
  "title": "ヨーゼフの小屋／1階 寝台の隅",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "building": "building-h6",
  "floor": 0,
  "room_name": "寝台の隅",
  "use": "個別寝台と着替え",
  "occupants": [
    "ヨーゼフ"
  ],
  "bed_capacity": 1,
  "grid": {
    "cell_m": 0.5,
    "origin": "北西",
    "rows": [
      "######",
      "#..BB#",
      "#..BB#",
      "#..BB#",
      "D..BB#",
      "D....#",
      "#..CC#",
      "######"
    ],
    "legend": {
      "#": "壁・目隠しの占有",
      ".": "床と使用面",
      "D": "戸口・開口"
    }
  },
  "connections": [
    {
      "kind": "opening",
      "door": [
        0,
        4
      ],
      "width_cells": 2,
      "target": "room-h6-2",
      "target_door": [
        7,
        4
      ]
    }
  ],
  "furniture": [
    {
      "symbol": "B",
      "name": "ヨーゼフの寝台",
      "owner": "ヨーゼフ",
      "source": "木工師の寝台と本人の寝具",
      "rect": [
        3,
        1,
        2,
        4
      ],
      "access": [
        [
          2,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "寝台の横に立ち、寝具を整える",
          "rect": [
            1,
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
      "name": "乾いた衣服と首巻きの衣装箱",
      "owner": "ヨーゼフ",
      "source": "町の木工師の仕事",
      "rect": [
        3,
        6,
        2,
        1
      ],
      "access": [
        [
          2,
          6
        ]
      ],
      "role": "storage",
      "use_space": [
        {
          "activity": "衣装箱を開けて衣服を取り出す",
          "rect": [
            1,
            5,
            2,
            2
          ]
        }
      ]
    }
  ],
  "issues": [
    "建物外形と薪割り場・隣地・通路の照合未完了",
    "便所と灰・汚水の搬出先が未確定",
    "戸・椅子・衣装箱と火の周囲の可動域・立体照合未完了",
    "使用面の平面案は確保したが、箱の蓋と体の姿勢の立体確認は未完了"
  ],
  "sleeping_places": [
    {
      "id": "bed-h6-3-1",
      "resident": "resident-ヨーゼフ",
      "kind": "個別寝台",
      "grid_symbol": "B",
      "storage_status": "個人収納の区画を割り当てた。容量・開閉と出し入れの姿勢は未照合",
      "storage_symbol": "C",
      "storage_id": "storage-h6-3-1"
    }
  ],
  "guest_capacity": 0,
  "origin": [
    7,
    0
  ],
  "design_dependencies": [
    "building-h6",
    "room-h6-2",
    "resident-ヨーゼフ"
  ],
  "personal_storage": [
    {
      "id": "storage-h6-3-1",
      "resident": "resident-ヨーゼフ",
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

# ヨーゼフの小屋／1階 寝台の隅

## 利用と配置

ヨーゼフの唯一の常用寝台を北東に置く。西側の開口から寝台の長辺へ入り、足元側の衣装箱に乾いた衣服と首巻きをしまう。濡れた外套、斧、薪と炭の保管には使わない。

台所側との境には板の目隠しと開け放せる建具を使う案とし、独立した豪華な寝室にはしない。開口には扉の開閉域の確認が残る。炉からの暖気を受けながら、窓の換気と寝具に灰を入れない納まりを一緒に設計する。

## グリッド

```grid
######
#..BB#
#..BB#
#..BB#
D..BB#
D....#
#..CC#
######
```

一セルは半メートル。[[building-h6]] の共通座標で部屋の戸口を合わせる。これは計画案であり、現行の自動間取りと外観を追認する図ではない。

## 未解決の生活条件

水汲みは [[facility-square-well]] との経路を設計する。便所、灰と汚水の搬出、窓と排煙、濡れた物の乾燥と火との離隔は、敷地と町全体の設計で確定する。

## 個人収納の割当

ヨーゼフの衣服・首巻き・私物は personal_storage の固有区画へ割り当てる。共用の食材や仕事の在庫と混ぜない。家具を共有する場合も個人の区画を分け、同じ区画を二人へ重複させない。ID の割当は収納量や開閉の確認を済ませた意味ではない。

## 家具を使う空間

以前の案では寝台の横が一セルしかなく、半メートル幅の隙間を使用面としていた。寝台の区画を横に広げて、寝具を整える場所と衣装箱を扱う場所を use_space に記録する。それぞれ家具の占有と重ならない一メートル四方を平面で確保する。これは箱の蓋を開ける高さや着替えの姿勢を立体で確認した意味ではない。
