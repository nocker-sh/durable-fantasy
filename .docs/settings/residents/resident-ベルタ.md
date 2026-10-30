---
{
  "id": "resident-ベルタ",
  "kind": "residents",
  "title": "ベルタ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "carter",
  "buildings": [
    "building-h2"
  ],
  "bedroom_candidates": [
    "room-h2-2"
  ],
  "work": "機織り",
  "relationships": [
    {
      "a": "ルカス",
      "b": "ベルタ",
      "kind": "夫婦",
      "note": "外を回る夫を、ベルタは機を織りながら待つ"
    },
    {
      "a": "ベルタ",
      "b": "エミール",
      "kind": "親子",
      "note": "機の下で眠ってしまう子"
    }
  ],
  "issues": [
    "寝台と衣服箱の容量・可動域・日課と作業の干渉の照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h2-2",
  "bed_id": "bed-h2-2-2",
  "design_dependencies": [
    "building-h2",
    "room-h2-2",
    "room-h-c2-weaving",
    "room-h1-3",
    "resident-ヴィルヘルム",
    "resident-マグダレーナ",
    "room-h1-4",
    "resident-ゾフィー",
    "room-h2-1"
  ],
  "storage_ids": [
    "storage-h2-2-2"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "ベルタ"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "ベルタ"
  },
  "textile_orders": [
    {
      "id": "storage-h1-3-1:blanket-cloth:weave",
      "room": "room-h1-3",
      "cloth": "storage-h1-3-1:blanket-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "stage": "weave",
      "recipient": "resident-マグダレーナ",
      "status": "proposed",
      "pending": [
        "糸の必要量・織機と作業時間、原布の厚みと受渡し"
      ]
    },
    {
      "id": "storage-h1-4-1:blanket-cloth:weave",
      "room": "room-h1-4",
      "cloth": "storage-h1-4-1:blanket-cloth",
      "beneficiary": "resident-ゾフィー",
      "stage": "weave",
      "recipient": "resident-マグダレーナ",
      "status": "proposed",
      "pending": [
        "糸の必要量・織機と作業時間、原布の厚みと受渡し"
      ]
    },
    {
      "id": "bed-h1-3-1:pillow:cover-cloth:weave",
      "room": "room-h1-3",
      "cloth": "bed-h1-3-1:pillow:cover-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "recipient": "resident-マグダレーナ",
      "stage": "weave",
      "status": "proposed",
      "pending": [
        "側布用の糸の必要量と織機の幅、布の厚み・縮みと製作時間・受渡し"
      ]
    },
    {
      "id": "bed-h1-4-1:pillow:cover-cloth:weave",
      "room": "room-h1-4",
      "cloth": "bed-h1-4-1:pillow:cover-cloth",
      "beneficiary": "resident-ゾフィー",
      "recipient": "resident-マグダレーナ",
      "stage": "weave",
      "status": "proposed",
      "pending": [
        "側布用の糸の必要量と織機の幅、布の厚み・縮みと製作時間・受渡し"
      ]
    },
    {
      "id": "storage-h1-3-1:blanket-cloth:spin",
      "room": "room-h1-3",
      "cloth": "storage-h1-3-1:blanket-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "recipient": "resident-ベルタ",
      "stage": "spin",
      "status": "proposed",
      "workplace": {
        "room": "room-h-c2-weaving",
        "furniture": "S"
      },
      "pending": [
        "原毛の洗浄・乾燥と繊維を整える担当・場所、糸へ回す重量と歩留り",
        "糸車の実寸と身体、作業中の材料・糸の区分と持ち帰り",
        "共用設備の利用時間と交代、自宅の織機・家族と夜市の仕事に接続する日課"
      ]
    },
    {
      "id": "storage-h1-4-1:blanket-cloth:spin",
      "room": "room-h1-4",
      "cloth": "storage-h1-4-1:blanket-cloth",
      "beneficiary": "resident-ゾフィー",
      "recipient": "resident-ベルタ",
      "stage": "spin",
      "status": "proposed",
      "workplace": {
        "room": "room-h-c2-weaving",
        "furniture": "S"
      },
      "pending": [
        "原毛の洗浄・乾燥と繊維を整える担当・場所、糸へ回す重量と歩留り",
        "糸車の実寸と身体、作業中の材料・糸の区分と持ち帰り",
        "共用設備の利用時間と交代、自宅の織機・家族と夜市の仕事に接続する日課"
      ]
    },
    {
      "id": "bed-h1-3-1:pillow:cover-cloth:spin",
      "room": "room-h1-3",
      "cloth": "bed-h1-3-1:pillow:cover-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "recipient": "resident-ベルタ",
      "stage": "spin",
      "status": "proposed",
      "workplace": {
        "room": "room-h-c2-weaving",
        "furniture": "S"
      },
      "pending": [
        "原毛の洗浄・乾燥と繊維を整える担当・場所、糸へ回す重量と歩留り",
        "糸車の実寸と身体、作業中の材料・糸の区分と持ち帰り",
        "共用設備の利用時間と交代、自宅の織機・家族と夜市の仕事に接続する日課"
      ]
    },
    {
      "id": "bed-h1-4-1:pillow:cover-cloth:spin",
      "room": "room-h1-4",
      "cloth": "bed-h1-4-1:pillow:cover-cloth",
      "beneficiary": "resident-ゾフィー",
      "recipient": "resident-ベルタ",
      "stage": "spin",
      "status": "proposed",
      "workplace": {
        "room": "room-h-c2-weaving",
        "furniture": "S"
      },
      "pending": [
        "原毛の洗浄・乾燥と繊維を整える担当・場所、糸へ回す重量と歩留り",
        "糸車の実寸と身体、作業中の材料・糸の区分と持ち帰り",
        "共用設備の利用時間と交代、自宅の織機・家族と夜市の仕事に接続する日課"
      ]
    }
  ]
}
---

# ベルタ

## 暮らしの立場

ベルタは機織り。ルカスとベルタに属し、ルカス、エミールという世帯構成で暮らす。仕事と収入のつながりは荷運びと機織り。

## 人柄と話し方

性格は器用、倹約家、夫思い。話し方は「わたし。上品な女言葉」。口癖は「繕えばまだ使えるわ」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h2-2]] の bed-h2-2-2 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 家の平面との対応

食事と帰宅時の支度は[[room-h2-1]]、本人の寝台と個人の衣服箱は[[room-h2-2]]の平面案へ結ぶ。家族の機織りと就寝の同時利用、荷を持った移動、外の仕事と食事・水汲みを含む日課の照合は残る。

## 二人の寝台へ供給する案

[[room-h1-3#寝台の骨組みとマットレス]] と [[room-h1-4#寝台の骨組みとマットレス]] で、二人のマットレスと枕の側布、掛布の織手として結ぶ。詰物の羊毛と側布を同じ物として数えず、マグダレーナが仕立てる布の供給へつなぐ。紡ぎの担当と場所は [[resident-ベルタ#寝具用の糸を紡ぐ工程]] に分け、原料の洗浄・乾燥と糸・布にする量、工程・納品の成立は未設計を保つ。

textile_orders では二人それぞれの原布を織り、マグダレーナへ渡す工程として結ぶ。裁断の寸法は受取人の部屋を参照し、糸の原料量、織機で扱える幅と製作時間、作業面と受渡しはまだ照合していない。 割当先と受取人、案の状態の規則は [[town#寝具の原布と工程の受渡し]] に従う。掛布の裁断面は [[room-h1-3#使用中と替えの掛布を裁つ布]] と [[room-h1-4#使用中と替えの掛布を裁つ布]] にある。枕の交換用の側布は別の原布として [[room-h1-3#枕の側布を交換する裁断案]] と [[room-h1-4#枕の側布を交換する裁断案]] に結ぶ。掛布の割当があることだけで側布も供給した扱いにせず、内袋と詰物の量・受渡しは別に未設計を保つ。


## 寝具用の糸を紡ぐ工程

二人の掛布と枕の側布の原布へ回す糸は、ベルタが紡ぐ案とする。textile_orders の spin は原毛の割当とは別の工程であり、本人が紡いだ糸を自分の織る工程へ回す。recipient が本人でも、紡ぎを省いた外部からの納品や、布の完成を意味しない。

糸車の案は [[room-h-c2-weaving]] の S の使用面を使い、織機そのものを糸車として数えない。設備の手入れは引き続きマグダレーナ、原料と仕掛品・糸は本人の割当として分ける。共同設備の利用時間と材料の仮置き、交代と清掃、家との往復と家族・夜市の仕事に接続する日課は未照合である。現行の日課が共同作業場へ紡ぎに通う実装になったとはしない。

原毛を洗い屋根内で乾かす担当と区画の案は [[facility-h7-wool-preparation]] に分ける。敷地と実際の方法、繊維を整える専用の台の実寸と道具・姿勢、詰物へ回す量との区分、重量・歩留りと紡ぎの時間、指と足・回転部の動作、糸の巻取りと織機への移替えは続けて設計する。糸のゲーム内の製作規則は `world/core/recipes/tailoring.ts` を参照し、そこにある個数を原料の重量や作業時間へ換算しない。


## 仕事と家族の睡眠

家族が起きている間の機織りと、夜市後の古着の繕いを分ける。後者は [[room-h2-1#就寝中の家族と夜の繕い]] の食卓で行い、[[room-h2-2]] の寝台の脇で機を動かさない。静かな手仕事へ分けたことだけで、機織り・紡ぎ・夜市の仕入れを含む注文の生産量と労働の余裕が成立したとは数えない。時刻の正は `world/town/routines.ts` であり、資料へ別の時間割を作らない。


## 夜市からの付き添い

[[resident-エミール#夜市から寝床へ帰る]] の帰宅と寝支度を担当し、子どもが家へ帰った後も売場に残る予定にしない。寝かしつけの後に食卓の繕いへ移る。売場の荷物の片付けと運搬、移動時間と寝支度の具体的な動作は未照合を保つ。
