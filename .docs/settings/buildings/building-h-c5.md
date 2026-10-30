---
{
  "id": "building-h-c5",
  "kind": "buildings",
  "title": "ベルンハルトの家",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-craft",
  "household": "sweep",
  "residents": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "rooms": [
    "room-h-c5-2",
    "room-h-c5-entry",
    "room-h-c5-processing",
    "room-h-c5-lower-stairs",
    "room-h-c5-upper-stairs",
    "room-h-c5-3",
    "room-h-c5-upper-hall",
    "room-h-c5-1",
    "room-h-c5-drying",
    "room-h-c5-monica",
    "room-h-c5-tobias"
  ],
  "role": "home",
  "issues": [
    "敷地と道・隣家・地形、戸と窓・梁は未照合",
    "灰と煤の受入条件・冷却と密閉・粉塵と運搬、家庭の給排水と便所・日課と立体は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-c5-2",
    "room-h-c5-entry",
    "room-h-c5-processing",
    "room-h-c5-lower-stairs",
    "room-h-c5-upper-stairs",
    "room-h-c5-3",
    "room-h-c5-upper-hall",
    "room-h-c5-1",
    "room-h-c5-drying",
    "resident-ベルンハルト",
    "resident-モニカ",
    "room-h-c5-monica",
    "room-h-c5-tobias",
    "resident-トビアス"
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
        "name": "灰の袋置き場"
      }
    ]
  },
  "workers": [
    "resident-ベルンハルト",
    "resident-モニカ",
    "resident-トビアス"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 26,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-c5-2",
          "room-h-c5-entry",
          "room-h-c5-processing",
          "room-h-c5-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-h-c5-upper-stairs",
          "room-h-c5-3",
          "room-h-c5-upper-hall",
          "room-h-c5-1",
          "room-h-c5-drying",
          "room-h-c5-monica",
          "room-h-c5-tobias"
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
      "lower_room": "room-h-c5-lower-stairs",
      "upper_room": "room-h-c5-upper-stairs",
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
# ベルンハルトの家

## 同居人と仕事

ベルンハルトが煙突を掃除し、モニカが集めた灰を陶工と畑へ売り、住み込みの子どもの弟子トビアスが暮らす。三人にそれぞれの個室を持たせ、同居の関係を決めつけて相部屋へ置き換えない。灰の受入れと出荷はモニカ、掃除道具と仕事着はベルンハルトの担当とし、弟子は道具の軽い手入れの部屋へつなぐ。現場と屋根での作業や荷の重さを、その部屋の担当だけで成立したとはしない。

## 灰と煤、家庭の境目

[[room-h-c5-2]] は冷めた灰の受取り・分別と出荷、空の袋と容器・量と袋の確認・仕事の洗い物と帳面を持つ。[[room-h-c5-processing]] は刷毛と継ぎ竿・屋根の道具と縄・仕事着・使用後を分ける。熱い灰を家へ持ち込む前提にせず、冷却確認と一時保管は敷地側で別に設計する。粉塵と煤を家庭の食材や寝具へ混ぜない。

[[room-h-c5-entry]] から [[room-h-c5-lower-stairs]] と [[room-h-c5-upper-stairs]]、[[room-h-c5-upper-hall]] を通り、[[room-h-c5-3]]・[[room-h-c5-monica]]・[[room-h-c5-tobias]] へ別々に入る。既存の三人の寝台と衣服箱のIDを維持して個室へ分ける。[[room-h-c5-1]] は上階へ移す家庭の台所と三人の食事、[[room-h-c5-drying]] は家庭の衣服と寝具の手入れとする。弟子の個室には寝具と衣服の世話をする同居人が入れる。

## 描画へ渡す条件

この外形を現行の敷地へ置けるとは判断しない。灰の由来と用途別の受入条件・温度の確認と冷却・密閉と粉塵・袋と荷重・運搬、煤の付いた仕事着と洗い物・汚水と廃物、屋根と煙突の作業と道具の手入れ・弟子の負担と休息、敷地と道・隣家・地形・構造、便所と家庭の給排水・寝具と衣服、立体を詰めてから描画へ渡す。現行の灰の袋と独立した置き場の未対応の記録は維持し、資料を作ったことを内装の修正済みとしない。
