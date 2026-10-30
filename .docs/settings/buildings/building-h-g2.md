---
{
  "id": "building-h-g2",
  "kind": "buildings",
  "title": "クルトの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-gate",
  "household": "tinker",
  "residents": [
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
  "rooms": [
    "room-h-g2-repair",
    "room-h-g2-grinding",
    "room-h-g2-entry",
    "room-h-g2-1",
    "room-h-g2-2",
    "room-h-g2-lower-stairs",
    "room-h-g2-upper-stairs",
    "room-h-g2-3",
    "room-h-g2-4",
    "room-h-g2-upper-hall",
    "room-h-g2-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "鋳掛けの熱源と冷却・錫と道具、刃物と研ぎ水、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-g2-repair",
    "room-h-g2-grinding",
    "room-h-g2-entry",
    "room-h-g2-1",
    "room-h-g2-2",
    "room-h-g2-lower-stairs",
    "room-h-g2-upper-stairs",
    "room-h-g2-3",
    "room-h-g2-4",
    "room-h-g2-upper-hall",
    "room-h-g2-drying",
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ],
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
  },
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 27,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-g2-repair",
          "room-h-g2-grinding",
          "room-h-g2-entry",
          "room-h-g2-1",
          "room-h-g2-2",
          "room-h-g2-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-g2-upper-stairs",
          "room-h-g2-3",
          "room-h-g2-4",
          "room-h-g2-upper-hall",
          "room-h-g2-drying"
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
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 4.72,
    "ridge_underside_m": 6.5,
    "overhang_m": 0.3,
    "material": "roof"
  },
  "stair_sections": [
    {
      "lower_room": "room-h-g2-lower-stairs",
      "upper_room": "room-h-g2-upper-stairs",
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
    "resident-クルト",
    "resident-ザビーネ",
    "resident-ヨハン",
    "resident-リナ"
  ]
}
---
# クルトの家

## 世帯と仕事

クルトが鍋と釜を鋳掛けし、ザビーネが刃物を研ぎ、双子のヨハンとリナが暮らす。錫はラインホルトから受け取る既存の設定を維持する。

## 二つの仕事と家庭

[[room-h-g2-repair]] は加熱と鍋の支持・熱い品の冷却・錫と工具・燃料・冷めた品を分ける。[[room-h-g2-grinding]] は砥石と支持台・仕事の水・預かった刃物と返す品を分ける。材料と冷めた品だけを [[room-h-g2-entry]] から運び、熱い物や露出した刃物を家族の通り道へ出さない。

[[room-h-g2-1]] と [[room-h-g2-2]] は別々の家庭の区画として持ち、配膳する直通の戸でつなぐ。家庭の食器と預かった鍋・刃物の洗いを共用しない。[[room-h-g2-lower-stairs]] と [[room-h-g2-upper-stairs]]、[[room-h-g2-upper-hall]] は [[room-h-g2-3]] と [[room-h-g2-4]] へつなぎ、四人の寝台と衣服箱のIDを維持する。[[room-h-g2-drying]] は家庭の衣服と寝具に使う。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。鋳掛けの熱源と温度・錫と鍋の材質・冷却、研ぐ姿勢と刃物・水と研ぎくず、燃料と煙・換気と消火・仕事の洗いと廃物、依頼人と取引先への受渡しと搬送、敷地と道・隣家・地形と構造、家庭の暖房と戸・便所と給排水・衣服と寝具、子どもの見守りと勤務・食事と休息、立体を詰めてから描画へ渡す。現行の道具箱と砥石、独立した台所の未対応の記録は維持する。
