---
{
  "id": "building-tailor",
  "kind": "buildings",
  "title": "マグダレーナの仕立て屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "tailor",
  "residents": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "rooms": [
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-lower-stairs",
    "room-tailor-upper-stairs",
    "room-tailor-3",
    "room-tailor-4",
    "room-tailor-upper-hall",
    "room-tailor-household",
    "room-tailor-5"
  ],
  "role": "shop",
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "布と毛の容量・運搬、裁断と縫製・採寸の操作と視線、家庭の給排水と便所・火と灰、日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-lower-stairs",
    "room-tailor-upper-stairs",
    "room-tailor-3",
    "room-tailor-4",
    "room-tailor-upper-hall",
    "room-tailor-household",
    "room-tailor-5",
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "workers": [
    "resident-マグダレーナ",
    "resident-ロッテ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-tailor-1",
          "room-tailor-2",
          "room-tailor-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-tailor-upper-stairs",
          "room-tailor-3",
          "room-tailor-4",
          "room-tailor-upper-hall",
          "room-tailor-household",
          "room-tailor-5"
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
      "lower_room": "room-tailor-lower-stairs",
      "upper_room": "room-tailor-upper-stairs",
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
  }
}
---
# マグダレーナの仕立て屋

## 世帯と仕事

マグダレーナと住み込みのお針子ロッテが暮らし、服と首巻きを仕立てる。毛は羊飼いから受け取る。仕事の関係を家族へ置き換えず、二人の寝室と個人収納を分ける。

## 客と布の流れ、住まい

[[room-tailor-1]] は完成した品と注文の受渡し、採寸のための姿見と帳面を持つ。[[room-tailor-2]] は毛と糸・道具、糸車と機織り機、裁断と縫いの台、縫いかけの衣服を持つ。原毛から布にする工程と清潔さ・作業量は未照合であり、設備を並べるだけで布を作れるとしない。

[[room-tailor-lower-stairs]] と [[room-tailor-upper-stairs]] は [[room-tailor-upper-hall]] へつながる。[[room-tailor-3]] と [[room-tailor-4]] はそれぞれの個室として既存の寝台と個人収納のIDを維持する。[[room-tailor-household]] に二人の食事と家庭の調理・洗い物を持ち、[[room-tailor-5]] は仕事の布と毛を収める倉とする。

## 描画へ渡す条件

現行の敷地へこの外形を置けるとは判断しない。道と隣家・地形、毛と布の量・湿気と灰・虫害、糸車と機織り機の姿勢と操作・布を広げる寸法、採寸の身体と視線・着替え、取引先との搬送と階段の荷、換気と火・給排水と便所、衣服と寝具の手入れ・二人の勤務と休息、立体を詰めてから描画へ渡す。
