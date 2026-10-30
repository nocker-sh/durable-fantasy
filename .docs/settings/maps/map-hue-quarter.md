---
{
  "id": "map-hue-quarter",
  "kind": "maps",
  "title": "フエの生活と工房の区画案",
  "status": "設計中",
  "source": ".docs/settings/towns/town-hue.md",
  "design_gate": "未通過",
  "town": "town-hue",
  "implementation": "未実装の設計案",
  "map_id": "hue-quarter",
  "map_kind": "town",
  "buildings": [
    "building-hue-ludwig"
  ],
  "residents": [
    "resident-ルードヴィヒ"
  ],
  "monsters": [],
  "exits": [],
  "issues": [
    "門前との接続と地形・敷地・道の実寸は未設計",
    "工房と住まい・供給と廃棄物の実際の量と経路は未設計"
  ],
  "design_dependencies": [
    "town-hue",
    "map-hue-gate",
    "building-hue-ludwig",
    "resident-ルードヴィヒ"
  ]
}
---
# フエの生活と工房の区画案

## 区画案と現行の門

[[town-hue#未配置の区画案]] を個別のマップの設計へ進めるための資料である。実行時の MAPS にはまだ存在せず、[[map-hue-gate]] から入れる場所として扱わない。exits は未設計のまま空にし、開いている門やワープを捏造しない。

## 住まいと工房

[[resident-ルードヴィヒ]] の住まいの案を [[building-hue-ludwig]] へ結ぶ。住宅の候補は都市の H、仕事をする工房の候補は W であり、まだ敷地と室の割当にはしていない。工房の道具・機関の持ち主と修繕の受渡し、食料・水・燃料と灰・汚水の経路を続けて設計する。

## 描画へ渡す前の条件

門前へ結ぶ原点と向き、地形と路面、敷地と建物の全階、担当者の身体と日課を整合させてから描画と通行へ渡す。都市の区画案を、そのまま実行時のマップの占有へ変換しない。
