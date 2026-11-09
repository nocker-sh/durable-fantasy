# 濃いゼリー

[[monster-old-moss-slime]] が残す濃い粘液。[[resident-イルムガルト]] が買い取り、二色の薬草を水薬へまとめる材料にする。粘液だけを飲んで回復する品にはせず、職人の調合を経て森の水薬になる。

入手と買取は `apps/main/world/core/monsters.ts` と `shops.ts`、水薬の効用は `items/hunting-goods.ts`、調合と依頼は `recipes/hunting-recipes.ts` と `hunting-commissions.ts` に定義する。薬の共通待ち時間は [[game-system]] に従い、上位の狩りでも回復を無制限に重ねられない。
