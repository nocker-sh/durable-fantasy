---
{
  "id": "building-general",
  "kind": "buildings",
  "title": "ブルーノの道具屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "general",
  "residents": [
    "resident-ブルーノ"
  ],
  "rooms": [
    "room-general-1",
    "room-general-2",
    "room-general-lower-stairs",
    "room-general-upper-stairs",
    "room-general-3",
    "room-general-household"
  ],
  "role": "shop",
  "issues": [
    "平面案と敷地・道と隣家・地形、戸・窓・梁は未照合",
    "商品の保管と搬送、家庭の給排水と便所・火と灰、衣服と寝具・日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-general-1",
    "room-general-2",
    "room-general-3",
    "room-general-lower-stairs",
    "room-general-upper-stairs",
    "room-general-household",
    "resident-ブルーノ"
  ],
  "workers": [
    "resident-ブルーノ"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 22,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-general-1",
          "room-general-2",
          "room-general-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-general-upper-stairs",
          "room-general-3",
          "room-general-household"
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
      "lower_room": "room-general-lower-stairs",
      "upper_room": "room-general-upper-stairs",
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
# ブルーノの道具屋

## 使い手と役割

道具屋のブルーノの建物である。同居人はブルーノ。道具と雑貨の店。

## 部屋の構成

地上階の [[room-general-1]] と [[room-general-2]]、[[room-general-lower-stairs]] を持つ。上階の [[room-general-upper-stairs]] から [[room-general-3]] と [[room-general-household]] へ別々に入る。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は商品棚、カウンター、縄の束、卓、寝台、椅子×1。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 店と一人の生活の平面

商品棚と受渡し、補充する在庫と空箱・返された品を分け、本人の衣服と食材は上階に置く。客が私室を通り抜けないよう、物置と階段・寝室と家庭の区画をブルーノの許可する範囲へ持つ。寝台と衣服箱のID・寸法は維持し、家庭に食事の席を一つ割り当てる。

この外形を現行の敷地へそのまま置けるとは判断しない。商品の量と重さ・搬入、戸と段差、道と隣家・地形、給排水と便所・火と灰、仕事と休息と寝具の手入れを詰めてから描画へ渡す。
