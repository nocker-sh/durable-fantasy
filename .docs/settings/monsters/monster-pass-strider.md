---
{
  "id": "monster-pass-strider",
  "kind": "monsters",
  "title": "山担ぎ",
  "status": "設計中",
  "source": "apps/main/world/core/monsters.ts",
  "design_gate": "未通過",
  "species": "pass-strider",
  "habitats": [
    "map-mountain-pass"
  ],
  "appearance": {
    "look": "model",
    "color": null,
    "size": null,
    "shape_source": "apps/main/world/core/bestiary/pass-strider.ts",
    "footprint_source": "apps/main/world/core/get-monster-body-radius.ts",
    "movement_clearance": "walk_grid_adopted"
  },
  "issues": [
    "生息地の水・餌・休息地と出現範囲のグリッド照合未完了",
    "行動と荷車の道・人の仕事の干渉確認未完了",
    "休息・採食・警戒・退避の描画と実装は未照合"
  ],
  "ecology": {
    "diet": "峠の上の草地の木の芽と、太い爪で掘り返す根",
    "water": "岩の窪みに溜まる雪解け水",
    "rest": "日の高いうちは道から離れた岩棚で寝る",
    "social": "一頭ずつ草地を分けて使う。出現枠を全個体数とは扱わない",
    "human_contact": "荷車の音に慣れていて、近づきすぎなければ顔も上げない。峠を越える人の道は塞がない",
    "reaction": "叩かれるとその場で向き直り、爪と体当たりで押し返す。離れた相手は追わない"
  },
  "materials": [
    {
      "item": "raw-hide",
      "origin": "冬の前に生え替わって岩棚に落ちる厚い皮",
      "users": [
        "resident-ルドルフ"
      ],
      "use": "革工房でなめして革の装備にする。加工先はレシピの定義に従う"
    },
    {
      "item": "old-bone",
      "origin": "背の荷枠から欠け落ちた古い骨",
      "users": [
        "resident-ラインホルト"
      ],
      "use": "買取屋が引き取る。加工の使い道は未設計"
    },
    {
      "item": "sharp-fang",
      "origin": "根を掘るときに欠けた爪の先",
      "users": [
        "resident-ルドルフ"
      ],
      "use": "仕立て仕事でお守りに加工する"
    }
  ],
  "population": {
    "unit": "出現枠は野外で出会う代表個体。地域の全個体数ではない",
    "return": "再出現の秒数はゲームの復帰規則であり、繁殖や成長の所要時間ではない",
    "unresolved": "繁殖・季節変化・個体の入れ替わりの表現は未設計"
  },
  "design_dependencies": [
    "map-mountain-pass",
    "resident-ルドルフ",
    "resident-ラインホルト"
  ]
}
---

# 山担ぎ

## 由来

大戦で荷と兵を担いで山を越えるために作られた獣の子孫である。背の荷枠は骨と一緒に育ち、今は何も載せていない。生き物の形と調整は `apps/main/world/core/bestiary/pass-strider.ts` にある。

## 食べ物と水と休息

峠の上の草地で木の芽を食べ、太い爪で根を掘り返す。水は岩の窪みに溜まる雪解け水を飲む。日の高いうちは道から離れた岩棚で寝る。生息地は [[map-mountain-pass]] に置く。

## 人との接点

荷車の音に慣れていて、近づきすぎなければ顔も上げない。出現枠は荷車の道（峠道の西）から離した草地に置き、峠を越える人の通り道と出口を塞がない。反撃と離脱は [[game-system#8. 戦闘]] に従う。

## 材料と加工

生え替わった皮は [[resident-ルドルフ]] がなめし、欠けた爪の先はお守りになる。荷枠の古い骨は [[resident-ラインホルト]] が引き取るが、加工の使い道は決まっていない。

## 配置と未照合

出現矩形は `apps/main/world/core/monsters.ts` に置く。草地・水場・岩棚の実地形への割当てと、荷車の道との照合は残り、出現枠を置いたことを生息地の設計完了とは扱わない。
