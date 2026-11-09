---
{
  "id": "map-mountain-pass",
  "kind": "maps",
  "title": "峠道",
  "status": "現状整理",
  "source": "apps/main/world/maps/index.ts",
  "design_gate": "未通過",
  "town": null,
  "map_id": "mountain-pass",
  "map_kind": "field",
  "buildings": [],
  "residents": [],
  "monsters": [
    "monster-pass-strider"
  ],
  "exits": [
    {
      "at": [
        48,
        3
      ],
      "to": {
        "map": "quynhon-gate",
        "at": [
          48,
          88
        ]
      }
    },
    {
      "at": [
        93,
        60
      ],
      "to": {
        "map": "hue-gate",
        "at": [
          8,
          60
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了"
  ],
  "ecology_zones": [
    {
      "species": "monster-pass-strider",
      "feature": "荷車の道から離れた草地と、雪解け水の溜まる岩の窪み、昼に寝る岩棚",
      "placement": null
    }
  ],
  "design_dependencies": [
    "monster-pass-strider"
  ]
}
---

# 峠道

## 場所の役割

峠道は町の外の場所である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

建物の所属資料と照合し、管理する人とここへ来る目的を確定する。

## 生き物との関係

モンスターの出現は登録されていない。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。

## 山担ぎの草地

[[monster-pass-strider]] は荷車の道から離れた草地で芽と根を食べ、岩棚で昼に寝る。出現枠は道の西の草地に置き、峠を越える人の道と出口を塞がない。生息条件は ecology_zones に記録し、placement が null の間は地形への割り当てを済ませた扱いにしない。
