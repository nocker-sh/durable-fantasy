---
{
  "id": "building-h-c3",
  "kind": "buildings",
  "title": "エマの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "baskets",
  "residents": [
    "resident-エマ",
    "resident-ニクラス",
    "resident-フリーダ",
    "resident-ローゼマリー"
  ],
  "rooms": [
    "room-h-c3-work",
    "room-h-c3-2",
    "room-h-c3-entry",
    "room-h-c3-1",
    "room-h-c3-lower-stairs",
    "room-h-c3-upper-stairs",
    "room-h-c3-3",
    "room-h-c3-niklas",
    "room-h-c3-frieda",
    "room-h-c3-upper-hall",
    "room-h-c3-drying"
  ],
  "role": "home",
  "issues": [
    "敷地と道路・隣家・地形、戸・窓・梁は未照合",
    "柳の保管と湿し・編む身体と出荷、家庭の給排水と便所・火と灰、日課と立体・描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-c3-work",
    "room-h-c3-2",
    "room-h-c3-entry",
    "room-h-c3-1",
    "room-h-c3-lower-stairs",
    "room-h-c3-upper-stairs",
    "room-h-c3-3",
    "room-h-c3-niklas",
    "room-h-c3-frieda",
    "room-h-c3-upper-hall",
    "room-h-c3-drying",
    "resident-エマ",
    "resident-ローゼマリー",
    "resident-フリーダ"
  ],
  "runtime_graphics_omissions": {
    "source": "world/town/interiors.ts",
    "pieces": []
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
      "lower_room": "room-h-c3-lower-stairs",
      "upper_room": "room-h-c3-upper-stairs",
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
    "resident-エマ",
    "resident-ローゼマリー",
    "resident-フリーダ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-c3-work",
          "room-h-c3-2",
          "room-h-c3-entry",
          "room-h-c3-1",
          "room-h-c3-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-c3-upper-stairs",
          "room-h-c3-3",
          "room-h-c3-niklas",
          "room-h-c3-frieda",
          "room-h-c3-upper-hall",
          "room-h-c3-drying"
        ]
      }
    ]
  }
}
---
# エマの家

## 同居人と仕事

エマとローゼマリーが籠と笊を編み、柳は川べりから受け取る。ニクラスは木工所で働き、子どものフリーダが暮らす。四人の寝台と個人収納のIDを維持し、ローゼマリーは地上階の寝室、ほかの三人は上階の個室へ分ける。

## 柳と籠、地上階の暮らし

[[room-h-c3-work]] に乾いた柳と湿らせる受け、二人の編む椅子、完成品と編みかけ・道具と端材を分ける。二人の作業の使用面とその間を通る床を照合する。[[room-h-c3-entry]] は [[room-h-c3-2]] と [[room-h-c3-1]] につながり、ローゼマリーの寝床・食事・籠編みを地上階でつなぐ。家庭の食卓と仕事の材料は混ぜない。

[[room-h-c3-lower-stairs]] と [[room-h-c3-upper-stairs]] から [[room-h-c3-upper-hall]] へ行き、[[room-h-c3-3]]・[[room-h-c3-niklas]]・[[room-h-c3-frieda]] に別々に入る。[[room-h-c3-drying]] は四人の家庭の衣服と寝具の手入れに使う。ニクラスの勤務先の木工所との参照と仕事は維持する。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。川べりからの柳の量と寸法・受取りと搬送、湿しと乾燥・水と汚水・端材、座って編む姿勢と手を動かす幅・完成品の容量、敷地と道・隣家・地形・構造、便所と家庭の給排水・火と灰、ローゼマリーの生活と手入れの負担・四人の衣服と寝具・勤務と休息、立体を詰めてから描画へ渡す。現行の柳の束と編みかけの籠の未描画の記録は維持する。
