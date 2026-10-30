---
{
  "id": "facility-pottery-kiln",
  "kind": "facilities",
  "title": "ハインリヒの裏の陶器窯",
  "status": "設計中",
  "source": "world/town/houses/craft.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "site": {
    "map": "map-phanthiet-craft",
    "status": "proposed"
  },
  "owner_building": "building-h-c1",
  "users": [
    "resident-ハインリヒ",
    "resident-テレーゼ"
  ],
  "caretakers": [
    "resident-ハインリヒ"
  ],
  "purpose": "家の裏で器を焼き、冷めてから工房へ戻す仕事の窯",
  "issues": [
    "敷地と窯体・煙突・火口・薪と灰・冷却と待機場所は未設計",
    "焼成と冷却の条件・容量と操作、工房と夜市への運搬は未照合"
  ],
  "design_dependencies": [
    "map-phanthiet-craft",
    "building-h-c1",
    "room-h-c1-1",
    "resident-ハインリヒ",
    "resident-テレーゼ"
  ]
}
---
# ハインリヒの裏の陶器窯

## 用途と使い手

[[building-h-c1]] の裏で器を焼く。ハインリヒとテレーゼが使い、ハインリヒが窯を手入れする案とする。家の家庭の炉や鍛造の火床を陶器窯の代用にしない。窯の形と位置、温度と焼成時間は未確定であり、現在の地図へ設備を追加しない。

## 工程と敷地の条件

成形と乾燥・絵付けした器を [[room-h-c1-1]] から運び、窯へ収めてから火を入れる。乾燥の終わりと窯詰めの順、窯を開けられる温度と器の冷却時間を確かめてから工房へ戻す。熱い窯から器を取り出して夜市の籠へ直接詰めない。

窯体と煙突、火口の操作、薪の乾燥保管、灰出しと冷めた灰の受け、火を待つ場所と器の冷却場所を区別する。隣家の窓・家の木部と道、人が立つ場所と荷を運ぶ幅を敷地の配列で決める。窯の方式と材料・容量、灰と煙・換気、道と地形・工房との戸口と往復は未設計であり、位置だけを仮定した占有矩形で完成としない。
