---
{
  "id": "map-phanthiet-in-warehouse",
  "kind": "maps",
  "title": "ファンティエット ― 町の倉庫",
  "status": "現状整理",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet-in-warehouse",
  "map_kind": "indoor",
  "buildings": [],
  "residents": [
    "resident-ヒルデ",
    "resident-ゲオルク"
  ],
  "monsters": [],
  "exits": [
    {
      "at": [
        48,
        55
      ],
      "to": {
        "map": "phanthiet-gate",
        "at": [
          61,
          30
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "building-warehouse"
  ]
}
---

# ファンティエット ― 町の倉庫

## 場所の役割

ファンティエット ― 町の倉庫は建物の内部である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

建物の所属資料と照合し、管理する人とここへ来る目的を確定する。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。
