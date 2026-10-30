---
{
  "id": "room-hue-ludwig-1",
  "kind": "rooms",
  "title": "ルードヴィヒの食事と休息の室の案",
  "status": "設計中",
  "source": ".docs/settings/towns/town-hue.md",
  "design_gate": "未通過",
  "town": "town-hue",
  "implementation": "未実装の設計案",
  "building": "building-hue-ludwig",
  "map": "map-hue-quarter",
  "household": "hue-ludwig",
  "floor": 0,
  "occupants": [
    "ルードヴィヒ"
  ],
  "grid": {
    "cell_m": 0.5,
    "rows": [
      "##############",
      "#KKK.FF.ARCC.#",
      "#....FF.....X#",
      "#............#",
      "#V.......TT..#",
      "#.......STT..#",
      "###DD#########"
    ]
  },
  "furniture": [
    {
      "symbol": "K",
      "name": "食材を整える台",
      "role": "food_preparation",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        1,
        3,
        1
      ],
      "access": [
        [
          2,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食材と調理の道具を扱う",
          "rect": [
            1,
            2,
            3,
            2
          ]
        }
      ]
    },
    {
      "symbol": "V",
      "name": "飲用の水を保管する容器の場所",
      "role": "potable_water_storage",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        1,
        4,
        1,
        1
      ],
      "access": [
        [
          2,
          4
        ]
      ],
      "use_space": [
        {
          "activity": "飲用の容器から水を取り出す",
          "rect": [
            2,
            3,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "F",
      "name": "調理の炉の候補",
      "role": "cooking_station",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        5,
        1,
        2,
        2
      ],
      "access": [
        [
          5,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "調理と炉の手入れをする",
          "rect": [
            4,
            3,
            3,
            2
          ]
        }
      ]
    },
    {
      "symbol": "T",
      "name": "本人の食卓",
      "role": "table",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        9,
        4,
        2,
        2
      ],
      "access": [
        [
          9,
          3
        ]
      ],
      "use_space": [
        {
          "activity": "配膳と食卓を整える",
          "rect": [
            8,
            2,
            2,
            2
          ]
        }
      ],
      "seat_symbols": [
        "S"
      ]
    },
    {
      "symbol": "S",
      "name": "本人の食卓の椅子",
      "role": "seat",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        8,
        5,
        1,
        1
      ],
      "access": [
        [
          7,
          5
        ]
      ],
      "use_space": [
        {
          "activity": "椅子を使い食事と休息をする",
          "rect": [
            6,
            4,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "C",
      "name": "食料と食器の収納",
      "role": "storage",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        10,
        1,
        2,
        1
      ],
      "access": [
        [
          10,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食料と食器を取り出す",
          "rect": [
            10,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "A",
      "name": "取り外せる食器洗い鉢の台",
      "role": "dish_washing",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        8,
        1,
        1,
        1
      ],
      "access": [
        [
          8,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "食器を洗い、鉢を取り出して排水する",
          "rect": [
            7,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "R",
      "name": "洗った食器を水切りする棚の場所",
      "role": "dish_drying",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        9,
        1,
        1,
        1
      ],
      "access": [
        [
          9,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "洗った食器を置き、水切り後に取り込む",
          "rect": [
            9,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "symbol": "X",
      "name": "食器の排水を保管する蓋付き容器の場所",
      "role": "kitchen_effluent_holding",
      "owner": "ルードヴィヒ",
      "source": "本人が市内の作り手へ依頼する案。担当と原料・製作量は未割当",
      "maintainers": [
        "resident-ルードヴィヒ"
      ],
      "rect": [
        12,
        2,
        1,
        1
      ],
      "access": [
        [
          11,
          2
        ]
      ],
      "use_space": [
        {
          "activity": "排水を受けて蓋を閉じ、容器を取り出す",
          "rect": [
            10,
            2,
            2,
            2
          ]
        }
      ]
    }
  ],
  "guest_capacity": 0,
  "issues": [
    "平面の占有と使用面の案。家具の立体・身体と戸の開閉、物の容量と供給は未照合",
    "熱と灯り・換気、灰と汚水・排泄物と日課、実際の敷地と構造は未設計",
    "扉の板と金具の平面回転の案。枠と金具の実物・上下の隙間、操作する身体と開位置での通行は未照合"
  ],
  "design_dependencies": [
    "town-hue",
    "map-hue-quarter",
    "building-hue-ludwig",
    "resident-ルードヴィヒ",
    "room-hue-ludwig-hall"
  ],
  "bed_capacity": 0,
  "sleeping_places": [],
  "personal_storage": [],
  "origin": [
    6,
    0
  ],
  "connections": [
    {
      "kind": "door",
      "target": "room-hue-ludwig-hall",
      "door": [
        3,
        6
      ],
      "width_cells": 2,
      "target_door": [
        9,
        0
      ]
    }
  ],
  "household_meal": {
    "table": "T",
    "seats": [
      {
        "resident": "resident-ルードヴィヒ",
        "chair": "S"
      }
    ]
  },
  "door_leaves": [
    {
      "door": [
        3,
        6
      ],
      "hinge": "start",
      "frame_inset_m": 0.025,
      "thickness_m": 0.04,
      "fittings": {
        "handle_along_m": 0.8,
        "brace_projection_m": 0.015,
        "handle_projection_m": 0.025
      },
      "waits_for": [
        {
          "furniture": "V",
          "space_index": 0
        },
        {
          "furniture": "F",
          "space_index": 0
        }
      ]
    }
  ],
  "open_door_passages": {
    "scope": "fully_open_planar_passages",
    "status": "proposed",
    "body_radius_m": 0.4,
    "hub_m": [
      3.8,
      2
    ],
    "entries": [
      {
        "door": [
          3,
          6
        ],
        "points_m": [
          [
            2,
            3
          ],
          [
            2,
            2
          ],
          [
            3.8,
            2
          ]
        ]
      }
    ]
  },
  "dishwater_capture": {
    "scope": "one_day_dishwater_retention",
    "status": "proposed",
    "operator": "resident-ルードヴィヒ",
    "fresh_symbol": "V",
    "wash_symbol": "A",
    "dry_symbol": "R",
    "effluent_symbol": "X",
    "wash_ml": 3000,
    "daily_batches": 3,
    "initial_effluent_ml": 0,
    "basin": {
      "shape": "rectangular_cavity",
      "inner_mm": [
        360,
        180,
        360
      ],
      "wall_mm": 20,
      "bottom_mm": 20,
      "freeboard_mm": 40,
      "displacement_ml": 2000
    },
    "receiver": {
      "shape": "rectangular_cavity",
      "inner_mm": [
        360,
        300,
        360
      ],
      "wall_mm": 20,
      "bottom_mm": 20,
      "freeboard_mm": 40,
      "displacement_ml": 0
    },
    "method": "manual_transfer_after_washing",
    "disposal": "retention_only_no_discharge",
    "final_disposal": null,
    "pending": [
      "洗浄とすすぎを含む仮の水量。食器の個数と汚れ、方法・湯と洗剤・実際の衛生と乾燥は未照合",
      "V の食事と食器の名目上の残量は kitchen_water_cycle へ結ぶ。実在庫と P の供給、手洗い・洗濯・掃除と仕事中の需要は未設計",
      "洗い鉢と受槽・蓋・水切り棚の材質と製作、支持と荷重、実物の容器と持ち運ぶ身体・排水と掃除の全動作は未設計",
      "一日分だけを保管する案。搬出と最終処理先がなく、翌日以降も反復できる扱いにしない"
    ]
  },
  "kitchen_water_cycle": {
    "scope": "meal_and_dishwater_cycle",
    "status": "proposed",
    "operator": "resident-ルードヴィヒ",
    "fresh_symbol": "V",
    "source_district": "P",
    "source_operator": null,
    "vessel": {
      "shape": "rectangular_cavity",
      "inner_mm": [
        300,
        300,
        300
      ],
      "wall_mm": 20,
      "bottom_mm": 20,
      "freeboard_mm": 40,
      "displacement_ml": 0
    },
    "initial_ml": 5000,
    "events": [
      {
        "kind": "use",
        "at_min": 505,
        "volume_ml": 2000,
        "task_from_min": 505,
        "purpose": "meal_water"
      },
      {
        "kind": "use",
        "at_min": 545,
        "volume_ml": 3000,
        "task_from_min": 545,
        "purpose": "dishwashing"
      },
      {
        "kind": "receive",
        "at_min": 625,
        "volume_ml": 15000,
        "task_from_min": 615,
        "collection_from_min": 590
      },
      {
        "kind": "use",
        "at_min": 825,
        "volume_ml": 2000,
        "task_from_min": 825,
        "purpose": "meal_water"
      },
      {
        "kind": "use",
        "at_min": 860,
        "volume_ml": 3000,
        "task_from_min": 860,
        "purpose": "dishwashing"
      },
      {
        "kind": "use",
        "at_min": 1170,
        "volume_ml": 2000,
        "task_from_min": 1170,
        "purpose": "meal_water"
      },
      {
        "kind": "use",
        "at_min": 1230,
        "volume_ml": 3000,
        "task_from_min": 1230,
        "purpose": "dishwashing"
      }
    ],
    "pending": [
      "食事と食器だけの仮の量。飲用と調理の実際の必要量・方法と水質、身体と食器・汚れを未照合",
      "開始時の残量は案の前提であり、実在庫ではない。P の供給者と利用時刻・水量、容器と運ぶ身体・荷重・往復は未設計",
      "V の実物の材質・蓋と汲出し・支持と荷重、衛生と保温・凍結への備えは未設計",
      "便所の手洗い・洗濯・掃除と仕事中の水はこの容器の残量から借りず、別の需要と供給・保管を設計する",
      "飲用水の残量の条件だけを一巡させる。食器の排水の搬出先は未定で、家全体が翌日以降も反復できるとは扱わない"
    ]
  }
}
---
# ルードヴィヒの食事と休息の室の案

## 食事と休息の用途

[[resident-ルードヴィヒ]] が家で食べ、休むための室の案である。工房の作業台を食卓や寝台へ兼用しない。食卓と本人の椅子、調理と配膳・片付け、食料と飲用の容器、熱と灯りの置場を先に設計する。食卓 T と本人の椅子 S を平面へ割り当てる。household_meal は席の所有を示すものであり、調理・配膳と食べる身体を照合した意味ではない。

## 供給と家事

食料の受取の候補は都市の F、水の受取の候補は P とし、供給者と水源・量・容器と往復、調理の燃料と灰・汚水は未設計である。本人が仕事に出る時間の前後に調理と片付け・清掃を行えるようにし、区画があるだけで毎日の食事が出る扱いにしない。

## 部屋の配置

[[building-hue-ludwig]] と [[room-hue-ludwig-2]] へ結ぶ戸口と共通座標を平面の案で持つ。戸の実際の板と開閉、身体と各家具の立体は別に照合する。本文の図と同じ平面をグリッドへ持たせ、現在の自動間取りを代入しない。

## 平面と出入口の案

[[building-hue-ludwig]] の共通座標へ結び、入口と家具・使用面を先に確かめる。平面の到達性と幅の照合を、家具の立体や身体・扉の開閉と一日の成立の代わりにしない。

```grid
##############
#KKK.FF.ARCC.#
#....FF.....X#
#............#
#V.......TT..#
#.......STT..#
###DD#########
```


## 扉と作業の順序の案

戸は食事と調理の室へ開き、奥へ進む通路を開いた板が塞がない端へ蝶番を置く。飲用の水 V を扱う作業と炉 F の手入れ・調理の使用面が回転域へかかるため、先に作業を終えてから戸を動かす。食卓や椅子を廊下へ出して戸を避ける配置にはしない。 扉を持つ室の対応と、実際の身体・立体と日課の残件は [[building-hue-ludwig#戸口と扉を持つ室]] に従う。


## 開位置の通過点へ進む案

戸口から食事の室の奥へ進む。水の使用面は戸を閉じてから使う順序も引き続き設計する。 板と枠を残す平面通行の範囲、本人の身体と開閉の操作・使用面の残件は [[building-hue-ludwig#開いた扉を避ける通行の案]] に従う。


## 食器を洗い排水を保管する案

調理台 K と飲用水 V の場所とは別に、取り外せる洗い鉢 A と水切りの場所 R、食器の排水を受ける X を置く。洗った食器は R で水切りし、乾いてから清潔な食器の収納へ戻す。便所の排泄物や洗濯の水を、この食器用の容器へ混ぜない。食材を扱う台を汚れた食器の常設の置場にもしない。

dishwater_capture の daily_batches は一日に予約する片付けの回数であり、搬出を終えた回数や搬出までの間隔ではない。受ける容器が空の状態から、朝・昼・夕の片付けに使う水を一日分だけ仮に予約する。空であることは開始条件の案であり、実際の搬出と洗浄が済んだことの記録ではない。洗い鉢と受ける容器には内側と壁・底、液面の余地を持たせ、食器が入る体積を洗い鉢の作業容量から除く。洗い鉢を取り出して X へ移し、水切りの滴も含めて使った水の全量を保管する案である。配管や下水へ流れるものとして扱わない。

容器の名目上の容量と床の占有、水の予約を照合する。飲用水の実在庫と供給の量、食器の個数と洗い・すすぎの方法、湯と洗剤・乾燥、容器と支持・蓋の製作と持ち運ぶ身体、搬出と最終処理先は未設計である。仮の水量が衛生に十分だとは判定せず、保持した排水を消して翌日の反復を成立させない。


## 食事と食器に回す水の残量の案

朝食は朝の汲水より先なので、V の開始残量を前夜から持ち越す案にする。kitchen_water_cycle は食事に回す水と食器洗いだけを予約し、日課の調理と片付けの開始前にその分を取り置く。朝の汲水は P で受け取り、帰宅して容器へ移す作業を終えてから V の残量へ加える。同じ汲水を別の補給へ二度数えない。

初めの残量を含めて使用と補給を時刻順に追い、まだ届かない水を朝食へ借りず、途中で容器をあふれさせない。夜の片付け後に翌朝の開始残量を残し、翌朝に水が無条件で増える扱いを避ける。食器に使う分は dishwater_capture と同量にし、食事の水と食器の水へ同じ残量を重ねない。

これは食事と食器に回す仮の量と名目上の容器の検査である。水質と実際の需要、供給者と利用時刻・運ぶ容器と身体、V の材質と蓋・支持・汲出しと衛生・保温は未設計である。手洗い・洗濯・掃除と仕事中の水は別に設計し、この残量から見えない分を借りない。飲用水の残量が一巡しても排水の搬出は未成立であり、家全体の暮らしが反復できる証明にはしない。


## 搬出がない日の持越し

X に残る排水は翌日の初めにも残す。翌日の洗浄では前日の残量へ使用水を加え、受槽の作業容量を越える予約を拒む。開始残量を毎朝ゼロへ置き換えず、部屋が留守の時間にも減る扱いにしない。残量の計算は `world/town/get-dishwater-capture-budget.ts` を使う。

搬出先と受入れ量・担当、運ぶ容器と荷重・経路・所要時間、戻した容器の洗浄と保管が決まるまでは、この一日分の案を反復可能な暮らしと判定しない。残り容量があることは保管期間や衛生を認める根拠にも使わない。
