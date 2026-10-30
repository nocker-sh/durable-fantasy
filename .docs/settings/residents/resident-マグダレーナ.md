---
{
  "id": "resident-マグダレーナ",
  "kind": "residents",
  "title": "マグダレーナ",
  "status": "設計中",
  "source": "world/town/residents.ts",
  "design_gate": "未通過",
  "town": "town-phanthiet",
  "household": "tailor",
  "buildings": [
    "building-tailor",
    "building-h-c2"
  ],
  "bedroom_candidates": [
    "room-tailor-3"
  ],
  "work": "仕立て屋",
  "relationships": [
    {
      "a": "マティアス",
      "b": "マグダレーナ",
      "kind": "取引相手",
      "note": "羊の毛を仕立て屋へ。マティアスは彼女の前だと口ごもる"
    },
    {
      "a": "マグダレーナ",
      "b": "ベアトリクス",
      "kind": "幼なじみ",
      "note": "布と鉄。正反対の二人は昔から仲がいい"
    },
    {
      "a": "ゾフィー",
      "b": "マグダレーナ",
      "kind": "友人",
      "note": "押し花の飾りを仕立て屋に頼まれる"
    },
    {
      "a": "ヘートヴィヒ",
      "b": "マグダレーナ",
      "kind": "取引相手",
      "note": "手編みの首巻きを仕立て屋に卸す"
    },
    {
      "a": "マグダレーナ",
      "b": "ロッテ",
      "kind": "師弟",
      "note": "お針子。寸法を測る手つきが師に似てきた"
    }
  ],
  "issues": [
    "寝台・個人収納のグリッド照合未完了",
    "食事・水・便所・衣服の手入れの場所照合未完了"
  ],
  "bedroom": "room-tailor-3",
  "bed_id": "bed-tailor-3-1",
  "design_dependencies": [
    "building-tailor",
    "room-tailor-3",
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-5",
    "room-h-c2-weaving",
    "room-h-c2-entry",
    "building-h-c2",
    "room-h1-3",
    "resident-ヴィルヘルム",
    "room-h1-4",
    "resident-ゾフィー"
  ],
  "storage_ids": [
    "storage-tailor-3-1"
  ],
  "routine_source": {
    "file": "world/town/routines.ts",
    "export": "ROUTINES",
    "key": "マグダレーナ"
  },
  "work_rooms": [
    "room-tailor-1",
    "room-tailor-2",
    "room-tailor-5",
    "room-h-c2-weaving",
    "room-h-c2-entry"
  ],
  "appearance_source": {
    "file": "world/town/residents.ts",
    "export": "RESIDENT_LOOKS",
    "key": "マグダレーナ"
  },
  "textile_orders": [
    {
      "id": "storage-h1-3-1:blanket-cloth:finish",
      "room": "room-h1-3",
      "cloth": "storage-h1-3-1:blanket-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "stage": "finish",
      "recipient": "resident-ヴィルヘルム",
      "status": "proposed",
      "pending": [
        "縮みと裁断・折返しの実物、作業面と納品の日課"
      ]
    },
    {
      "id": "storage-h1-4-1:blanket-cloth:finish",
      "room": "room-h1-4",
      "cloth": "storage-h1-4-1:blanket-cloth",
      "beneficiary": "resident-ゾフィー",
      "stage": "finish",
      "recipient": "resident-ゾフィー",
      "status": "proposed",
      "pending": [
        "縮みと裁断・折返しの実物、作業面と納品の日課"
      ]
    },
    {
      "id": "bed-h1-3-1:pillow:cover-cloth:finish",
      "room": "room-h1-3",
      "cloth": "bed-h1-3-1:pillow:cover-cloth",
      "beneficiary": "resident-ヴィルヘルム",
      "recipient": "resident-ヴィルヘルム",
      "stage": "finish",
      "status": "proposed",
      "pending": [
        "側布の縫目・角と着脱口、内袋との適合、作業面と仕立て・納品の日課"
      ]
    },
    {
      "id": "bed-h1-4-1:pillow:cover-cloth:finish",
      "room": "room-h1-4",
      "cloth": "bed-h1-4-1:pillow:cover-cloth",
      "beneficiary": "resident-ゾフィー",
      "recipient": "resident-ゾフィー",
      "stage": "finish",
      "status": "proposed",
      "pending": [
        "側布の縫目・角と着脱口、内袋との適合、作業面と仕立て・納品の日課"
      ]
    }
  ]
}
---
# マグダレーナ

## 暮らしの立場

マグダレーナは仕立て屋。仕立て屋のマグダレーナに属し、ロッテという世帯構成で暮らす。仕事と収入のつながりは服と首巻きの仕立て（お針子のロッテと）。毛は羊飼いから。

## 人柄と話し方

性格は気品、完璧主義、世話好き。話し方は「わたくし。丁寧な言葉づかい。「〜ですわ」は使わず「〜ですよ」」。口癖は「寸法は嘘をつきません」。

## 一日の居場所

日課の時刻・場所・行動は routine_source が指すコードの定義を正とする。活動を始める前の食事・身支度、活動中の食事、帰宅後の片付け、就寝を、建物と部屋の資料へ結び付ける。単に予定の座標へ移動できるだけで生活の成立としない。

## 寝床と持ち物

衣服、首巻き、仕事道具の個別収納を、固有の寝台の使用面と一緒に設計する。帰宅先の建物に属する仕事場と寝間を混同しない。

## 描画へ渡す条件

外見は appearance_source が指す実際の描画定義を基準とする。日課中に持つ道具、仕事着の汚れ、寒さへの備えは職業と作業場所に根拠を持たせる。部屋と動線が未確認のため、現時点では生活の整合を検証済みとしない。

## 固有の寝床

常用の寝床は [[room-tailor-3]] の bed-tailor-3-1 に割り当てる。客室や仕事場の休憩用家具を、本人の寝床の代わりに数えない。衣服、首巻き、私物の収納は storage_ids の個人区画へ割り当て、寝台の使用面と合わせて容量・開閉を照合する。

## 二人の寝台へ供給する案

[[room-h1-3#寝台の骨組みとマットレス]] と [[room-h1-4#寝台の骨組みとマットレス]] で、二人のマットレスの仕立て手として結ぶ。ベルタの側布とマティアスからの羊毛を受け、乾いた詰物を側へ収める案である。枕の側と掛布も各私室の寝具の配列へ結ぶ案へ進めるが、同時に製作・納品できた扱いにはせず、製作量と受渡し・補修の日課を続けて設計する。

textile_orders ではベルタから各人の原布を受け、使用中と替えの掛布・枕の側布をそれぞれの割当で仕立て、それぞれの本人へ渡す工程として結ぶ。裁断面の配置と実際の縮み・縁の積層、作業面と身体・納品の日課は区別する。 割当先と受取人、案の状態の規則は [[town#寝具の原布と工程の受渡し]] に従う。掛布の裁断面は [[room-h1-3#使用中と替えの掛布を裁つ布]] と [[room-h1-4#使用中と替えの掛布を裁つ布]] にある。枕の交換用の側布は別の原布として [[room-h1-3#枕の側布を交換する裁断案]] と [[room-h1-4#枕の側布を交換する裁断案]] に結ぶ。掛布の割当があることだけで側布も供給した扱いにせず、内袋と詰物の量・受渡しは別に未設計を保つ。
