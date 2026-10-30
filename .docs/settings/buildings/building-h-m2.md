---
{
  "id": "building-h-m2",
  "kind": "buildings",
  "title": "アガーテのろうそく屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "candle",
  "residents": [
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "rooms": [
    "room-h-m2-1",
    "room-h-m2-entry",
    "room-h-m2-oil-store",
    "room-h-m2-lower-stairs",
    "room-h-m2-upper-stairs",
    "room-h-m2-3",
    "room-h-m2-4",
    "room-h-m2-upper-hall",
    "room-h-m2-2",
    "room-h-m2-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "蝋と灯り油の工程・火と温度・換気、家庭の給排水と便所・日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-m2-1",
    "room-h-m2-entry",
    "room-h-m2-oil-store",
    "room-h-m2-lower-stairs",
    "room-h-m2-upper-stairs",
    "room-h-m2-3",
    "room-h-m2-4",
    "room-h-m2-upper-hall",
    "room-h-m2-2",
    "room-h-m2-drying",
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
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
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-m2-lower-stairs",
      "upper_room": "room-h-m2-upper-stairs",
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
    "resident-アガーテ",
    "resident-ジーモン",
    "resident-フェリックス"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-m2-1",
          "room-h-m2-entry",
          "room-h-m2-oil-store",
          "room-h-m2-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-m2-upper-stairs",
          "room-h-m2-3",
          "room-h-m2-4",
          "room-h-m2-upper-hall",
          "room-h-m2-2",
          "room-h-m2-drying"
        ]
      }
    ]
  },
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
  },
  "runtime_layout_omissions": {
    "source": "world/town/floorplan/floor-plan.ts",
    "rooms": [
      {
        "floor": 0,
        "name": "台所"
      }
    ]
  }
}
---
# アガーテのろうそく屋

## 世帯と仕事

アガーテがろうそくを作り、ジーモンが灯り油を売り歩き、子どものフェリックスが暮らす。獣脂はファルクとブリギッテ、蜜蝋はウルリケの巣箱から受け取る既存の設定を維持する。

## 熱い蝋と灯り油、家族の動線

[[room-h-m2-1]] に蝋の加熱・成形と冷却・完成品・材料と薪・仕事の洗い台を分ける。[[room-h-m2-oil-store]] は灯り油の保管と売り歩く分・戻った容器を別室へ収める。加熱の熱源を金属の鍛造炉と同じ用途へ扱わず、家庭の炉とも共用しない。部屋を分けたことを火と油の隔離・保管条件の証明にはしない。

[[room-h-m2-entry]] を家族の入口とし、[[room-h-m2-lower-stairs]] と [[room-h-m2-upper-stairs]] から [[room-h-m2-upper-hall]] へ行く。[[room-h-m2-3]] は両親の寝室、[[room-h-m2-4]] は子どもの寝室、[[room-h-m2-2]] は家庭の台所と三人の食事、[[room-h-m2-drying]] は衣服と寝具の手入れへ分ける。台所と子どもの寝床を現行の地上階から上階へ移す案であり、熱い蝋の部屋を家族の日常の通路にしない。既存の寝台と個人収納のIDを維持する。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。敷地と道・隣家・地形、加熱方式と温度管理・蝋と油の量・容器と保管・熱い物の動線・消火と漏れの受け、材料の仕入れと売り歩き、火と構造・煙と換気、給排水と便所・衣服と寝具・家族の勤務と食事と休息、立体を詰めてから描画へ渡す。
