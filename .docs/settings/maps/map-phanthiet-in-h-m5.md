---
{
  "id": "map-phanthiet-in-h-m5",
  "kind": "maps",
  "title": "ファンティエット ― 町の寄り合い所",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "map_id": "phanthiet-in-h-m5",
  "map_kind": "indoor",
  "buildings": [],
  "residents": [],
  "monsters": [],
  "exits": [
    {
      "at": [
        51,
        62
      ],
      "to": {
        "map": "phanthiet-market",
        "at": [
          85,
          53
        ]
      }
    },
    {
      "at": [
        37,
        49
      ],
      "to": {
        "map": "phanthiet-in-h-m5-floor-2",
        "at": [
          39,
          36
        ]
      }
    }
  ],
  "issues": [
    "敷地から道への接続と移動の実画面、灯りと梁・火気と給排水の照合は継続中"
  ],
  "design_dependencies": [
    "town-phanthiet",
    "building-h-m5"
  ]
}
---

# ファンティエット ― 町の寄り合い所

## 場所の役割

ファンティエット ― 町の寄り合い所は建物の内部である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

建物の所属資料と照合し、管理する人とここへ来る目的を確定する。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。
