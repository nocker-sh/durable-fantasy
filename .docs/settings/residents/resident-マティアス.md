---
{
  "id": "resident-マティアス",
  "kind": "residents",
  "title": "マティアス",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "shepherd",
  "buildings": [
    "building-h7"
  ],
  "bedroom_candidates": [
    "room-h7-2"
  ],
  "work": "羊飼い",
  "relationships": [
    {
      "a": "マティアス",
      "b": "マグダレーナ",
      "kind": "取引相手",
      "note": "羊の毛を仕立て屋へ。マティアスは彼女の前だと口ごもる"
    }
  ],
  "issues": [
    "寝台と衣服箱の可動域・容量・日課との照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-h7-2",
  "bed_id": "bed-h7-2-1",
  "design_dependencies": [
    "building-h7",
    "room-h7-2",
    "facility-h7-garden",
    "room-h1-3",
    "resident-ヴィルヘルム",
    "resident-ベルタ",
    "room-h1-4",
    "resident-ゾフィー",
    "facility-h7-wool-preparation"
  ],
  "storage_ids": [
    "storage-h7-2-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "マティアス"
  },
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "マティアス"
  },
  "textile_orders": [
    {
      "id": "storage-h1-3-1:blanket-cloth:wool",
      "room": "room-h1-3",
      "cloth": "storage-h1-3-1:blanket-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "stage": "wool",
      "recipient": "resident-ベルタ",
      "status": "proposed",
      "pending": [
        "原料の重量と洗浄・乾燥、紡ぎと受渡し"
      ],
      "raw_lot": "wool-pool-matthias-bed-linen",
      "supply_state": "clean_dry_prepared_wool"
    },
    {
      "id": "storage-h1-4-1:blanket-cloth:wool",
      "room": "room-h1-4",
      "cloth": "storage-h1-4-1:blanket-cloth",
      "beneficiary": "resident-ゾフィー",
      "stage": "wool",
      "recipient": "resident-ベルタ",
      "status": "proposed",
      "pending": [
        "原料の重量と洗浄・乾燥、紡ぎと受渡し"
      ],
      "raw_lot": "wool-pool-matthias-bed-linen",
      "supply_state": "clean_dry_prepared_wool"
    },
    {
      "id": "bed-h1-3-1:pillow:cover-cloth:wool",
      "room": "room-h1-3",
      "cloth": "bed-h1-3-1:pillow:cover-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "recipient": "resident-ベルタ",
      "stage": "wool",
      "status": "proposed",
      "pending": [
        "側布用の羊毛の洗浄・乾燥と紡ぎ、必要重量・歩留りと受渡し"
      ],
      "raw_lot": "wool-pool-matthias-bed-linen",
      "supply_state": "clean_dry_prepared_wool"
    },
    {
      "id": "bed-h1-4-1:pillow:cover-cloth:wool",
      "room": "room-h1-4",
      "cloth": "bed-h1-4-1:pillow:cover-cloth",
      "beneficiary": "resident-ゾフィー",
      "recipient": "resident-ベルタ",
      "stage": "wool",
      "status": "proposed",
      "pending": [
        "側布用の羊毛の洗浄・乾燥と紡ぎ、必要重量・歩留りと受渡し"
      ],
      "raw_lot": "wool-pool-matthias-bed-linen",
      "supply_state": "clean_dry_prepared_wool"
    }
  ],
  "textile_wool_lots": [
    {
      "id": "wool-pool-matthias-bed-linen",
      "scope": "proposed_dry_unwashed_fleece_pool",
      "status": "proposed",
      "dry_mass_g": 12000,
      "allocations": [
        {
          "room": "room-h1-3",
          "cloth": "storage-h1-3-1:blanket-cloth"
        },
        {
          "room": "room-h1-3",
          "cloth": "bed-h1-3-1:pillow:cover-cloth"
        },
        {
          "room": "room-h1-4",
          "cloth": "storage-h1-4-1:blanket-cloth"
        },
        {
          "room": "room-h1-4",
          "cloth": "bed-h1-4-1:pillow:cover-cloth"
        }
      ],
      "pending": [
        "羊の頭数・毛刈りと季節、乾いた原毛の実在量と水分・汚れの測り方",
        "本人の世帯・売り物と詰物の需要を含む原料全体の在庫と補給",
        "洗浄・乾燥と繊維を整える担当・場所、廃物・水と保管・運搬",
        "各人への支払い・受渡しと製作量・日課"
      ],
      "preparation_facility": "facility-h7-wool-preparation"
    }
  ]
}
---

# マティアス

## 暮らしの立場

マティアスは羊飼い。羊飼いのマティアスに属し、同居人なしという世帯構成で暮らす。仕事と収入のつながりは羊の毛と乳とチーズ。毛は仕立て屋とベルタへ、チーズはパン屋と酒場へ。

## 人柄と話し方

性格はおっとり、羊思い、照れ屋。話し方は「ぼく。丁寧語。羊の話になると饒舌」。口癖は「この子たちは」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-h7-2]] の bed-h7-2-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 家と羊の仕事

常用寝台と乾いた衣服は[[room-h7-2]]、本人の調理と食事は[[room-h7-1]]へ割り当てる。羊毛の在庫や乳を扱う場所は寝台と食卓を兼用せず、羊のいる仕事場側の設計を進める。水汲み、仕事着の手入れ、手洗いと就寝への移動はまだ日課へ照合していない。

## 二人の寝台へ供給する案

[[room-h1-3#寝台の骨組みとマットレス]] と [[room-h1-4#寝台の骨組みとマットレス]] で、二人のマットレスと枕の詰物・側布、掛布に使う羊毛の供給元として結ぶ。本人の世帯の衣服や仕立て屋へ渡す白い毛と、同じ羊毛を重複して割り当てない。洗浄・乾燥と繊維を整える担当・場所、詰物へ回す量と糸へ回す量、織手と仕立て手への実際の受渡しは未設計である。

textile_orders では二人の原布へ回す羊毛を、本人からベルタへ渡す工程として結ぶ。羊毛そのものを完成した原布と数えず、紡ぎの担当と場所は [[resident-ベルタ#寝具用の糸を紡ぐ工程]] に分け、原料の洗浄・乾燥と繊維を整える担当・場所の案は [[facility-h7-wool-preparation]] に分け、実物の方法・身体と重量・歩留りはまだ照合していない。 割当先と受取人、案の状態の規則は [[town#寝具の原布と工程の受渡し]] に従う。掛布の裁断面は [[room-h1-3#使用中と替えの掛布を裁つ布]] と [[room-h1-4#使用中と替えの掛布を裁つ布]] にある。枕の交換用の側布は別の原布として [[room-h1-3#枕の側布を交換する裁断案]] と [[room-h1-4#枕の側布を交換する裁断案]] に結ぶ。掛布の割当があることだけで側布も供給した扱いにせず、内袋と詰物の量・受渡しは別に未設計を保つ。


## 寝具へ回す原毛の有限の予算案

textile_wool_lots は未洗浄の乾いた原毛を想定した有限の予算案であり、実在庫や羊から実際に得た生産量ではない。allocations は [[room-h1-3#寝具の原布へ割り当てる原料の予算案]] と [[room-h1-4#寝具の原布へ割り当てる原料の予算案]] の原布の固有 ID を指す。各原布の重さは受取人の裁断面と仮の目付・歩留りから求め、供給者の配列へ同じ重量を写さない。

全ての割当を合算して予算を超える案を拒み、残る予算を本人の世帯や別の注文へ自動で割り当てない。原料の実在量と季節・羊の飼育、他の需要と詰物の羊毛、測る時の水分・汚れ、処理と保管・受渡し・支払いの日課は未設計を保つ。共通の収支は [[town#寝具の原料予算と工程の収支]] に従う。


## 羊毛の手入れ場の未配置の案

[[facility-h7-wool-preparation]] の設備は敷地をまだ割り当てていない案であり、現行の町や家庭の室内へ採用していない。処理用水と汚水の一時保管、羊の世話と家の仕事・受渡しを、敷地と身体・時間へ続けて照合する。
