---
{
  "id": "facility-bakery-oven",
  "kind": "facilities",
  "title": "パン屋の屋外窯",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "site": {
    "map": "map-phanthiet",
    "place": "oven",
    "occupied_rect_tiles": [
      11.6,
      20.6,
      13.6,
      22.6
    ],
    "geometry_source": "world/scene/construction/town.ts と workshops.ts の窯・周辺の通行を塞ぐ範囲"
  },
  "users": [
    "resident-マルタ",
    "resident-ハンス"
  ],
  "purpose": "家庭の炉と分けてパンを焼く仕事の設備",
  "issues": [
    "設備と待機・運搬場所の敷地グリッド未設計",
    "管理する住民と維持の日課の照合未完了"
  ],
  "design_dependencies": [
    "map-phanthiet",
    "resident-マルタ",
    "resident-ハンス",
    "facility-square-windmill"
  ]
}
---

# パン屋の屋外窯

## 用途と使い手

[[building-bakery]] の仕事に属する。台所で生地を整え、覆いをして窯へ運び、焼いたパンを冷ましてから売り場へ戻す。生地・熱い天板・薪・冷ましたパンが同時に同じ狭い戸を通る設計にはしない。

薪は乾いた置き場から運ぶ。火を入れる場所と人が立つ面を区別し、灰の容器を食品の冷却台の下へ置かない。冷却する場所も灰を避ける覆いを必要とする。煙突と煙の向き、火口の前、材料搬入、灰出し、隣家の窓との離隔は敷地全体のグリッドで確定する。

## 建物と接続路の照合

現行の窯本体とその占有を occupied_rect_tiles に記録する。パン屋の新しい戸口からの接続路は窯の東側を通り、幅を持つ経路として窯の占有と重ならないことを確認する。火口の作業面、薪と灰を運ぶときの離隔や屋根・煙突の条件は、この占有の検査に含まれない。
