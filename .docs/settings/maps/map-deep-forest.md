---
{
  "id": "map-deep-forest",
  "kind": "maps",
  "title": "樹海の奥",
  "status": "設計中",
  "source": "world/maps/index.ts",
  "design_gate": "未通過",
  "town": null,
  "map_id": "deep-forest",
  "map_kind": "field",
  "buildings": [],
  "residents": [],
  "monsters": [
    "monster-moss-slime",
    "monster-blue-slime"
  ],
  "exits": [
    {
      "at": [
        93,
        60
      ],
      "to": {
        "map": "quynhon-gate",
        "at": [
          8,
          60
        ]
      }
    },
    {
      "at": [
        48,
        93
      ],
      "to": {
        "map": "forest-edge",
        "at": [
          48,
          8
        ]
      }
    }
  ],
  "issues": [
    "生活・物流の経路と出入口のグリッド照合未完了",
    "描画と通行判定の一致確認未完了",
    "生息種ごとの餌・水・休息地と、人の作業面・退避経路の配置未確定"
  ],
  "ecology_zones": [
    {
      "species": "monster-moss-slime",
      "feature": "苔と落ち葉のある根の間",
      "placement": null
    },
    {
      "species": "monster-blue-slime",
      "feature": "木陰の湿ったくぼみ",
      "placement": null
    }
  ],
  "design_dependencies": [
    "monster-moss-slime",
    "monster-blue-slime"
  ]
}
---

# 樹海の奥

## 場所の役割

樹海の奥は町の外の場所である。周囲とのつながりはメタデータの exits を持つ。出入口は通行のための場所であり、別の目的地への経路の途中で意図せず踏ませない。

## 使う人と物の流れ

建物の所属資料と照合し、管理する人とここへ来る目的を確定する。

## 生き物との関係

現在の生息種は[[monster-moss-slime]]、[[monster-blue-slime]]。人の通る道、採集する場所、生き物の居場所を同じ配置図で確認する。

## 配置の設計条件

入口、主な通路、作業と休憩の場所を先に配列で定義する。建物の外周と扉、荷の大きさ、人がすれ違う幅を合わせ、装飾を置いてから通路を残す順序にしない。灰・雨・煙・火・水の行き先を決める。現行の通行格子は現状の記録であり、生活の成立を承認した配置図ではない。

## きのこ採りと湿った根元の利用を分ける

宿へ持ち帰るきのこの出どころである。採る人が立つ場所と籠を置く乾いた場所を持たせ、スライムの湿った休息地とは分ける。苔スライムは採集する場所へ入ったときに出会うのであり、通り道全体を大きな体で塞ぐために置かない。大戦の跡と朽木・根の形は、通路・水の溜まり・休息場所の理由になるように配置する。

生息条件は ecology_zones に記録する。placement が null の条件はまだ地形に割り当てていない。出現矩形があることだけで、その条件を満たした配置としない。
