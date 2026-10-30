---
{
  "id": "building-h7",
  "kind": "buildings",
  "title": "マティアスの小屋",
  "status": "設計中",
  "source": "world/town/houses.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map": "map-phanthiet",
  "household": "shepherd",
  "residents": [
    "resident-マティアス"
  ],
  "rooms": [
    "room-h7-1",
    "room-h7-2"
  ],
  "role": "home",
  "issues": [
    "屋根・窓・煙突と外観の立体照合未完了",
    "羊毛と乳を扱う場所・保管と物流は未確定",
    "給排水・便所・灰・燃料と仕事着の位置は未確定"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "room-h7-1",
    "room-h7-2",
    "facility-square-well",
    "facility-h7-garden",
    "facility-h7-wool-preparation"
  ],
  "layout": {
    "cell_m": 0.5,
    "width": 10,
    "depth": 15,
    "floors": [
      {
        "floor": 0,
        "rooms": [
          "room-h7-1",
          "room-h7-2"
        ]
      }
    ]
  },
  "facilities": [
    "facility-square-well",
    "facility-h7-garden",
    "facility-h7-wool-preparation"
  ],
  "site_plan": {
    "origin": [
      3,
      28.8
    ],
    "rotation_quarters": 2,
    "status": "proposed",
    "unresolved": [
      "屋根・窓・煙突と隣地の立体照合",
      "羊毛・乳の仕事場、薪・灰・便所と汚水の場所"
    ],
    "approaches": [
      {
        "room": "room-h7-1",
        "door": [
          5,
          8
        ],
        "width_m": 1,
        "points_tiles": [
          [
            4.428571428571429,
            28.8
          ],
          [
            4.428571428571429,
            24.8
          ]
        ]
      }
    ]
  }
}
---

# マティアスの小屋

## 使い手と役割

羊飼いのマティアスが一人で住む。羊の毛と乳とチーズ。毛は仕立て屋とベルタへ、チーズはパン屋と酒場へ。

## 部屋の構成

1階の[[room-h7-1]]を持つ。1階の[[room-h7-2]]を持つ。

## 生活と仕事の設計条件

暖を取る炉が必要である。薪の搬入、乾燥保管、煙突への排煙、灰の取り出しを同じ炉の配置で成立させる。調理する場所を持つ。飲用水、食材、配膳、洗い物、残り物と汚水の扱いを部屋の間でつなぐ。

仕事場を持たない場合も、日常の掃除・衣服の手入れ・修理道具を置く場所を決める。

## 現状との差分

現行の家具候補は羊毛の袋、杖掛け、食卓、寝台、椅子×1。これは配置の正しさを示すものではない。各部屋のグリッドで、家具の実寸、使用面、扉の開閉、階段と通路を検証する。便所・排水・換気の配置は本資料ではまだ確定していない。

## 家と仕事の区別

一階二室を壁込み五メートル×七・五メートルで組む平面案とする。室内図を半回転して入口を北の通りへ向ける。寝台・個人収納と食事を家で成立させ、羊毛・乳とチーズの仕事を家庭の食卓や寝台へ重ねない。仕事場と家のあいだの品物・道具・汚れ物の搬出入は別に設計する。屋外窓・煙突と屋根を確定するまでは現行の描画を切り替えない。


## 羊毛の手入れ場の未配置の案

[[facility-h7-wool-preparation]] の設備は敷地をまだ割り当てていない案であり、現行の町や家庭の室内へ採用していない。処理用水と汚水の一時保管、羊の世話と家の仕事・受渡しを、敷地と身体・時間へ続けて照合する。
