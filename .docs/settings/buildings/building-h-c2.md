---
{
  "id": "building-h-c2",
  "kind": "buildings",
  "title": "共同の作業場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": null,
  "residents": [],
  "rooms": [
    "room-h-c2-1",
    "room-h-c2-weaving",
    "room-h-c2-entry",
    "room-h-c2-mixing",
    "room-h-c2-2",
    "room-h-c2-lower-stairs",
    "room-h-c2-upper-stairs"
  ],
  "role": "public",
  "issues": [
    "敷地と道・地形・構造と戸・窓は未照合",
    "共用設備の管理と利用の交代・手入れ、給排水と便所・火と煙・材料と廃物、日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "facility-craft-forge",
    "room-h-c2-1",
    "room-h-c2-weaving",
    "room-h-c2-entry",
    "room-h-c2-mixing",
    "room-h-c2-2",
    "room-h-c2-lower-stairs",
    "room-h-c2-upper-stairs",
    "resident-ゴットフリート",
    "resident-マグダレーナ",
    "resident-イルムガルト"
  ],
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
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof2"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-c2-lower-stairs",
      "upper_room": "room-h-c2-upper-stairs",
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
  "workers": [
    "resident-ゴットフリート",
    "resident-マグダレーナ",
    "resident-イルムガルト"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-c2-1",
          "room-h-c2-weaving",
          "room-h-c2-entry",
          "room-h-c2-mixing",
          "room-h-c2-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-c2-2",
          "room-h-c2-upper-stairs"
        ]
      }
    ]
  },
  "facilities": [
    "facility-craft-forge"
  ]
}
---
# 共同の作業場

## 仕事と共同利用

木工・機織りと糸紡ぎ・かまどと調合を別の作業室へ分ける。利用者は住人にせず、材料を持ち込んで共用設備を借りる。使用料は `world/core/crafting-rules.ts`、加工の規則は `world/core/craft-command.ts` を正とする。ゴットフリートが木工と軽い工具の保守、マグダレーナが繊維の設備、イルムガルトがかまどと調合面の保守を担う案とする。現在の各人の勤務と往復を変えず、負担と交代は未照合とする。

## 火と材料を混ぜない

[[facility-craft-forge]] は外の共同の炉であり、屋内の調理かまどの代用にしない。木屑と繊維を熱い金属の工程へ混ぜない。屋根裏は乾いた軽い工具の保管に限り、長材と燃料・大量の原料を持ち上げる前提にしない。

## 採用前の条件

現行より広い外形は未採用である。敷地・道と隣家・外の炉、構造と搬入口、各作業の姿勢と衛生、利用の順番と料金の受渡し・清掃と修繕、便所と給排水・煙と廃物、担当者の勤務と往復、立体を照合する。
