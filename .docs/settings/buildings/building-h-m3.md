---
{
  "id": "building-h-m3",
  "kind": "buildings",
  "title": "フランツの醸造所",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet-market",
  "household": "tavern",
  "residents": [],
  "rooms": [
    "room-h-m3-1",
    "room-h-m3-2"
  ],
  "role": "workshop",
  "issues": [
    "地上階へ貯蔵庫を移す平面案と現行の外形・敷地、道と隣家・地形は未照合",
    "水と排水・搾りかす、保管と衛生・容量と操作、原料と酒樽の運搬・日課は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h-m3-1",
    "room-h-m3-2",
    "building-tavern",
    "resident-フランツ",
    "resident-マックス"
  ],
  "workers": [
    "resident-フランツ",
    "resident-マックス"
  ],
  "home_building": "building-tavern",
  "layout": {
    "cell_m": 0.5,
    "width": 26,
    "depth": 16,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h-m3-1",
          "room-h-m3-2"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 3.2
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 3.2,
    "ridge_underside_m": 5.1,
    "overhang_m": 0.3,
    "material": "roof"
  }
}
---
# フランツの醸造所

## 使い手と役割

フランツが所有してマックスと醸造の仕事をする。リリーの給仕の仕事場と三人の寝床・食事は [[building-tavern]] に置き、醸造所を第二の住まいへ数えない。

## 部屋の構成

提案では地上階の [[room-h-m3-1]] と [[room-h-m3-2]] を戸でつなぎ、それぞれ屋外の入口を持つ。現行の二階の貯蔵庫とは異なり、階段で酒樽を搬入する構成にはしない。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。食事をどこで用意するかを、この建物だけで完結させず利用者の住まいと照合する。

仕事の設備は「搾り台と樽」。材料、仕掛品、完成品、道具の収納と手入れ場所を区別する。

## 現状との差分

現行の家具候補は搾り台、仕込み樽、樽。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 原料と製品の平面案

仕込み場は原料の受取り・洗い場・搾り台・仕込み樽・清潔な布と栓の棚を分け、貯蔵庫は熟成中・酒場へ出す樽・清潔な空樽・戻った空樽と手入れ台を分ける。重い籠と樽の置台は地上階へ登録する。外の戸へは階段と私室を通らず届くが、荷そのものの大きさ・重さと操作の証明ではない。

この外形を現行の商店通りへそのまま置けるとは判断しない。水と原料の供給、搾りかすと汚水の行き先、保管と食品の衛生、搬送・火気と灰・一日の作業量、敷地と屋根・梁と換気を詰めてから描画へ渡す。
