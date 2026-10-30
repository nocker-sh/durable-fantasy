---
{
  "id": "facility-h8-nonfood-plot",
  "kind": "facilities",
  "title": "オットーとクララの家の非食用植栽区画",
  "status": "設計中",
  "source": ".docs/settings/buildings/building-h8.md",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "owner_building": "building-h8",
  "caretakers": [
    "resident-オットー",
    "resident-クララ"
  ],
  "users": [
    "resident-オットー",
    "resident-クララ",
    "resident-ヨナス"
  ],
  "sanitation_role": "nonfood_planting",
  "site": {
    "map": "map-phanthiet",
    "status": "proposed",
    "occupied_rect_tiles": [
      12.9,
      43.8,
      16.1,
      47.2
    ]
  },
  "accepts_streams": [
    "treated_residue",
    "treated_water"
  ],
  "material_routes": [],
  "issues": [
    "地下水・地形・雨水と洪水・井戸との流路は未照合",
    "容器の容量と重さ・冬の処理条件・手入れの日課と搬送の実装は未完了"
  ],
  "design_dependencies": [
    "building-h8",
    "map-phanthiet"
  ]
}
---
# オットーとクララの家の非食用植栽区画

## 植栽と使う物

オットーとクララが管理する非食用の植栽区画とし、果物・野菜・飼料の栽培場所や子どもの遊び場にしない。[[facility-h8-treatment]]で処理の完了を確認できた残さと処理水だけを別々の専用容器で受ける。生の排泄物、家庭の汚水、未処理の灰をここへ捨てない。

## 場所を確定する条件

井戸への流路や地下水の涵養域と重ならないこと、雨で道や隣地へ流れ出ないことを地形の設計で確認してから場所を確定する。植える物、受け入れる量と季節、手入れと余剰の扱いは未設計であり、この案だけで処理の循環が完成したとはしない。
