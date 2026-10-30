---
{
  "id": "building-coop",
  "kind": "buildings",
  "title": "鶏小屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "farm",
  "residents": [],
  "rooms": [
    "room-coop-1"
  ],
  "role": "farm",
  "issues": [
    "平面案と敷地・屋外の囲いと鶏の出入口、家と納屋・道と地形は未照合",
    "止まり木と巣箱の容量、餌と水・敷料と糞・卵と衛生、寒さと換気・灰・日課と描画は未照合"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-coop-1",
    "building-farmhouse",
    "resident-ウルリケ"
  ],
  "workers": [
    "resident-ウルリケ"
  ],
  "home_building": "building-farmhouse",
  "layout": {
    "cell_m": 0.5,
    "width": 14,
    "depth": 14,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-coop-1"
        ]
      }
    ]
  },
  "floor_levels": [
    {
      "floor": 0,
      "elevation_m": 0,
      "ceiling_elevation_m": 2.5
    }
  ],
  "roof_section": {
    "ridge_axis": "y",
    "eave_underside_m": 2.5,
    "ridge_underside_m": 3.8,
    "overhang_m": 0.3,
    "material": "thatch"
  }
}
---
# 鶏小屋

## 使い手と役割

農家の世帯が使う仕事の建物であり、六人の寝床と家庭の食事は [[building-farmhouse]] に置く。ここを住まいとして数えない。

## 部屋の構成

1階の[[room-coop-1]]を持つ。

## 生活と仕事の設計条件

火を使う設備は現行定義にない。暖房が必要な利用者と滞在時間を確認し、理由なく炉を追加しない。食事をどこで用意するかを、この建物だけで完結させず利用者の住まいと照合する。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は止まり木、巣箱。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。


## 鶏と世話する人の平面案

[[room-coop-1]] に止まり木と産卵用の巣箱、餌と飲み水、乾いた敷料と使用済みの受け、卵を籠へ移す台を分ける。ウルリケの世話の場所として持ち、人の寝台・台所や理由のない火の設備は加えない。

現行の小さい外形へこの平面が収まるとは判断しない。鶏の収容と個体ごとの帰路、屋外の囲いと出入口、飼料と水・敷料と糞の回収、寒さと灰を避ける換気、家と納屋・畑と道、地形と一日の世話を詰めてから描画へ渡す。
