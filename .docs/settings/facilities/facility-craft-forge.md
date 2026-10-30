---
{
  "id": "facility-craft-forge",
  "kind": "facilities",
  "title": "職人通りの共同の炉",
  "status": "設計中",
  "source": "world/town/craft-yard.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "site": {
    "map": "map-phanthiet-craft",
    "status": "proposed"
  },
  "runtime_station": "craft-forge",
  "owner_building": "building-h-c2",
  "users": [
    "resident-ギュンター",
    "resident-ベアトリクス"
  ],
  "caretakers": [
    "resident-ギュンター"
  ],
  "purpose": "共同作業場の外で金属を加熱し鍛造する設備",
  "issues": [
    "現行の炉と周囲・燃料と灰・熱い物と冷却・水と消火の配置は未照合",
    "保守の担当量と順番待ち・使用料の受渡し、作業の温度と姿勢・立体は未照合"
  ],
  "design_dependencies": [
    "map-phanthiet-craft",
    "building-h-c2",
    "resident-ギュンター",
    "resident-ベアトリクス"
  ]
}
---
# 職人通りの共同の炉

## 用途と現行の位置

金属を扱う共同の炉である。炉と金床・薪の既存の配置は `world/town/craft-yard.ts` を参照し、加工設備の識別は `world/town/stations.ts` の craft-forge、加工は `world/core/craft-command.ts`、利用料は `world/core/crafting-rules.ts` を正とする。鍛冶屋と防具屋の台詞にある利用を維持し、保守をギュンターが担う案とする。屋内の調理かまどや調合面へ熱い金属を運ぶ案にしない。

## 敷地と工程

火床・金床・工具、熱い物を冷ます場所、冷めた品の受け、炭の保管と灰・消火と水、待つ人と搬入口を別に設計する。現行の外の炉がこれらを満たすとは判断しない。温度と操作、物を持つ姿勢と離隔、屋根と煙・風、利用の交代と手入れの負担は未照合である。

## 描画と加工判定の参照

炉の中心と加工判定のセルは同じ配置から求める。runtime_station は実在する加工設備と所属マップへ照合する。描かれた薪の山を炭の必要量や容器の証明にせず、炭の保管と工程は未解決として残す。

現行の火床・金床・薪それぞれの地面は、共通の配置と衝突寸法から敷地と経路の検査へ渡す。物の間の空き地を設備の占有にまとめない。通過できることと熱い物を持って作業できることは分け、工程の区画と離隔は未解決として残す。
