---
{
  "id": "facility-h4-garden",
  "kind": "facilities",
  "title": "ヘレナとリーゼルの家庭菜園",
  "status": "設計中",
  "source": "world/maps/layout.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "owner_building": "building-h4",
  "caretakers": [
    "resident-ヘレナ",
    "resident-リーゼル"
  ],
  "users": [
    "resident-ヘレナ",
    "resident-リーゼル"
  ],
  "ground_feature": {
    "kind": "garden",
    "index": 2,
    "source_rect_tiles": [
      13.2,
      36.2,
      16.2,
      38.4
    ]
  },
  "site": {
    "map": "map-phanthiet",
    "status": "proposed",
    "occupied_rect_tiles": [
      12.8,
      39.3,
      15.8,
      41.5
    ]
  },
  "purpose": "世帯で食べる野菜と香草を育てる小さな庭",
  "planting_plan": {
    "status": "proposed",
    "seed_source": "農家のカールとウルリケから分けてもらう案",
    "produce_destination": "自宅の台所。店の商品や町全体の食料の供給量には数えない"
  },
  "issues": [
    "土と畝・灰への覆い、道具・種と苗・収穫物の収納は未設計",
    "給水と排水、便所・処理区画からの地下水と雨水の流路は未照合",
    "柵と入口・作業する身体、日課・季節と収穫量、描画は未照合"
  ],
  "design_dependencies": [
    "building-h4",
    "map-phanthiet",
    "building-farmhouse"
  ]
}
---
# ヘレナとリーゼルの家庭菜園

## 持ち主と育てる目的

ヘレナ、リーゼルの世帯が自宅で食べる野菜と香草を育てる案とする。家に近い庭の手入れを世帯の日課として設計し、職業そのものを農家へ変更しない。種と苗はカールとウルリケから分けてもらう案を持つが、入手と手入れの日課・季節と収穫量はまだ実装していない。

## 元の庭と敷地案

`ground_feature` は `world/maps/layout.ts` の庭の配列の同じ対象を示す。庭を削って家を置いたことにせず、元の地上面積を保って家庭の庭として確保する。建物・道路・川・設備と経路の占有を平面で照合する。現行の地面と描画はこの案へまだ切り替えない。

## 生活設備と分けて照合すること

畝と作業面、柵・入口、灰への覆いと道具の保管、給水と排水はまだ設計していない。近くの便所や処理区画の流路も未照合であり、距離だけで衛生や栽培の成立を判断しない。排泄物や汚水を庭へ直接流すことを前提にしない。
