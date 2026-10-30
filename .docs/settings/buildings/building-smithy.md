---
{
  "id": "building-smithy",
  "kind": "buildings",
  "title": "ギュンターの鍛冶場",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "smith",
  "residents": [
    "resident-ギュンター",
    "resident-ペーター"
  ],
  "rooms": [
    "room-smithy-1",
    "room-smithy-household",
    "room-smithy-lower-stairs",
    "room-smithy-upper-stairs",
    "room-smithy-2",
    "room-smithy-peter"
  ],
  "role": "workshop",
  "issues": [
    "火床・熱い加工品と家庭、火花・炭・煙と灰、換気と防火の立体は未照合",
    "敷地と道・隣家・地形、給排水と便所、道具の操作と材料の搬送、日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-smithy-1",
    "room-smithy-2",
    "room-smithy-household",
    "room-smithy-lower-stairs",
    "room-smithy-upper-stairs",
    "room-smithy-peter",
    "resident-ギュンター",
    "resident-ペーター"
  ],
  "workers": [
    "resident-ギュンター",
    "resident-ペーター"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 18,
    "depth": 22,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-smithy-1",
          "room-smithy-household",
          "room-smithy-lower-stairs"
        ]
      },
      {
        "floor": 1,
        "rooms": [
          "room-smithy-upper-stairs",
          "room-smithy-2",
          "room-smithy-peter"
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
      "lower_room": "room-smithy-lower-stairs",
      "upper_room": "room-smithy-upper-stairs",
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
# ギュンターの鍛冶場

## 使い手と役割

鍛冶屋のギュンターと見習いの建物である。同居人はギュンター、ペーター。鍛冶。炭は木こりのヨーゼフが焼き、鉄はラインホルトが買い取る古い鉄くずと鍋から。大物を打つときだけ職人通りの共同の炉を借りる。

## 部屋の構成

提案では地上階の [[room-smithy-1]] と [[room-smithy-household]] を分け、[[room-smithy-lower-stairs]]・[[room-smithy-upper-stairs]] から上階の [[room-smithy-2]] と [[room-smithy-peter]] へ別々に入る。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事の設備は「炉と金床」。材料、仕掛品、完成品、道具の収納と手入れ場所を区別する。

## 現状との差分

現行の家具候補は炉（外）、金床（外）、道具棚、寝台×2、食卓、椅子×2。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 火床・家庭と二人の個室

鍛冶場の火床と金床、冷却と冷めた品・炭・加工用水を分け、客の受渡しを東側へ寄せる。家庭の区画は調理と食事・仕事靴と上着の受けを持ち、二人の寝台と衣服箱は上階の個室へ分ける。師匠と住み込みの見習いの関係を、相手の寝室の通り抜けの前提にしない。

この外形を現行の敷地に置けるとは判断しない。火床と木の構造・火花と煙、熱い金属と冷ます操作、家の音と換気、材料と共同の炉へ運ぶ仕事、道と隣家・地形を詰めてから描画へ渡す。
