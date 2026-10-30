---
{
  "id": "building-h-g4",
  "kind": "buildings",
  "title": "ファルクの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "hunter",
  "residents": [
    "resident-ファルク",
    "resident-ブリギッテ",
    "resident-ロルフ"
  ],
  "rooms": [
    "room-h-g4-2",
    "room-h-g4-entry",
    "room-h-g4-processing",
    "room-h-g4-lower-stairs",
    "room-h-g4-upper-stairs",
    "room-h-g4-3",
    "room-h-g4-4",
    "room-h-g4-upper-hall",
    "room-h-g4-1",
    "room-h-g4-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "獲物と皮・脂・食肉の受入条件と衛生、燻製と冷却・搬送、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-g4-2",
    "room-h-g4-entry",
    "room-h-g4-processing",
    "room-h-g4-lower-stairs",
    "room-h-g4-upper-stairs",
    "room-h-g4-3",
    "room-h-g4-4",
    "room-h-g4-upper-hall",
    "room-h-g4-1",
    "room-h-g4-drying",
    "resident-ファルク",
    "resident-ブリギッテ"
  ],
  "workers": [
    "resident-ファルク",
    "resident-ブリギッテ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-g4-2",
          "room-h-g4-entry",
          "room-h-g4-processing",
          "room-h-g4-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-g4-upper-stairs",
          "room-h-g4-3",
          "room-h-g4-4",
          "room-h-g4-upper-hall",
          "room-h-g4-1",
          "room-h-g4-drying"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.32
    },
    {
      "floor": 1,
      "elevation_m": 2.52,
      "ceiling_elevation_m": 4.72
    }
  ],
  "stair_sections": [
    {
      "lower_room": "room-h-g4-lower-stairs",
      "upper_room": "room-h-g4-upper-stairs",
      "furniture": "S",
      "risers": 14,
      "going_m": 0.28,
      "axis": "y",
      "landing_depth_m": 1,
      "clear_width_m": 0.9,
      "lower_end": "end",
      "opening_length_m": 3.64,
      "rail_inset_m": 0.05
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "runtime_layout_omissions": {
    "source": "world/town/floorplan/floor-plan.ts",
    "rooms": [
      {
        "floor": 0,
        "name": "燻し部屋"
      }
    ]
  }
}
---
# ファルクの家

## 世帯と仕事

ファルクが森で猟をし、ブリギッテが肉を燻し、息子のロルフが暮らす。皮はルドルフへ、脂はろうそく屋へ、燻した肉は宿と酒場へ渡す既存の設定を維持する。

## 獲物と食肉、家族の動線

[[room-h-g4-processing]] で獲物を受け取り、皮と脂の受け、使用後の道具と廃物を分ける。[[room-h-g4-2]] は生肉の受け・仕事の洗い物・燻しの設備と薪・冷却と冷めた品の保護・包みを別々の場所にする。二室にはそれぞれ屋外の専用の入口を持たせる。生肉と冷ました燻製の容器・置台を同じものへ読み替えない。

[[room-h-g4-entry]] から [[room-h-g4-lower-stairs]] と [[room-h-g4-upper-stairs]]、[[room-h-g4-upper-hall]] へ行く。[[room-h-g4-3]] は両親、[[room-h-g4-4]] はロルフの寝室として、既存の寝台と個人収納のIDを維持する。[[room-h-g4-1]] は上階へ移す家庭の台所と三人の食事、[[room-h-g4-drying]] は衣服と寝具の手入れに分ける。家族が燻し部屋と獲物の台を日常の通路として使う前提にしない。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。獲物の種類と寸法・重量・受入状態、刃物と皮・脂と食肉の処理の順と洗い、燻しの方式と温度・時間・冷却と保存条件・衛生、煙と換気・火と構造・汚水と廃物、取引先への運搬、敷地と道・隣家・地形、便所と家庭の給排水・衣服と寝具・三人の勤務と休息、立体を詰めてから描画へ渡す。

## 現行の内装との差分

元の部屋の定義には燻し部屋があるが、現行の自動間取りの部屋一覧には存在しない。新しい平面はこの欠落を引き継がず独立した仕事部屋を持つ。資料の作成を現行の描画の修正済みとは扱わない。
